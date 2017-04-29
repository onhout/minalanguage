from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.core import serializers
from django.http import JsonResponse
from django.shortcuts import render, redirect
import json
from .forms import BookingForm
import stripe
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
    stripe.api_key = 'sk_test_diYxzPnCnRNeO2xsGiamiwLb'
    if request.method == "POST" and request.user.is_authenticated:
        json_loads = json.loads(request.POST.get('booking'))
        charge = stripe.Charge.create(
            source=json_loads["stripeToken"]['id'],
            currency="usd",
            description="Mina's Language Class",
            amount=json_loads["cost"],
            metadata={"order_from": request.user.get_full_name()}
        )

        for booking in json_loads["bookings"]:
            book_form = BookingForm(booking)
            if book_form.is_valid():
                form = book_form.save(commit=False)
                form.client_ip = json_loads["stripeToken"]["client_ip"]
                form.transaction_id = charge["id"]
                form.transaction_amount = charge["amount"]
                form.user = request.user
                form.save()
        return redirect('book_meeting')
    return render(request, 'meeting/book.html', {})


@login_required
def list_meetings(request):
    meeting_list = Booking.objects.filter(user=request.user)

    return render(request, 'meeting/list.html', {
        'meetings': meeting_list
    })


@login_required
def get_all_meetings(request):
    if request.GET.get('from_date') and request.GET.get('to_date'):
        meetings = Booking.objects.filter(user=request.user,
                                          start__gte=request.GET.get('from_date'),
                                          end__lte=request.GET.get('to_date'))
        sxs = serializers.serialize('json', meetings,
                                    fields=('book_type', 'start', 'end', 'class_location'))
        dataobj = []
        for meeting in meetings:
            extendability = {
                "start": meeting.start.strftime('%Y-%m-%d %H:%M:%S'),
                "end": meeting.end.strftime('%Y-%m-%d %H:%M:%S'),
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
