from django.db import models
from django.conf import settings
# from scheduler.models import Meeting
class Contact(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=100)
    email = models.EmailField()

    # meetings = models.ManyToManyField(Meeting, related_name='contacts')

    def __str__(self):
        return self.name

    class Meta:
        app_label = 'contacts'
