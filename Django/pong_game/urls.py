from django.urls import path
from . import views

urlpatterns = [
    path('create/', views.create_game, name='create_pong_game'),
    path('<int:game_id>/state/', views.get_game_state, name='get_pong_game_state'),
    path('<int:game_id>/update_score/', views.update_score, name='update_pong_score'),
	path('matchmaking/', views.start_matchmaking, name='start_matchmaking'),
    path('matchmaking/<str:matchmaking_id>/', views.check_matchmaking, name='check_matchmaking'),
]