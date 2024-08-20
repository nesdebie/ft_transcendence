from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Matchmaking, PongGame
from users.models import Player
import json

@csrf_exempt
def create_game(request):
    if request.method == 'POST':
        game = PongGame.objects.create(player1=request.user)
        return JsonResponse({'game_id': str(game.id)})
    return JsonResponse({'error': 'Invalid request'}, status=400)

def get_game_state(request, game_id):
    try:
        game = PongGame.objects.get(id=game_id)
        return JsonResponse({
            'player1': game.player1.username,
            'player2': game.player2.username,
            'score1': game.score1,
            'score2': game.score2,
            'is_active': game.is_active
        })
    except PongGame.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)

@csrf_exempt
def update_score(request, game_id):
    if request.method == 'POST':
        try:
            game = PongGame.objects.get(id=game_id)
            data = json.loads(request.body)
            game.score1 = data.get('score1', game.score1)
            game.score2 = data.get('score2', game.score2)
            game.save()
            return JsonResponse({'success': True})
        except PongGame.DoesNotExist:
            return JsonResponse({'error': 'Game not found'}, status=404)
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def start_matchmaking(request):
    if request.method == 'POST':
        player :Player = request.user
        matchmaking, created = Matchmaking.objects.get_or_create(player=player, matched=False)
        
        # Check if there's another player waiting
        other_matchmaking = Matchmaking.objects.filter(matched=False).exclude(player=player).first()
        
        if other_matchmaking:
            # Create a new game
            game = PongGame.objects.create(player1=player, player2=other_matchmaking.player)
            
            # Update both matchmaking entries
            matchmaking.matched = True
            matchmaking.game = game
            matchmaking.save()
            
            other_matchmaking.matched = True
            other_matchmaking.game = game
            other_matchmaking.save()
            
            return JsonResponse({'status': 'matched', 'game_id': str(game.id)})
        
        return JsonResponse({'status': 'waiting', 'matchmaking_id': str(matchmaking.id)})
    
    return JsonResponse({'error': 'Invalid request'}, status=400)

def check_matchmaking(request, matchmaking_id):
    player = request.user
    matchmaking = Matchmaking.objects.filter(id=matchmaking_id, player=player).first()   
    if matchmaking.matched:
        return JsonResponse({'status': 'matched', 'game_id': str(matchmaking.game.id)})
    
    return JsonResponse({'status': 'waiting'})

def get_game_state(request, game_id):
    game = get_object_or_404(PongGame, id=game_id)
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