# Generated by Django 3.2 on 2024-04-09 05:22

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('scheduler', '0009_alter_meeting_contacts'),
    ]

    operations = [
        migrations.AlterField(
            model_name='schedule',
            name='meeting',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='schedules', to='scheduler.meeting'),
        ),
    ]
