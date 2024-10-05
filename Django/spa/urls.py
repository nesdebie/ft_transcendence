from django.urls import path
from . import views


urlpatterns = [
    path('<str:page>.html/', views.pages, name='pages'),  # Handle .html pages
    path('profile/<str:username>/', views.view_profile, name='profile'),
    path('profile/', views.view_self_profile, name='self_profile'), 
    path('history/', views.view_history, name='view_history'), 
	path('friend_requests/', views.view_friend_requests, name='friend_requests'),
    path('chat/', views.view_chat, name='chat_messages'),
    path('chat/<str:username>/', views.view_chat , name='chat_with_user'),
    path('friend_requests/', views.view_friend_requests, name='friend_requests'),
    path('shifumi_lobby/', views.shifumi_lobby, name='shifumi_lobby'),
    path('shifumi/<str:room_name>/', views.shifumi_game_PVP, name='shifumi_game_PVP'),
    path('profile_editor/', views.profile_editor, name='profile_editor'),
	path('pong/<str:room_name>/', views.pong_game, name='pong_game'),
	path('pong/tournament/<int:tournament_id>/game/<int:game_id>/', views.touranement_pong_game),
	path('tournament/<int:tournament_id>/', views.tournament_page, name='tournament_page'),
	path('waiting_joining_tournament/<int:tournament_id>/', views.waiting_tournament_page, name='waiting_tournament_page'),
	path('waiting_tournament_game/<int:tournament_id>/<int:game_id>/', views.waiting_tournament_game, name='waiting_joining_game'),
]