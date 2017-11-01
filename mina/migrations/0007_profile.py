# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-10-23 14:23
from __future__ import unicode_literals

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('mina', '0006_outline_progress_relatedfiles'),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('locale', models.CharField(blank=True, max_length=10, null=True)),
                ('social_id', models.CharField(blank=True, max_length=255)),
                ('login_type', models.CharField(blank=True, max_length=10, null=True)),
                ('profile_photo', models.ImageField(upload_to='./static/media/profile_pics')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile',
                                              to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]