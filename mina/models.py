from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from uuid import uuid4


# Create your models here.

class Booking(models.Model):
    TYPE = (
        ('online', 'Online'),
        ('in-person', 'In Person')
    )
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='booked_user')
    book_type = models.CharField(max_length=10, choices=TYPE, null=True, blank=True)
    start = models.DateTimeField()
    end = models.DateTimeField()
    class_location = models.CharField(max_length=255, null=True, blank=True, default="Walnut Creek, CA")
    transaction_id = models.CharField(max_length=50, null=True, blank=True)
    transaction_amount = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['start']


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return './static/files/user_{0}/{1}'.format(instance.to_user.id, filename)


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
