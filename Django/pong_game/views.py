from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Matchmaking, PongGame, Tournament
from users.models import Player
import json

@csrf_exempt
def start_matchmaking(request):
    if request.method == 'POST':
        player :Player = request.user
        matchmaking, created = Matchmaking.objects.get_or_create(player=player)
        
        # Check if there's another player waiting
        other_matchmaking = Matchmaking.objects.filter(matched=False).exclude(player=player).first()
        
        if other_matchmaking:
            # Create a new game
            game = PongGame.objects.create(player1=player, player2=other_matchmaking.player)
            
            other_matchmaking.matched = True
            other_matchmaking.room_name = other_matchmaking.player.username + "_" + player.username
            other_matchmaking.game = game
            other_matchmaking.save()
            
            matchmaking.delete()
            print(f'Matchmaking roomname {other_matchmaking.room_name}')
            return JsonResponse({'status': 'matched', 'room_name': other_matchmaking.room_name})
        
        return JsonResponse({'status': 'waiting', 'matchmaking_id': str(matchmaking.id)})
    
    return JsonResponse({'error': 'Invalid request'}, status=400)

def check_matchmaking(request, matchmaking_id):
    player = request.user
    matchmaking = Matchmaking.objects.filter(id=matchmaking_id, player=player).first()   
    if matchmaking.matched:
        room_name = matchmaking.room_name
        matchmaking.delete()
        print(f'Matchmaking join room name: {room_name}')
        return JsonResponse({'status': 'matched', 'room_name': room_name})
    
    return JsonResponse({'status': 'waiting'})


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

def list_tournaments(request):
    tournaments = Tournament.objects.all()
    return JsonResponse(tournaments, safe=False)

def create_tournament(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        number_of_players = data.get('number_of_players')
        tournament = Tournament.objects.create(number_of_players=number_of_players)
        return JsonResponse({'id': tournament.id})
    return JsonResponse({'error': 'Invalid request'}, status=400)