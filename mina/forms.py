from django.forms import ModelForm

from .models import Booking, Files


class BookingForm(ModelForm):
    class Meta:
        model = Booking
        exclude = ['item', 'user']


class FileForm(ModelForm):
    class Meta:
        model = Files
        fields = ['file']
        exclude = ['to_user']
