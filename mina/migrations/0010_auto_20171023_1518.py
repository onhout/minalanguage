# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-10-23 15:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('mina', '0009_profile_new_student'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='profile_photo',
            field=models.FileField(upload_to='./media/profile_pics'),
        ),
    ]