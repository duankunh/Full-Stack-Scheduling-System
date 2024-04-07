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
from collections import Counter


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
        
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def all_meetings(request):
    try:
        calendars = Calendar.objects.filter(owner=request.user)  # Ensure the calendar belongs to the requesting user
    except Calendar.DoesNotExist:
        return Response({
            'detail': 'Calendar not found or you do not have permission to access it.'},
            status=status.HTTP_404_NOT_FOUND)

        # Get all finalized schedules for these meetings
    finalized_schedules = []
    for calendar in calendars:
        meetings = Meeting.objects.filter(calendar=calendar.pk)
        serializer = MeetingSerializer(meetings, many=True)
        return JsonResponse({'meetings': serializer.data})
        
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_schedules(request):
    # Get all calendars owned by the authenticated user
    calendars = Calendar.objects.filter(owner=request.user)

    # Get all finalized schedules for these meetings
    finalized_schedules = []
    for calendar in calendars:
        meetings = Meeting.objects.filter(calendar=calendar.pk)
        for meeting in meetings:
            schedule = Schedule.objects.filter(meeting=meeting.pk, schedule_status='finalized')
            finalized_schedules.extend(schedule)

    # Serialize the finalized schedules
    serialized_schedules = []
    for schedule in finalized_schedules:
        schedule_data = {
            'start_time': schedule.start_time.strftime('%H:%M'),
            'end_time': schedule.end_time.strftime('%H:%M'),
            'schedule_status': schedule.schedule_status,
            'meeting':schedule.meeting.pk
        }
        serializer = ScheduleSerializer(data=schedule_data)
        if serializer.is_valid():
            serialized_schedules.append(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({'created_schedules': serialized_schedules}, status=status.HTTP_201_CREATED)
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

    # First, delete existing schedules for this meeting.
    Schedule.objects.filter(meeting=meeting).delete()

    # Fetch all accepted preferences for the meeting.
    accepted_preferences = Preference.objects.filter(meeting=meeting, status='Accepted').values(
        'start_time', 'end_time'
    )

    # Initialize a list to hold start and end times of all slots considered.
    time_slots = []
    for pref in accepted_preferences:
        start_time = datetime.combine(meeting.date, pref['start_time'])
        end_time = datetime.combine(meeting.date, pref['end_time'])
        # Adjust the loop to consider the meeting's duration and increment in steps.
        while start_time + meeting.duration <= end_time:
            time_slots.append((start_time, start_time + meeting.duration))
            start_time += timedelta(minutes=15)  # Increment by 15 minutes for granularity.

    # Count overlaps for each slot.
    overlap_count = Counter(time_slots)
    if not overlap_count:
        return Response({'error': 'No accepted preferences available.'}, status=status.HTTP_400_BAD_REQUEST)

    # Identify the maximum overlap value.
    max_overlap = max(overlap_count.values())

    # Filter slots to only those with the maximum overlap.
    max_overlap_slots = [slot for slot, count in overlap_count.items() if count == max_overlap]

    # Proceed to create schedules only for those slots with the highest overlap.
    created_schedules = []
    for start, end in max_overlap_slots:
        schedule_data = {
            'start_time': start.time(),
            'end_time': end.time(),
            'meeting': id,
            'schedule_status': 'undecided'
        }
        serializer = ScheduleSerializer(data=schedule_data)
        if serializer.is_valid():
            serializer.save()
            created_schedules.append(serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        request.data.update({'schedule_status':'finalized'})
        serializer = ScheduleSerializer(schedule, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['PUT'])
@permission_classes([permissions.IsAuthenticated])
def schedule_make_unfinalize(request, meeting_id, schedule_id):
    try:
        meeting = Meeting.objects.get(pk=meeting_id)
    except Meeting.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    try:
        schedule = Schedule.objects.get(
            pk=schedule_id)  # Get <shcedule_id> schedules under <id> meeting
    except Schedule.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        request.data.update({'schedule_status':'undecided'})
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
            preference = Preference.objects.\
                filter(meeting=meeting, contact=contact).order_by('-id').first()

            # Construct the URL
            current_site = get_current_site(request)
            preference_url = reverse('set_preference', kwargs={'id': meeting_id,
                                                               'cid': preference.id})
            full_url = 'http://{}{}'.format('localhost:5173', preference_url)

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
def final_schedule_reminder(request, id):
    schedule = Schedule.objects.get(meeting=id,
                                           schedule_status='finalized')  # Get finalized schedule under <id> meeting
    contacts_to_remind = Preference.objects.filter(meeting=id, status='Accepted')
    for preference in contacts_to_remind:
        meeting_name = schedule.meeting.name
        start_time = schedule.start_time
        end_time = schedule.end_time
        contact_email = preference.contact.email

        # Construct the email message with meeting information
        message = (
            f"Hi {preference.contact.name},\n\n"
            f"This is a reminder for your scheduled meeting '{meeting_name}'.\n"
            f"The meeting is scheduled from {start_time} to {end_time}.\n\n"
            f"Please be prepared and provide any requested information.\n\n"
            "Thank you"
        )
        send_mail(
            'Meeting Reminder',
            message,
            'csc309testp2@gmail.com',
            [preference.contact.email],
            fail_silently=False,
        )
    return Response({"message": "Final schedule reminders sent successfully"},
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
