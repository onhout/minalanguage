from django.contrib import admin

from .models import Booking, Files, Customer, Outline, Progress, RelatedFiles


class BookingAdmin(admin.ModelAdmin):
    model = Booking
    list_display = [
        'user',
        'book_type',
        'class_type',
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
        'name',
        'file',
        'created_at',
    ]


class CustomerAdmin(admin.ModelAdmin):
    model = Files
    list_display = [
        'user',
        'customer_email',
        'customer_id',
        'total_paid',
    ]


class OutlineAdmin(admin.ModelAdmin):
    model = Files
    list_display = [
        'name',
        'program',
        'teacher',
        'parent',
    ]


class ProgressAdmin(admin.ModelAdmin):
    model = Files
    list_display = [
        'outline',
        'passed',
        'student',
    ]


class RelatedFilesAdmin(admin.ModelAdmin):
    model = Files
    list_display = [
        'outline',
        'booking',
        'file',
    ]


admin.site.register(Booking, BookingAdmin)
admin.site.register(Files, FilesAdmin)
admin.site.register(Customer, CustomerAdmin)
admin.site.register(Outline, OutlineAdmin)
admin.site.register(Progress, ProgressAdmin)
admin.site.register(RelatedFiles, RelatedFilesAdmin)
