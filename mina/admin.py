from django.contrib import admin

from .models import Booking, Files


class BookingAdmin(admin.ModelAdmin):
    model = Booking
    list_display = [
        'user',
        'book_type',
        'class_location',
        'start',
        'end',
        'transaction_amount',
        'created_at',
    ]


class FilesAdmin(admin.ModelAdmin):
    model = Files
    list_display = [
        'to_user',
        'file',
        'created_at',
    ]


admin.site.register(Booking, BookingAdmin)

admin.site.register(Files, FilesAdmin)
