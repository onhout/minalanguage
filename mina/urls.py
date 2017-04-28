from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^login$', views.user_login, name='user_login'),
    url(r'^logout$', views.user_logout, name='user_logout'),
    url(r'^$', views.user_home, name='user_home'),
    url(r'^meetings/book/$', views.book_meeting, name='book_meeting'),
    url(r'^meetings/get_meetings', views.get_all_meetings, name='get_all_meetings'),
]
