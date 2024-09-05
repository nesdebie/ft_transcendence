from django.urls import path
from . import views

urlpatterns = [
    # path('create/', views.create_game, name='create_pong_game'), #Not sure to use 
    # path('<int:room_name>/state/', views.get_game_state, name='get_pong_game_state'), #Not sure to use
    # path('<int:room_name>/update_score/', views.update_score, name='update_pong_score'), #Not sure to use
	path('matchmaking/', views.start_matchmaking, name='start_matchmaking'),
    path('matchmaking/<str:matchmaking_id>/', views.check_matchmaking, name='check_matchmaking'),
    path('tournaments/', views.list_tournaments, name='list_tournaments'),
    path('tournaments/create/', views.create_tournament, name='create_tournament'),
	path('join_tournament/<int:tournament_id>/', views.join_tournament, name='join_tournament'),
]