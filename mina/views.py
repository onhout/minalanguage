from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.contrib.auth import logout as auth_logout, update_session_auth_hash


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
    return render(request, 'meeting/book.html', {})