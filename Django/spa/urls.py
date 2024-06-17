from django.urls import path
from . import views

urlpatterns = [
    path('<str:page>.html/', views.pages, name='pages'),  # Handle .html pages
    path('profile/<str:username>/', views.view_profile, name='profile'),  
	path('friend_requests/', views.view_friend_requests, name='friend_requests')
]