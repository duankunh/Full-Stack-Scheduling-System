from django.http import JsonResponse
from django.shortcuts import render
from .models import Calendar, Meeting, Preference, Schedule
from .serializers import CalendarSerializer, MeetingSerializer, \
    PreferenceSerializer, ScheduleSerializer, ContactInvitationsStatusSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, permissions
from datetime import timedelta, datetime, date
from django.utils import timezone
from django.urls import reverse
from django.contrib.sites.shortcuts import get_current_site
from contacts.models import Contact
from django.core.mail import send_mail
from datetime import datetime, timedelta
from collections import defaultdict


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def calendar(request):

    if request.method == 'GET':
        calendars = Calendar.objects.filter(owner=request.user)
        calendar_responses = []
        for calendar in calendars:
            meetings = calendar.meeting_set.all()
            calendar_serialized = CalendarSerializer(calendar, many=False)
            calendar_response = {
                'meetings': MeetingSerializer(meetings, many=True).data,
                **dict(calendar_serialized.data),
            }
            calendar_responses.append(calendar_response)
        # serializer = CalendarSerializer(calendars, many=True)
        return JsonResponse({'calendars': calendar_responses})

    if request.method == 'POST':
        existing_calendar = Calendar.objects.filter(owner=request.user,
                                                    name=request.data.get(
                                                        'name')).exists()
        if existing_calendar:
            return Response(
                {'detail': 'A calendar with this name already exists.'},
                status=status.HTTP_400_BAD_REQUEST)

        serializer = CalendarSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_calender(request, id):
    try:
        calendar = Calendar.objects.get(pk=id)
    except Calendar.DoesNotExist:
        return Response({
                            'detail': 'Calendar not found or you do not have permission to access it.'},
                        status=status.HTTP_404_NOT_FOUND)
        
    if request.method == 'DELETE':
        calendar.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def meeting(request, id):
    try:
        Calendar.objects.get(pk=id,
                             owner=request.user)  # Ensure the calendar belongs to the requesting user
    except Calendar.DoesNotExist:
        return Response({
            'detail': 'Calendar not found or you do not have permission to access it.'},
            status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        meetings = Meeting.objects.filter(
            calendar=id)  # Get all meeting under <id> calendar
        serializer = MeetingSerializer(meetings, many=True)
        return JsonResponse({'meetings': serializer.data})

    if request.method == 'POST':
        request.data.update({'calendar': id})
        request.data.update({'contacts': []})
        serializer = MeetingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['GET','PUT', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def one_meeting(request, id):
    try:
        meeting = Meeting.objects.get(pk=id)
    except Meeting.DoesNotExist:
        return Response({
                            'detail': 'Calendar not found or you do not have permission to access it.'},
                        status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        request.data.update({'calendar': meeting.calendar.pk})
        request.data.update({'pk': id})
        contacts_to_remind = Preference.objects.filter(meeting=id, status='Accepted')
        # Create a list to store contact IDs
        contact_ids = []

        # Iterate through contacts_to_remind and add each contact's ID to the list
        for preference in contacts_to_remind:
            contact_ids.append(preference.contact.pk)

        # Update request.data with the list of contact IDs
        request.data['contacts'] = contact_ids

        serializer = MeetingSerializer(meeting, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)
        
    if request.method == 'DELETE':
        meeting.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def preference(request, id):
    try:
        Meeting.objects.get(pk=id)
    except Meeting.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        preference = Preference.objects.filter(
            meeting=id)  # Get all preference under <id> meeting
        serializer = PreferenceSerializer(preference, many=True)
        return JsonResponse({'preference': serializer.data})

    if request.method == 'POST':
        request.data.update({'meeting': id})
        serializer = PreferenceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)
        
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def accepted_preference(request, id):
    try:
        Meeting.objects.get(pk=id)
    except Meeting.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        preference = Preference.objects.filter(
            meeting=id, status='Accepted' )  # Get all preference under <id> meeting
        serializer = PreferenceSerializer(preference, many=True)
        return JsonResponse({'preference': serializer.data})


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def set_preference(request, id, cid):
    try:
        Meeting.objects.get(pk=id)
    except Meeting.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        preference = Preference.objects.filter(
            meeting=id)  # Get all preference under <id> meeting
        serializer = PreferenceSerializer(preference, many=True)
        return JsonResponse({'preference': serializer.data})

    if request.method == 'POST':
        request.data.update({'meeting': id})
        request.data.update({'contact': cid})
        serializer = PreferenceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def schedule_proposals(request, id):
    try:
        Meeting.objects.get(pk=id)
    except Meeting.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        schedule = Schedule.objects.filter(
            meeting=id)  # Get all schedules under <id> meeting
        serializer = ScheduleSerializer(schedule, many=True)
        return JsonResponse({'proposals': serializer.data})

    if request.method == 'POST':
        request.data.update({'meeting': id})
        serializer = ScheduleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def generate_schedule(request, id):
    try:
        meeting = Meeting.objects.get(pk=id)
    except Meeting.DoesNotExist:
        return Response({'error': 'Meeting not found.'}, status=status.HTTP_404_NOT_FOUND)

    # Get all accepted preferences for the meeting
    accepted_preferences = Preference.objects.filter(meeting=meeting, status='Accepted')

    # Prepare a dictionary to count overlapping times
    overlap_counts = defaultdict(int)

    # Count overlapping times based on accepted preferences
    for preference in accepted_preferences:
        start_time = preference.start_time
        end_time = preference.end_time
        overlap_counts[(start_time, end_time)] += 1

    # Find the time slot with the most overlap
    if not overlap_counts:
        return Response({'error': 'No accepted preferences available for scheduling.'}, status=status.HTTP_400_BAD_REQUEST)

    most_overlap_times = max(overlap_counts.items(), key=lambda x: x[1])[0]
    most_overlap_start, most_overlap_end = most_overlap_times

    # Adjust the start and end datetime based on meeting date and time range from preferences
    current_date = meeting.date
    start_datetime = datetime.combine(current_date, most_overlap_start)
    end_datetime = datetime.combine(current_date, most_overlap_end)

    # Calculate meeting duration and possible meeting slots
    meeting_duration = meeting.duration.total_seconds() // 60  # Convert duration to minutes
    slot_start_time = start_datetime

    possible_slots = []
    while slot_start_time + timedelta(minutes=meeting_duration) <= end_datetime:
        slot_end_time = slot_start_time + timedelta(minutes=meeting_duration)
        possible_slots.append((slot_start_time.time(), slot_end_time.time()))
        slot_start_time += timedelta(minutes=30)  # Adjust time slot by 30 minutes

    # Create Schedule objects for the possible meeting slots
    created_schedules = []
    for start_time, end_time in possible_slots:
        schedule_data = {
            'start_time': start_time,
            'end_time': end_time,
            'meeting': meeting.id,
            'schedule_status': 'undecided'  # You can adjust the status as needed
        }
        serializer = ScheduleSerializer(data=schedule_data)
        if serializer.is_valid():
            serializer.save()
            created_schedules.append(serializer.data)

    return Response({'created_schedules': created_schedules}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def schedule_get_finalize(request, id):
    try:
        Meeting.objects.get(pk=id)
    except Meeting.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        schedule = Schedule.objects.filter(meeting=id,
                                           schedule_status='finalized')  # Get finalized schedule under <id> meeting
        serializer = ScheduleSerializer(schedule, many=True)
        return JsonResponse({'proposals': serializer.data})


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def schedule_make_finalize(request, meeting_id, schedule_id):
    try:
        meeting = Meeting.objects.get(pk=meeting_id)
    except Meeting.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    try:
        schedule = Schedule.objects.get(
            pk=schedule_id)  # Get <shcedule_id> schedules under <id> meeting
    except Schedule.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if Schedule.objects.filter(meeting=meeting,
                               schedule_status='finalized').exclude(
            pk=schedule_id).exists():
        # If there are finalized schedules, return a bad request
        return Response({
                            'error': 'There are already finalized schedules for this meeting.'},
                        status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'PUT':
        request.data.update({'meeting': meeting_id})
        serializer = ScheduleSerializer(schedule, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def preference_update(request, meeting_id, preference_id):
    try:
        Meeting.objects.get(pk=meeting_id)
    except Meeting.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    try:
        preference = Preference.objects.get(pk=preference_id)
    except Preference.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        request.data.update({'meeting': meeting_id})
        serializer = PreferenceSerializer(preference, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def invite(request, meeting_id, contact_id):
    try:
        contact = Contact.objects.get(pk=contact_id)
        meeting = Meeting.objects.get(pk=meeting_id)
    except (Contact.DoesNotExist, Meeting.DoesNotExist) as e:
        return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Assume default start_time and end_time for the sake of example
        # These should be replaced with real logic to determine appropriate times
        default_start_time = timezone.now().replace(hour=9, minute=0, second=0,
                                                    microsecond=0).time()

        default_end_time = timezone.now().replace(hour=17, minute=0, second=0,
                                                  microsecond=0).time()

        preference_data = {
            'start_time': default_start_time,
            'end_time': default_end_time,
            'meeting': meeting.pk,
            'contact': contact.pk,
            'status': 'Pending',
            # Assuming you want to set the status to Pending when inviting
        }
        serializer = PreferenceSerializer(data=preference_data)
        if serializer.is_valid():
            serializer.save()

            # Construct the URL
            current_site = get_current_site(request)
            preference_url = reverse('set_preference', kwargs={'id': meeting_id,
                                                               'cid': contact_id})
            full_url = 'http://{}{}'.format(current_site.domain, preference_url)

            # Now send the email, including the URL
            email_body = 'You have been invited to a meeting. Please check your preferences and confirm your availability here: {}'.format(
                full_url
            )
            send_mail(
                'Meeting Invite',
                email_body,
                'csc309testp2@gmail.com',
                [contact.email],
                fail_silently=False,
            )
            return Response(
                {"message": "Preference saved and invite sent successfully"},
                status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors,
                            status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def remind(request, id):
    contacts_to_remind = Preference.objects.filter(meeting=id, status='Pending')
    for preference in contacts_to_remind:
        send_mail(
            'Meeting Reminder',
            'This is a reminder to provide the requested information.',
            'csc309testp2@gmail.com',
            [preference.contact.email],
            fail_silently=False,
        )
    return Response({"message": "Reminders sent successfully"},
                    status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def contact_invitations_status(request):
    if request.method == 'GET':
        contacts = Contact.objects.all()
        serializer = ContactInvitationsStatusSerializer(contacts, many=True)
        return JsonResponse({'contacts': serializer.data})

# for testing the implementation of suggested schedule
####################
####################
