from django.forms import ModelForm

from .models import Booking, Files, Outline


class BookingForm(ModelForm):
    class Meta:
        model = Booking
        exclude = ['item', 'user']


class FileForm(ModelForm):
    class Meta:
        model = Files
        fields = ['file']
        exclude = ['to_user']


class OutlineForm(ModelForm):
    class Meta:
        model = Outline
        exclude = ['teacher']

    def __init__(self, *args, **kwargs):
        super(OutlineForm, self).__init__(*args, **kwargs)
        self.fields['name'].widget.attrs['placeholder'] = 'Outline name'
        for field in self.fields:
            self.fields[field].widget.attrs['class'] = 'form-control'
