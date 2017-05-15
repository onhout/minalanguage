from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.user_login, name='user_login'),
    url(r'^logout$', views.user_logout, name='user_logout'),
    url(r'^send_message/', views.send_message, name='send_message'),
    url(r'^home/$', views.show_calendar, name='show_calendar'),
    url(r'^book/$', views.book_meeting, name='book_meeting'),
    url(r'^subscribe/$', views.subscribe, name='subscribe'),
    url(r'^file/list/$', views.file_list, name='file_list'),
    url(r'^file/manage/$', views.manage_files, name='manage_files'),
    url(r'^file/manage/(?P<user_id>[\w-]+)$', views.manage_user_files, name='manage_user_files'),
    url(r'^file/upload/(?P<user_id>[\w-]+)$', views.upload_files, name='upload_files'),
    url(r'^file/delete/(?P<file_id>[\w-]+)/$', views.delete_file, name='delete_file'),
    url(r'^meetings/list/$', views.list_meetings, name='list_meetings'),
    url(r'^meetings/superbook/$', views.super_book_meeting, name='super_book_meeting'),
    url(r'^meetings/edit$', views.change_meeting, name='change_meeting'),
    url(r'^meetings/remove/(?P<booking_id>[\w-]+)', views.remove_meeting, name='remove_meeting'),
    url(r'^meetings/get_meetings', views.get_all_meetings, name='get_all_meetings'),
]
