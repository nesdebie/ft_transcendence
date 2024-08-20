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
    path('profile_editor/', views.profile_editor, name='profile_editor'),
    path('update_profile_picture/', views.update_profile_picture, name='update_profile_picture'),
    path('change_password/', views.change_password, name='change_password'),
    path('shifumi/', views.shifumi_lobby, name='shifumi_lobby'),
    path('shifumi/PVE/', views.shifumi_game_PVE, name='shifumi_game_PVE'),
    path('shifumi/<str:room_name>/', views.shifumi_game_PVP, name='shifumi_game_PVP'),
    path('pong/<str:game_id>/', views.pong_game, name='pong_game'),
]