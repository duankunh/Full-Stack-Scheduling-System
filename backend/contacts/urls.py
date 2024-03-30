from django.urls import path
from .views import contact_list_create, update_delete_contact#, send_reminder
from . import views

urlpatterns = [
    path('list/', contact_list_create, name='contact-list-create'),
    #path('remind/', send_reminder, name='meeting-reminder'),
    path('<int:contact_id>/', update_delete_contact, name='update-delete-contact')
]
