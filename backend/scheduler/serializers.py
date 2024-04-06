from rest_framework import serializers
from .models import Calendar, Meeting, Preference, Schedule
from contacts.models import Contact

class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calendar
        fields = ['id', 'name', 'owner']
        read_only_fields = ['owner']


class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = ['id', 'name', 'date', 'duration', 'calendar', 'contacts']


class PreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Preference
        fields = ['id', 'start_time', 'end_time', 'preference_level', 'meeting', 'contact', 'status']


class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = ['id', 'start_time', 'end_time', 'schedule_status', 'meeting']


class ContactMeetingPreferenceSerializer(serializers.ModelSerializer):
    meeting_name = serializers.CharField(source='meeting.name')
    status_display = serializers.CharField(source='get_status_display')

    class Meta:
        model = Preference
        fields = ('meeting_name', 'status_display')


class ContactInvitationsStatusSerializer(serializers.ModelSerializer):
    preferences_status = ContactMeetingPreferenceSerializer(source='preference_set', many=True)

    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'preferences_status']



