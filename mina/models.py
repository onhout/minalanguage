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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='booked_user')
    book_type = models.CharField(max_length=10, choices=TYPE)
    booked_time_start = models.DateTimeField()
    booked_time_end = models.DateTimeField()
    class_location = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


def user_directory_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return './static/files/user_{0}/{1}'.format(instance.user.id, filename)


class Files(models.Model):
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='file_to_user')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    file = models.FileField(upload_to=user_directory_path)


@receiver(post_delete, sender=Files)
def file_delete(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(False)
