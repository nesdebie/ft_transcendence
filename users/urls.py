from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('check_authentication/', views.check_authentication, name='check_authentication'),
    path('user_level/', views.user_level, name='user_level'),
]
