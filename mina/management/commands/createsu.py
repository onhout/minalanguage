import os
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    def handle(self, *args, **options):
        if 'ADMIN_SECRET_PW' in os.environ:
            pw = os.environ['ADMIN_SECRET_PW']
        else:
            pw = 'admin'
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser("admin", "admin@admin.com", pw)
