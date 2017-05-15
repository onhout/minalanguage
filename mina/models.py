import os
from datetime import datetime
from uuid import uuid4

from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver


# Create your models here.

class Booking(models.Model):
    TYPE = (
        ('online', 'Online'),
        ('in-person', 'In Person')
    )
    CLASS_TYPE = (
        ('chinese', 'Chinese'),
        ('korean', 'Korean')
    )
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='booked_user')
    book_type = models.CharField(max_length=10, choices=TYPE, null=True, blank=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    repeat = models.BooleanField(default=False)
    class_type = models.CharField(max_length=10, null=True, blank=True, choices=CLASS_TYPE)
    class_location = models.CharField(max_length=255, null=True, blank=True, default="Walnut Creek, CA")
    transaction_id = models.CharField(max_length=50, null=True, blank=True)
    transaction_amount = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start']

    @property
    def is_in_past(self):
        return datetime.now() > self.end


def user_directory_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = "%s.%s" % (uuid4(), ext)
    return os.path.join('./files/', filename)


class Files(models.Model):
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='file_to_user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    file = models.FileField(upload_to=user_directory_path)
    name = models.CharField(max_length=255, null=True, blank=True)


@receiver(post_delete, sender=Files)
def file_delete(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(False)


class Customer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="customer")
    customer_id = models.CharField(max_length=50, blank=True, null=True)
    customer_email = models.CharField(max_length=50, blank=True, null=True)
    total_paid = models.IntegerField(null=True, blank=True)
