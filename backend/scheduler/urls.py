"""P2 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from . import views
from .views import contact_invitations_status

urlpatterns = [
    path('user_schedules/', views.user_schedules),
    path('calendars/', views.calendar),
    path('calendars/<int:id>/', views.delete_calender),
    path('calendars/<int:id>/initiate_meeting/', views.meeting),
    path('meetings/<int:id>/', views.one_meeting),
    path('meetings/<int:id>/set_preference/', views.preference),
    path('meetings/<int:id>/accepted_preference/', views.accepted_preference),
    path('meetings/<int:id>/set_preference/<int:cid>/', views.set_preference, name='set_preference'),
    path('meetings/<int:id>/proposals/', views.schedule_proposals),
    path('meetings/<int:id>/generate_schedule/', views.generate_schedule),
    path('meetings/<int:id>/finalized/', views.schedule_get_finalize),
    path('meetings/<int:meeting_id>/finalized/<int:schedule_id>/', views.schedule_make_finalize),
    path('meetings/<int:meeting_id>/preference/<int:preference_id>/', views.preference_update),
    path('meetings/<int:meeting_id>/invite/<int:contact_id>/', views.invite),
    path('meetings/<int:id>/remind/', views.remind),
    path('invitations-status/', contact_invitations_status,
         name='contact-invitations-status'),
]
