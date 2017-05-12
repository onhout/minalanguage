import json
import os
from datetime import datetime, timedelta

import requests
import stripe
from decouple import config
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.db.models import Sum
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from .forms import BookingForm, FileForm
from .models import Booking, Files


# Create your views here.

def user_login(request):
    if request.user.is_authenticated and not request.user.is_anonymous:
        return redirect('book_meeting')
    else:
        return render(request, 'index.html', {
        })


def user_logout(request):
    auth_logout(request)
    return redirect('user_login')


def send_message(request):
    recaptcha = request.POST.get('g-recaptcha-response')
    r = requests.post('https://www.google.com/recaptcha/api/siteverify', {
        "response": recaptcha,
        "secret": "6Ld55iAUAAAAALrIF3nwtqeMUruRckJvQ6F3-VeI"
    })
    if request.method == "POST" and request.POST.get('email') and r.json()['success'] is True:
        person = request.POST.get('person')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = "(%s:%s) sent you the following message: \"%s\"" % (person, email, request.POST.get('message'))
        send_mail(
            subject,
            message,
            'admin@minajeong.com',
            ['zxoct11@gmail.com'],
            fail_silently=False, )
    return redirect('/')


@login_required
def book_meeting(request):
    if 'STRIPE_SECRET_KEY' in os.environ:
        stripe.api_key = os.environ['STRIPE_SECRET_KEY']
    else:
        stripe.api_key = config('STRIPE_SECRET_KEY')
    try:
        next_meeting = Booking.objects.filter(user=request.user, start__gt=datetime.today())[0]
    except:
        next_meeting = 'none'
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
                msg_html = render_to_string('email_templates/new_meeting.html', {
                    "name": request.user.get_full_name(),
                    "start": datetime.strptime(booking["start"], '%Y-%m-%d %H:%M:%S'),
                    "end": datetime.strptime(booking["end"], '%Y-%m-%d %H:%M:%S'),
                    "book_type": booking["book_type"]
                })
                message = strip_tags(msg_html)
                email_list = ['zxoct11@gmail.com', request.user.email]
                for email in email_list:
                    send_mail(
                        'Thank you for booking a meeting',
                        message,
                        'noreply@minajeong.com',
                        [email],
                        html_message=msg_html,
                        fail_silently=False, )
                form = book_form.save(commit=False)
                form.client_ip = json_loads["stripeToken"]["client_ip"]
                form.transaction_id = charge["id"]
                form.transaction_amount = booking["transaction_amount"]
                form.user = request.user
                form.save()

        return redirect('book_meeting')
    return render(request, 'meeting/book.html', {
        'next_meeting': next_meeting
    })


@login_required
def remove_meeting(request, booking_id):
    if request.user.is_superuser:
        Booking.objects.get(id=booking_id).delete()
        return redirect('list_meetings')
    return redirect('/')


@login_required
def super_book_meeting(request):
    if request.method == 'POST' and request.user.is_superuser:
        book_form = BookingForm(request.POST)
        if book_form.is_valid():
            form = book_form.save(commit=False)
            form.user = request.user
            form.save()
            return JsonResponse({"status": "success"})
        return JsonResponse({"status": "failed"})


@login_required
def list_meetings(request):
    if request.user.is_superuser:
        meeting_list = Booking.objects.all()
    else:
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
        for meeting in meetings:
            if request.user.is_superuser:
                extendability = {
                    "start": meeting.start.strftime('%Y-%m-%d %H:%M:%S'),
                    "end": meeting.end.strftime('%Y-%m-%d %H:%M:%S'),
                    "type": meeting.book_type,
                    "location": meeting.class_location,
                    "title": 'Booked - (%s)' % meeting.book_type,
                    "allDay": False,
                    "editable": True,
                    "meeting_id": meeting.id,
                    "is_admin": request.user.is_superuser
                }
            elif meeting.user == request.user and (meeting.start + timedelta(hours=2)) > datetime.now():
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
                extendability['title'] = "Booked %s - %s" % (meeting.book_type, meeting.user.get_full_name())
            if request.user.is_superuser and meeting.user == request.user:
                extendability['color'] = '#654321'
            dataobj.append(extendability)
    else:
        dataobj = {'data': 'None'}
    return JsonResponse(dataobj, safe=False)


