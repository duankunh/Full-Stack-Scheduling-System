from django.contrib import admin
from .models import Calendar, Meeting, Preference, Schedule

admin.site.register(Calendar)
admin.site.register(Meeting)
admin.site.register(Preference)
admin.site.register(Schedule)

# Register your models here.
