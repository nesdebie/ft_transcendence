# Generated by Django 4.1.13 on 2024-07-04 11:52

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0005_message'),
    ]

    operations = [
        migrations.RenameField(
            model_name='player',
            old_name='OnlineStatus',
            new_name='online_status',
        ),
    ]
