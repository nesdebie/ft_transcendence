from django.urls import path
from . import views


urlpatterns = [
    path('<str:page>.html/', views.pages, name='pages'),  # Handle .html pages
    path('profile/<str:username>/', views.view_profile, name='profile'), 
    path('profile/', views.view_self_profile, name='self_profile'), 
	path('friend_requests/', views.view_friend_requests, name='friend_requests'),
    path('chat/', views.view_chat, name='chat_messages'),
    path('chat/<str:username>/', views.view_chat , name='chat_with_user'),
    path('friend_requests/', views.view_friend_requests, name='friend_requests'),
    path('shifumi/', views.shifumi_lobby, name='shifumi_lobby'),
    path('shifumi/<str:room_name>/', views.shifumi_game_PVP, name='shifumi_game_PVP'),
    path('profile_editor/', views.profile_editor, name='profile_editor'),
	path('pong/<str:room_name>/', views.pong_game, name='pong_game'),
]