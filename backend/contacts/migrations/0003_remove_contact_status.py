# Generated by Django 3.2 on 2024-03-13 17:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('contacts', '0002_contact_status'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='contact',
            name='status',
        ),
    ]
