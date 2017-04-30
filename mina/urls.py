from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^login$', views.user_login, name='user_login'),
    url(r'^logout$', views.user_logout, name='user_logout'),
    url(r'^$', views.book_meeting, name='book_meeting'),
    url(r'^file/list/$', views.file_list, name='file_list'),
    url(r'^file/manage/$', views.files, name='files'),
    url(r'^meetings/list/$', views.list_meetings, name='list_meetings'),
    url(r'^meetings/superbook/$', views.super_book_meeting, name='super_book_meeting'),
    url(r'^meetings/edit$', views.change_meeting, name='change_meeting'),
    url(r'^meetings/get_meetings', views.get_all_meetings, name='get_all_meetings'),
]
