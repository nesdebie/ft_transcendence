from django.shortcuts import get_object_or_404
from django.db.models import F, Count
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Matchmaking, PongGame, Tournament
from users.models import Player
from django.contrib.postgres.aggregates import ArrayAgg
import json

@csrf_exempt
def start_matchmaking(request):
    if request.method == 'POST':
        player :Player = request.user
        game_type = json.loads(request.body).get('game_type')
        matchmaking, created = Matchmaking.objects.get_or_create(player=player, game_type=game_type)
        # Check if there's another player waiting
        other_matchmaking = Matchmaking.objects.filter(matched=False, game_type=game_type).exclude(player=player).first()
        
        if other_matchmaking:
            # Create a new game
            if game_type == 'pong':
                game = PongGame.objects.create(player1=player, player2=other_matchmaking.player)
                other_matchmaking.game = game
            
            other_matchmaking.matched = True
            other_matchmaking.room_name = other_matchmaking.player.username + "_" + player.username
            other_matchmaking.save()
            
            matchmaking.delete()
            return JsonResponse({'status': 'matched', 'room_name': other_matchmaking.room_name, 'game_type': game_type})
        
        return JsonResponse({'status': 'waiting', 'matchmaking_id': str(matchmaking.id)})
    
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def check_matchmaking(request, matchmaking_id):
    player = request.user
    matchmaking = Matchmaking.objects.filter(id=matchmaking_id, player=player).first()
    if not matchmaking:
        return JsonResponse({'status': 'matchmaking_removed'}) 
    room_name = matchmaking.room_name
    if matchmaking.matched:
        matchmaking.delete()
        return JsonResponse({'status': 'matched', 'room_name': room_name, 'game_type': matchmaking.game_type})
    
    return JsonResponse({'status': 'waiting', 'room_name': room_name, 'game_type': matchmaking.game_type})

@csrf_exempt
def stop_matchmaking(request, matchmaking_id):
    player = request.user
    matchmaking = Matchmaking.objects.filter(id=matchmaking_id, player=player).delete()
    return JsonResponse({'status': 'matchmaking_removed'})


# @csrf_exempt
# def create_game(request):
#     if request.method == 'POST':
#         game = PongGame.objects.create(player1=request.user)
#         return JsonResponse({'room_name': str(game.id)})
#     return JsonResponse({'error': 'Invalid request'}, status=400)

# def get_game_state(request, room_name):
#     try:
#         game = PongGame.objects.get(id=room_name)
#         return JsonResponse({
#             'player1': game.player1.username,
#             'player2': game.player2.username,
#             'score1': game.score1,
#             'score2': game.score2,
#             'is_active': game.is_active
#         })
#     except PongGame.DoesNotExist:
#         return JsonResponse({'error': 'Game not found'}, status=404)

# @csrf_exempt
# def update_score(request, room_name):
#     if request.method == 'POST':
#         try:
#             game = PongGame.objects.get(id=room_name)
#             data = json.loads(request.body)
#             game.score1 = data.get('score1', game.score1)
#             game.score2 = data.get('score2', game.score2)
#             game.save()
#             return JsonResponse({'success': True})
#         except PongGame.DoesNotExist:
#             return JsonResponse({'error': 'Game not found'}, status=404)
#     return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def get_game_state(request, room_name):
    game = get_object_or_404(PongGame, id=room_name)
    player :Player = request.user
    
    if player not in [game.player1, game.player2]:
        return JsonResponse({'error': 'You are not a player in this game'}, status=403)
    
    # Here you would typically get the current game state from your game logic
    # For this example, we'll just return some dummy data
    game_state = {
        'player1': game.player1.username,
        'player2': game.player2.username,
        'score1': game.score1,
        'score2': game.score2,
        'ball_position': {'x': 250, 'y': 250},
        'paddle1_position': 200,
        'paddle2_position': 200,
    }
    
    return JsonResponse(game_state)