@login_required
def change_meeting(request):
    if request.method == "POST" and request.user.is_authenticated:
        meeting = Booking.objects.get(id=request.GET.get('meeting_id'))
        meeting_start_orig = meeting.start
        meeting_end_orig = meeting.end
        meeting_booktype_orig = meeting.book_type
        meeting_location_orig = meeting.class_location
        meeting_obj = {
            "start": request.POST.get('start') or datetime.strftime(meeting.start, '%Y-%m-%d %H:%M:%S'),
            "end": request.POST.get('end') or datetime.strftime(meeting.end, '%Y-%m-%d %H:%M:%S'),
            "book_type": request.POST.get('book_type') or meeting.book_type,
            "class_location": request.POST.get('location') or meeting.class_location,
            "transaction_amount": meeting.transaction_amount,
            "transaction_id": meeting.transaction_id
        }
        book_form = BookingForm(meeting_obj, instance=meeting)
        if book_form.is_valid():
            msg_html = render_to_string('email_templates/meeting_changed.html', {
                "name": meeting.user.get_full_name(),
                "meeting_start_orig": meeting_start_orig,
                "meeting_end_orig": meeting_end_orig,
                "start": datetime.strptime(meeting_obj["start"], '%Y-%m-%d %H:%M:%S'),
                "end": datetime.strptime(meeting_obj["end"], '%Y-%m-%d %H:%M:%S'),
                "meeting_booktype_orig": meeting_booktype_orig,
                "book_type": meeting_obj["book_type"],
                "meeting_location_orig": meeting_location_orig,
                "location": meeting_obj["class_location"]
            })
            message = strip_tags(msg_html)
            email_list = ['zxoct11@gmail.com', meeting.user.email]
            for email in email_list:
                send_mail(
                    'Your meeting with Mina Jeong has changed',
                    message,
                    'noreply@minajeong.com',
                    [email],
                    html_message=msg_html,
                    fail_silently=False, )
            book_form.save()
            data = {'status': "success"}
        else:
            data = {'status': 'failed'}
        return JsonResponse(data)


@login_required
def file_list(request):
    files = Files.objects.filter(to_user=request.user)
    return render(request, 'files/list_files.html', {
        "file_list": files
    })


@login_required
def manage_files(request):
    if request.user.is_superuser:
        users = User.objects.exclude(id=request.user.id).order_by('first_name')
        for user in users:
            user.totalFiles = Files.objects.filter(to_user=user).count()
            user.totalPaid = Booking.objects.filter(user=user).aggregate(totalPaid=Sum('transaction_amount'))
        return render(request, 'files/manage_files.html', {
            'user_list': users
        })
    else:
        return redirect('/')


@login_required
def manage_user_files(request, user_id):
    if request.user.is_superuser:
        user = User.objects.get(id=user_id)
        files = Files.objects.filter(to_user=user).order_by('-created_at')
        return render(request, 'files/manage_user_files.html', {
            "file_list": files,
            "this_user": user
        })
    else:
        return redirect('/')


@login_required
def upload_files(request, user_id):
    user = User.objects.get(id=user_id)
    if request.method == "POST" and request.user.is_superuser:
        file_form = FileForm(request.POST, request.FILES)
        if file_form.is_valid():
            form = file_form.save(commit=False)
            form.name = request.FILES['file'].name
            form.to_user = user
            form.save()
            data = {
                'status': 'success',
                'file_name': request.FILES['file'].name,
                'uploaded_at': datetime.now().strftime('%B %d, %Y, %I:%M %p'),
                'url': 'http://minalanguage.s3.amazonaws.com/' + str(form.file),
                'file_id': form.id
            }
        else:
            data = {'status': 'failed'}
        return JsonResponse(data)
    return redirect('/')


@login_required
def delete_file(request, file_id):
    if request.user.is_superuser:
        Files.objects.get(id=file_id).delete()
        data = {'success': True}
        return JsonResponse(data)
