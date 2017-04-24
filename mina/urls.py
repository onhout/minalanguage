from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.main_index, name='main_index'),
    url(r'^home$', views.user_home, name='user_home')
]
