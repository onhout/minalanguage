from django.shortcuts import render
from django.contrib.auth.decorators import login_required


# Create your views here.

def main_index(request):
    return render(request, 'main_index.html', {})

@login_required
def user_home(request):
    return render(request, 'home.html', {})

