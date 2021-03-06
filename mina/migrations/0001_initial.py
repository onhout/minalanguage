# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-04-30 18:09
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import mina.models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Booking',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('book_type', models.CharField(blank=True, choices=[('online', 'Online'), ('in-person', 'In Person')], max_length=10, null=True)),
                ('start', models.DateTimeField()),
                ('end', models.DateTimeField()),
                ('class_location', models.CharField(blank=True, default='Walnut Creek, CA', max_length=255, null=True)),
                ('transaction_id', models.CharField(blank=True, max_length=50, null=True)),
                ('transaction_amount', models.IntegerField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='booked_user', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['start'],
            },
        ),
        migrations.CreateModel(
            name='Files',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('file', models.FileField(upload_to=mina.models.user_directory_path)),
                ('name', models.CharField(blank=True, max_length=255, null=True)),
                ('to_user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='file_to_user', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
