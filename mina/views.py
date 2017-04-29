import json
from datetime import datetime
import stripe
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render, redirect

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
        meetings = Booking.objects.filter(start__gte=request.GET.get('from_date'),
                                          end__lte=request.GET.get('to_date'))
        dataobj = []
        print(datetime.now())
        for meeting in meetings:
            if meeting.user == request.user and meeting.start > datetime.now():
                extendability = {
                    "start": meeting.start.strftime('%Y-%m-%d %H:%M:%S'),
                    "end": meeting.end.strftime('%Y-%m-%d %H:%M:%S'),
                    "type": meeting.book_type,
                    "location": meeting.class_location,
                    "title": 'Booked - (%s)' % meeting.book_type,
                    "allDay": False,
                    "startEditable": True,
                    "meeting_id": meeting.id
                }
            else:
                extendability = {
                    "start": meeting.start.strftime('%Y-%m-%d %H:%M:%S'),
                    "end": meeting.end.strftime('%Y-%m-%d %H:%M:%S'),
                    "type": meeting.book_type,
                    "location": meeting.class_location,
                    "title": 'Unavailable',
                    "allDay": False,
                    "color": "#555555",
                }
            if request.user.is_superuser:
                extendability['title'] = meeting.user.get_full_name()
            dataobj.append(extendability)
    else:
        dataobj = {'data': 'None'}
    return JsonResponse(dataobj, safe=False)


@login_required
def change_meeting(request):
    if request.method == "POST" and request.user.is_authenticated:
        meeting = Booking.objects.get(id=request.GET.get('meeting_id'))
        meeting_obj = {
            "start": request.POST.get('start'),
            "end": request.POST.get('end'),
            "book_type": meeting.book_type,
            "class_location": meeting.class_location,
            "transaction_amount": meeting.transaction_amount,
            "transaction_id": meeting.transaction_id
        }
        book_form = BookingForm(meeting_obj, instance=meeting)
        if book_form.is_valid():
            book_form.save()
            data = {'status': "success"}
        else:
            data = {'status': 'failed'}
        return JsonResponse(data)
