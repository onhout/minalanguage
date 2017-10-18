import json
import os
import random
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
from django.utils.text import slugify

from .forms import BookingForm, FileForm, OutlineForm
from .models import Booking, Files, Customer, Outline, Progress, RelatedFiles

NAVER_CLIENT_ID = config('NAVER_CLIENT_ID')
NAVER_CLIENT_SECRET = config('NAVER_CLIENT_SECRET')


# Create your views here.

def user_login(request):
    if request.user.is_authenticated and not request.user.is_anonymous:
        return redirect('user_home')
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
        subject = "Message received on MinaJeong.com"
        message = "(%s:%s) sent you the following message: \n Subject: \"%s\" \n Message: \"%s\"" % (
            person, email, request.POST.get('subject'), request.POST.get('message'))
        send_mail(
            subject,
            message,
            'admin@minajeong.com',
            ['zxoct11@gmail.com', 'onhout@gmail.com'],
            fail_silently=False, )
    return redirect('/')


@login_required
def book_meeting(request):
    if 'STRIPE_SECRET_KEY' in os.environ:
        stripe.api_key = os.environ['STRIPE_SECRET_KEY']
    else:
        stripe.api_key = config('STRIPE_SECRET_KEY')
    if request.method == "POST" and request.user.is_authenticated:
        json_loads = json.loads(request.POST.get('booking'))
        charge = stripe.Charge.create(
            source=json_loads["stripeToken"]['id'],
            currency="usd",
            description="Mina's Language Class",
            amount=json_loads["cost"],
            metadata={"order_from": request.user.get_full_name()}
        )
        obj, customer = Customer.objects.get_or_create(user=request.user)
        if charge["status"] == "succeeded":
            if obj.customer_id is None:
                obj.customer_email = charge["source"]["name"]
                obj.save()
            for booking in json_loads["bookings"]:
                book_form = BookingForm(booking)
                if book_form.is_valid():
                    msg_html = render_to_string('email_templates/new_meeting.html', {
                        "name": request.user.get_full_name(),
                        "start": datetime.strptime(booking["start"], '%Y-%m-%d %H:%M:%S'),
                        "end": datetime.strptime(booking["end"], '%Y-%m-%d %H:%M:%S'),
                        "class_type": booking["class_type"],
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

        return redirect('show_calendar')


@login_required
def subscribe(request):
    if 'STRIPE_SECRET_KEY' in os.environ:
        stripe.api_key = os.environ['STRIPE_SECRET_KEY']
    else:
        stripe.api_key = config('STRIPE_SECRET_KEY')
    if request.method == "POST" and request.user.is_authenticated:
        json_loads = json.loads(request.POST.get('booking'))
        obj, customer = Customer.objects.get_or_create(user=request.user)
        if obj.customer_id is None:
            stripe_customer = stripe.Customer.create(
                description="minajeong.com student: %s" % request.user.get_full_name(),
                email=request.user.email or None,
                source=json_loads["stripeToken"]["id"]
            )
            obj.customer_id = stripe_customer.stripe_id
            obj.save()
        else:
            stripe_customer = stripe.Customer.retrieve(obj.customer_id)

        sub = stripe.Subscription.create(
            customer=stripe_customer.id,
            plan="month_plan"
        )
        if sub.status == "active":
            for booking in json_loads["bookings"]:
                msg_html = render_to_string('email_templates/new_sub.html', {
                    "name": request.user.get_full_name(),
                    "start": datetime.strptime(booking["start"], '%Y-%m-%d %H:%M:%S'),
                    "end": datetime.strptime(booking["end"], '%Y-%m-%d %H:%M:%S'),
                    "class_type": booking["class_type"],
                    "book_type": booking["book_type"]
                })
                message = strip_tags(msg_html)
                email_list = ['zxoct11@gmail.com', request.user.email]
                for email in email_list:
                    send_mail(
                        'Thank you for subscribing!',
                        message,
                        'noreply@minajeong.com',
                        [email],
                        html_message=msg_html,
                        fail_silently=False, )
                for i in range(52):
                    start_time = datetime.strptime(booking["start"], '%Y-%m-%d %H:%M:%S') + timedelta(days=(i * 7))
                    end_time = datetime.strptime(booking["end"], '%Y-%m-%d %H:%M:%S') + timedelta(days=(i * 7))
                    book_form = BookingForm(booking)
                    if book_form.is_valid():
                        form = book_form.save(commit=False)
                        form.start = start_time
                        form.end = end_time
                        form.repeat = True
                        form.transaction_id = sub["id"]
                        form.transaction_amount = 100
                        form.user = request.user
                        form.save()
        return redirect('show_calendar')


@login_required
def unsubscribe(request, trans_id):
    if 'STRIPE_SECRET_KEY' in os.environ:
        stripe.api_key = os.environ['STRIPE_SECRET_KEY']
    else:
        stripe.api_key = config('STRIPE_SECRET_KEY')
    sub = Booking.objects.filter(transaction_id=trans_id)[0]
    if sub.user == request.user or request.user.is_staff:
        stripe_sub = stripe.Subscription.retrieve(trans_id)
        Booking.objects.filter(transaction_id=trans_id).delete()
        stripe_sub.delete()
        msg_html = render_to_string('email_templates/lost_sub.html', {
            "name": request.user.get_full_name()
        })
        message = strip_tags(msg_html)
        email_list = ['zxoct11@gmail.com', request.user.email]
        for email in email_list:
            send_mail(
                'Sorry to see you go.',
                message,
                'noreply@minajeong.com',
                [email],
                html_message=msg_html,
                fail_silently=False, )
        return redirect('list_meetings')
    return redirect('/')


@login_required
def show_calendar(request):
    try:
        next_meeting = Booking.objects.filter(user=request.user, start__gt=datetime.today())[0]
    except:
        next_meeting = 'none'
    return render(request, 'meeting/book.html', {
        'next_meeting': next_meeting
    })


@login_required
def remove_meeting(request, booking_id):
    if request.user.is_staff:
        Booking.objects.get(id=booking_id).delete()
        return redirect('list_meetings')
    return redirect('/')


@login_required
def super_book_meeting(request):
    if request.method == 'POST' and request.user.is_staff:
        book_form = BookingForm(request.POST)
        if book_form.is_valid():
            form = book_form.save(commit=False)
            form.user = request.user
            form.save()
            return JsonResponse({"status": "success"})
        return JsonResponse({"status": "failed"})


@login_required
def list_meetings(request):
    before = datetime.now() - timedelta(days=30)
    after = datetime.now() + timedelta(days=30)
    sub_list = []
    subscription_list = Booking.objects.values_list('transaction_id').order_by('-repeat').distinct()
    if request.user.is_staff:
        meeting_list = Booking.objects.filter(start__gte=before, end__lte=after)
        for sub in subscription_list:
            try:
                sub_list.append(Booking.objects.filter(transaction_id=sub[0], repeat=True)[0])
            except:
                pass
    else:
        meeting_list = Booking.objects.filter(user=request.user, start__gte=before, end__lte=after)
        for sub in subscription_list:
            try:
                sub_list.append(Booking.objects.filter(transaction_id=sub[0], repeat=True, user=request.user)[0])
            except:
                pass
    return render(request, 'meeting/list.html', {
        'meetings': meeting_list,
        "subscription_list": sub_list
    })


@login_required
def get_all_meetings(request):
    if request.GET.get('from_date') and request.GET.get('to_date'):
        meetings = Booking.objects.filter(start__gte=request.GET.get('from_date'),
                                          end__lte=request.GET.get('to_date'))
        dataobj = []
        for meeting in meetings:
            if request.user.is_staff:
                extendability = {
                    "start": meeting.start.strftime('%Y-%m-%d %H:%M:%S'),
                    "end": meeting.end.strftime('%Y-%m-%d %H:%M:%S'),
                    "type": meeting.book_type,
                    "class_type": meeting.class_type,
                    "location": meeting.class_location,
                    "title": 'Booked - (%s)' % meeting.book_type,
                    "allDay": False,
                    "editable": True,
                    "meeting_id": meeting.id,
                    "is_admin": request.user.is_staff
                }
            elif meeting.user == request.user and (
                        meeting.start + timedelta(hours=2)) > datetime.now() and meeting.repeat is False:
                extendability = {
                    "start": meeting.start.strftime('%Y-%m-%d %H:%M:%S'),
                    "end": meeting.end.strftime('%Y-%m-%d %H:%M:%S'),
                    "type": meeting.book_type,
                    "class_type": meeting.class_type,
                    "location": meeting.class_location,
                    "title": 'Booked - (%s)' % meeting.book_type,
                    "allDay": False,
                    "startEditable": True,
                    "meeting_id": meeting.id
                }
            elif meeting.user == request.user and meeting.repeat is True:
                extendability = {
                    "start": meeting.start.strftime('%Y-%m-%d %H:%M:%S'),
                    "end": meeting.end.strftime('%Y-%m-%d %H:%M:%S'),
                    "type": meeting.book_type,
                    "class_type": meeting.class_type,
                    "location": meeting.class_location,
                    "title": 'Booked - (%s)' % meeting.book_type,
                    "allDay": False,
                    "meeting_id": meeting.id,
                    "subscription": True
                }
            else:
                extendability = {
                    "start": meeting.start.strftime('%Y-%m-%d %H:%M:%S'),
                    "end": meeting.end.strftime('%Y-%m-%d %H:%M:%S'),
                    "title": 'Unavailable',
                    "allDay": False,
                    "color": "#555555",
                }
            if request.user.is_staff:
                extendability['title'] = "Booked %s - %s" % (meeting.book_type, meeting.user.get_full_name())
            if request.user.is_staff and meeting.user == request.user:
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
        meeting_classtype_orig = meeting.class_type
        meeting_location_orig = meeting.class_location
        meeting_obj = {
            "start": request.POST.get('start') or datetime.strftime(meeting.start, '%Y-%m-%d %H:%M:%S'),
            "end": request.POST.get('end') or datetime.strftime(meeting.end, '%Y-%m-%d %H:%M:%S'),
            "book_type": request.POST.get('book_type') or meeting.book_type,
            "class_type": request.POST.get('class_type') or meeting.class_type,
            "class_location": request.POST.get('location') or meeting.class_location,
            "transaction_amount": meeting.transaction_amount,
            "transaction_id": meeting.transaction_id,
            "repeat": meeting.repeat
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
                "meeting_classtype_orig": meeting_classtype_orig,
                "class_type": meeting_obj["class_type"],
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
    if request.user.is_staff:
        users = User.objects.exclude(id=request.user.id).order_by('first_name')
        if request.user.is_superuser:
            programs = Outline.objects.filter(parent__isnull=True)
        else:
            programs = Outline.objects.filter(teacher=request.user, parent__isnull=True)
        for user in users:
            user.totalFiles = Files.objects.filter(to_user=user).count()
            user.totalPaid = Booking.objects.filter(user=user).aggregate(totalPaid=Sum('transaction_amount'))
        return render(request, 'files/manage_files.html', {
            'user_list': users,
            'program_list': programs
        })
    else:
        return redirect('/')


@login_required
def manage_user_files(request, user_id):
    if request.user.is_staff:
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
    if request.method == "POST" and request.user.is_staff:
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
    if request.user.is_staff:
        Files.objects.get(id=file_id).delete()
        data = {'success': True}
        return JsonResponse(data)


@login_required
def outline_overview(request):
    if request.user.is_staff:
        if request.user.is_superuser:
            outline = Outline.objects.filter(parent__isnull=True)
        else:
            outline = Outline.objects.filter(teacher=request.user, parent__isnull=True)
        return render(request, 'outline/outline_overview.html', {
            'outline': outline,
            'outline_form': OutlineForm()
        })


@login_required
def show_outline(request, program_type):
    if request.user.is_staff:
        try:
            student = User.objects.get(id=request.GET.get('student_id'))
        except:
            student = None
        if request.user.is_superuser:
            outline = Outline.objects.all()
        else:
            outline = Outline.objects.filter(teacher=request.user, program=program_type)
        for out in outline:
            try:
                out.passed = Progress.objects.get(outline=out, student=student).passed
            except:
                out.passed = False
            try:
                out.related = RelatedFiles.objects.filter(outline=out, student=student)
            except:
                out.related = None

        return render(request, 'outline/outline.html', {
            'student': student,
            'outline': outline,
            'outline_form': OutlineForm()
        })
    else:
        outline = Outline.objects.filter(program=program_type)
        for out in outline:
            try:
                out.passed = Progress.objects.get(outline=out, student=request.user).passed
            except:
                out.passed = False
            try:
                out.related = RelatedFiles.objects.filter(outline=out, student=request.user)
            except:
                out.related = None
        return render(request, 'outline/user_outline.html', {
            'outline': outline,
            'class_name': Outline.objects.get(program=program_type, parent__isnull=True).name
        })


@login_required
def add_root_outline(request):
    if request.method == "POST" and request.user.is_staff:
        outline_form = OutlineForm(request.POST)
        if outline_form.is_valid():
            form = outline_form.save(commit=False)
            form.teacher = request.user
            form.program = slugify(form.name, allow_unicode=True)
            form.save()
        return redirect('outline_overview')


@login_required
def edit_outline(request):
    if request.method == "POST" and request.user.is_staff:
        try:
            outline = Outline.objects.get(id=request.POST['outline_id'])
            outline_form = OutlineForm(request.POST, instance=outline)
        except:
            outline = ''
            outline_form = OutlineForm(request.POST)

        if outline_form.is_valid():
            form = outline_form.save(commit=False)
            form.teacher = request.user
            form.save()
            return JsonResponse({
                "program": form.program,
                "nodeID": form.id,
                "success": True
            })
        return JsonResponse({
            "success": False
        })


@login_required
def remove_outline(request):
    if request.method == "POST" and request.user.is_staff:
        Outline.objects.get(id=request.POST['outline_id']).delete()
        return JsonResponse({
            "success": True
        })


@login_required
def get_related_items(request):
    if request.user.is_staff:
        related_files = Files.objects.filter(to_user_id=request.GET.get('student_id')).values('id', 'name', 'file')
        related_booking = Booking.objects.filter(user_id=request.GET.get('student_id')).values('id', 'start', 'end')
        return JsonResponse({
            "related_files": json.dumps(list(related_files)),
            "related_booking": json.dumps(list(related_booking), default=str)
        })


@login_required
def add_related_item(request):
    if request.method == "POST" and request.user.is_staff:
        obj = RelatedFiles.objects.create(outline_id=request.POST.get('outline_id'),
                                          student=User.objects.get(id=request.POST.get('student_id')))
        if request.POST.get('file_id'):
            obj.file = Files.objects.get(id=request.POST.get('file_id'))
        if request.POST.get('booking_id'):
            obj.booking = Booking.objects.get(id=request.POST.get('booking_id'))
        obj.save()
        return JsonResponse({
            "success": True
        })


@login_required
def remove_related_item(request):
    if request.method == "POST" and request.user.is_staff:
        RelatedFiles.objects.get(id=request.POST['related_id']).delete()
        return JsonResponse({
            "success": True
        })


@login_required
def edit_progress(request):
    if request.user.is_staff:
        obj, progress = Progress.objects.get_or_create(outline_id=request.POST.get('outline_id'),
                                                       student=User.objects.get(id=request.POST.get('student_id')))
        obj.passed = not obj.passed
        obj.save()
        return JsonResponse({
            "progress_id": obj.id,
            "success": True
        })


@login_required
def user_home(request):
    try:
        if request.user.is_staff:
            next_meeting = Booking.objects.filter(start__gt=datetime.today())[0]
        else:
            next_meeting = Booking.objects.filter(user=request.user, start__gt=datetime.today())[0]
    except:
        next_meeting = 'none'
    try:
        progress = Progress.objects.all().order_by('-updated_at')[0]
        if request.user.is_staff:
            latest_outline = Outline.objects.get(id=progress.outline_id)
        else:
            latest_outline = Outline.objects.get(id=progress.outline_id)
    except:
        progress = 'none'
        latest_outline = 'none'
    try:
        parent_outline = Outline.objects.get(id=latest_outline.parent_id)
    except:
        parent_outline = 'none'
    try:
        if request.user.is_staff:
            recent_upload = Files.objects.all().order_by('-created_at')[:3]
        else:
            recent_upload = Files.objects.filter(to_user_id=request.user).order_by('-created_at')[:3]
    except:
        recent_upload = 'none'
    text = requests.get(
        'https://raw.githubusercontent.com/onhout/google-10000-english/master/google-10000-english-usa-no-swears-long.txt')
    text_array = text.text.split('\n')
    random.shuffle(text_array)
    korean = requests.post('https://openapi.naver.com/v1/language/translate',
                           data={'source': 'en', 'target': 'ko', 'text': text_array[0]},
                           headers={'X-Naver-Client-Id': NAVER_CLIENT_ID, 'X-Naver-Client-Secret': NAVER_CLIENT_SECRET})
    translated_korean = korean.json()

    chinese = requests.post('https://openapi.naver.com/v1/language/translate',
                            data={'source': 'ko', 'target': 'zh-CN',
                                  'text': translated_korean['message']['result']['translatedText']},
                            headers={'X-Naver-Client-Id': NAVER_CLIENT_ID,
                                     'X-Naver-Client-Secret': NAVER_CLIENT_SECRET})
    translated_chinese = chinese.json()
    return render(request, 'dashboad/user_dashboard.html', {
        'next_meeting': next_meeting,
        'latest_outline': {
            'outline': latest_outline,
            'progress': progress
        },
        'parent_outline': parent_outline,
        'recent_upload': recent_upload,
        'wordofday': {
            'eng': text_array[0],
            'kor': translated_korean['message']['result']['translatedText'],
            'chi': translated_chinese['message']['result']['translatedText'],
        }
    })


@login_required
def contact_us(request):
    return render(request, 'dashboad/contact_us.html', {

    })