@csrf_exempt
def list_tournaments(request):
    available_tournament_list = []
    your_tournament_list = []
    your_finished_tournament_list = []
    user = request.user.username

    for tournament in Tournament.objects.all():
        tournament_info = {
            'id': tournament.id,
            'number_of_players': tournament.number_of_players,
            'is_active': tournament.is_active,
            'is_finished': tournament.is_finished,
            'scores': tournament.scores,
            'upcoming_games': tournament.upcoming_games,
            'final_position': tournament.final_position,
            'players': tournament.players,  # This will be a list of usernames
        }

        if user in tournament.players:
            if tournament.is_finished:
                your_finished_tournament_list.append(tournament_info)
            else:
                your_tournament_list.append(tournament_info)
        elif len(tournament.players) < tournament.number_of_players:
            available_tournament_list.append(tournament_info)

    response_data = {
        'available': available_tournament_list,
        'your': your_tournament_list,
        'your_finished': your_finished_tournament_list,
    }

    return JsonResponse(response_data)

@csrf_exempt
def create_tournament(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        number_of_players = data.get('number_of_players')
        tournament = Tournament.objects.create(number_of_players=number_of_players)
        tournament.players.append(request.user.username)
        tournament.save()
        return JsonResponse({'id': tournament.id})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def join_tournament(request, tournament_id):
    tournament = get_object_or_404(Tournament, id=tournament_id)
    if len(tournament.players) >= tournament.number_of_players:
        return JsonResponse({'error': 'Too many players have already joined the game'})
    
    # Add the username to the players list
    tournament.players.append(request.user.username)
    tournament.save()  # Save the tournament after adding the player

    if len(tournament.players) == tournament.number_of_players:
        tournament.start()
    return JsonResponse({'success': True})

@csrf_exempt
def tournament_is_active(request, tournament_id):
    from pong_game.models import Tournament
    tournament = get_object_or_404(Tournament, id=tournament_id)
    
    return JsonResponse({'is_active': tournament.is_active})

@csrf_exempt
def tournament_game_switch_player_status(request, tournament_id, game_id):
    tournament: Tournament = get_object_or_404(Tournament, id=tournament_id)
    upcoming_game = tournament.get_upcoming_game(game_id)

    if upcoming_game:
        player_status = upcoming_game.get('Players_joined', [])
        if request.user.username in player_status:
            player_status.remove(request.user.username)
        else:
            player_status.append(request.user.username)
        
        upcoming_game['Players_joined'] = player_status
        tournament.save()
        return JsonResponse({'success': True})
    else:
        return JsonResponse({'error': 'Game not found'}, status=404)
    
@csrf_exempt
def tournament_game_status(request, tournament_id, game_id):
    tournament: Tournament = get_object_or_404(Tournament, id=tournament_id)
    upcoming_game = tournament.get_upcoming_game(game_id)

    if not upcoming_game:
        return JsonResponse({'ready': False, 'active': False})

    other_player_username = upcoming_game['players'][1] if upcoming_game['players'][0] == request.user.username else upcoming_game['players'][0]
    other_user = get_object_or_404(Player, username=other_player_username)
    print('other user is : ', other_player_username)
    print('Other user is avaialable ?: ',other_user.is_available())

    if other_user.is_available() != True:
        return JsonResponse({'status': 'otherplayer_inactive'})

    if len(upcoming_game['Players_joined']) == 2:
        return JsonResponse({'ready': True,'active': True})
    else:
        return JsonResponse({'ready': False, 'active': True})

@csrf_exempt
def tournament_resign(request, tournament_id, game_id):
    tournament: Tournament = get_object_or_404(Tournament, id=tournament_id)
    upcoming_game = tournament.get_upcoming_game(game_id)
    from .game_logic import PongGameLogic
    max_score = PongGameLogic().max_score
    players = upcoming_game['players']
    if not upcoming_game:
        return JsonResponse({'error': 'Game not found'}, status=404)
    if request.user.username not in players:
        return JsonResponse({'error': 'Player not in this game'}, status=404)
    
    tournament.add_game({player : 0 if player == request.user.username else max_score
                         for player in players})
    
    return JsonResponse({'status': "succes"})