# -*- coding: utf-8 -*-
# Generated by Django 1.11 on 2017-05-14 16:41
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mina', '0003_customer'),
    ]

    operations = [
        migrations.AddField(
            model_name='customer',
            name='subscribed',
            field=models.BooleanField(default=False),
        ),
    ]
