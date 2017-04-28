from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.http import JsonResponse
from django.shortcuts import render, redirect
from datetime import datetime
from .forms import BookingForm
from .models import Booking


# Create your views here.

def user_login(request):
    if request.user.is_authenticated and not request.user.is_anonymous:
        return redirect('/')
    else:
        return render(request, 'user_login.html', {})


@login_required
def user_home(request):
    return render(request, 'home.html', {})


def user_logout(request):
    auth_logout(request)
    return redirect('user_login')


@login_required
def book_meeting(request):
    if request.POST and request.user.is_authenticated:
        book_form = BookingForm(request.POST)
        if book_form.is_valid():
            form = book_form.save(commit=False)
            form.user = request.user
            form.save()
            return redirect('book_meeting')
    return render(request, 'meeting/book.html', {})


@login_required
def get_all_meetings(request):
    if request.GET.get('from_date') and request.GET.get('to_date'):
        meetings = Booking.objects.filter(user=request.user,
                                          booked_time_start__gte=request.GET.get('from_date'),
                                          booked_time_end__lte=request.GET.get('to_date'))
        sxs = serializers.serialize('json', meetings,
                                    fields=('book_type', 'booked_time_start', 'booked_time_end', 'class_location'))
        dataobj = []
        for meeting in meetings:
            extendability = {
                "start": meeting.booked_time_start.strftime('%Y-%m-%d %H:%M:%S'),
                "end": meeting.booked_time_end.strftime('%Y-%m-%d %H:%M:%S'),
                "type": meeting.book_type,
                "location": meeting.class_location,
                "title": 'Unavailable',
                "allDay": False,
                "color": "#555555"
            }
            if request.user.is_superuser:
                extendability['title'] = meeting.user.get_full_name()
            dataobj.append(extendability)
    else:
        dataobj = {'data': 'None'}
    return JsonResponse(dataobj, safe=False)
