from django.shortcuts import render, get_object_or_404
from users.models import Player, FriendRequest, Block, Message
from django.db.models import Q
from django.shortcuts import render, get_object_or_404
from users.models import Player, FriendRequest, Block
from django.contrib.auth.decorators import login_required
from django.urls import reverse
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
from blockchain.ALL_FILE_NEEDED.blockchain_access import Player_stat
from django.http import HttpRequest
import json

def index(request):
    return render(request, 'spa/index.html')

def pages(request, page):
    return render(request, f'spa/pages/{page}.html')

@login_required
def view_self_profile(request):
    from pong_game.models import Tournament
    user: Player = request.user
    received_requests = FriendRequest.objects.filter(to_user=user)
    friends = user.friends.all()
    blocked_users = Block.objects.filter(from_user=user)

    # Fetch Pong game statistics for the logged-in user
    pong_stats = Player_stat(user.username, 'pong')
    p_wins = len([match for match in pong_stats if match[4] == user.username])
    p_losses = len([match for match in pong_stats if (match[1] == user.username or match[2] == user.username) and match[4] != user.username])

    # Fetch Shifumi game statistics for the logged-in user
    shifumi_stats = Player_stat(user.username, 'shifumi')
    s_wins = len([match for match in shifumi_stats if match[4] == user.username])
    s_losses = len([match for match in shifumi_stats if (match[1] == user.username or match[2] == user.username) and match[4] != user.username and match[4] != "Draw"])  # Exclude draws from losses
    s_draws = len([match for match in shifumi_stats if match[4] == "Draw"])

    finished_tournaments =  [tournament for tournament in Tournament.objects.all() 
                            if user.username in tournament.players and tournament.is_finished]

    total_tournament_in_Blockchain = 0


    tournament_score = 100
    for tournament in finished_tournaments:
        tournament_stat = Player_stat(user.username, f'Tournament Result: {tournament.id}')
        if (tournament_stat):
            total_tournament_in_Blockchain += 1
        print(f'tournament stat for id {tournament.id}: ', tournament_stat)
        for stat in tournament_stat:
            if (stat[4] == user.username):
                tournament_score += 1
            else:
                tournament_score -= 1
    print('pong_stats: ', pong_stats)
    print('shifumi_stats: ', shifumi_stats)
    context = {
        'user_profile': user,
        'is_own_profile': True,
        'friendship': None,
        'request_pending': None,
        'blocked': None,
        'received_requests': received_requests,
        'friends': friends,
        'blocked_users': blocked_users,
        'pong_wins': p_wins,
        'pong_losses': p_losses,
        'shifumi_wins': s_wins,
        'shifumi_losses': s_losses,
        'shifumi_draws': s_draws,
        'tournament_score': tournament_score,
        'finished_tournament_count': total_tournament_in_Blockchain,
    }
    
    return render(request, 'spa/pages/profile.html', context)


@login_required
def view_profile(request, username):
    from pong_game.models import Tournament

    user: Player = request.user
    try:
        user_profile: Player = Player.objects.get(username=username)
    except ObjectDoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    blocked_users = Block.objects.filter(from_user=user)

    # Fetch Pong game statistics for the user profile
    pong_stats = Player_stat(username, 'pong')
    wins = len([match for match in pong_stats if match[3] == username])
    losses = len(pong_stats) - wins

    # Fetch Shifumi game statistics for the user profile
    shifumi_stats = Player_stat(username, 'shifumi')
    s_wins = len([match for match in shifumi_stats if match[4] == username])
    s_losses = len([match for match in shifumi_stats if (match[1] == username or match[2] == username) and match[4] != username and match[4] != "Draw"])  # Exclude draws from losses
    s_draws = len([match for match in shifumi_stats if match[4] == "Draw"])

    finished_tournaments =  [tournament.id for tournament in Tournament.objects.all() 
                            if username in tournament.players and tournament.is_finished]

    
    total_tournament_in_Blockchain = 0

    tournament_score = 100
    for tournament_id in finished_tournaments:
        tournament_stat = Player_stat(user.username, f'Tournament Result: {tournament_id}')
        if (tournament_stat):
            total_tournament_in_Blockchain += 1
        for stat in tournament_stat:
            if (stat[4] == username):
                tournament_score += 1
            else:
                tournament_score -= 1

    context = {
        'user_profile': user_profile,
        'is_own_profile': user == user_profile,
        'friendship': user.get_friendship(player=user_profile) if user.is_friend(user_profile) else None,
        'request_pending': FriendRequest.objects.filter(from_user=user, to_user=user_profile).first(),
        'blocked': Block.objects.filter(from_user=user, to_user=user_profile).first(),
        'received_requests': None,
        'friends': None,
        'blocked_users': blocked_users,  # Add blocked users to the context
        'pong_wins': wins,
        'pong_losses': losses,
        'shifumi_wins': s_wins,
        'shifumi_losses': s_losses,
        'shifumi_draws': s_draws,
        'tournament_score': tournament_score,
        'finished_tournament_count': len(finished_tournaments),
    }
    return render(request, 'spa/pages/profile.html', context)

@login_required
def view_friend_requests(request):
    user = request.user
    received_requests = FriendRequest.objects.filter(to_user=user)
    friends = user.friends.all()
    
    context = {
        'received_requests': received_requests,
        'friends': friends,
    }
    return render(request, 'spa/pages/friend_requests.html', context)

@login_required
def view_chat(request, username=None):
    user: Player = request.user
    if username:
        # Allow chat with the bot without raising a 404 error
        if username == '[_t0urn4_b0t_]':
            user_to_chat = None  # Set to None or create a mock Player object if needed
        else:
            user_to_chat = get_object_or_404(Player, username=username)
    else:
        user_to_chat = None

    messages = []
    are_friends = False  # Default to not friends
    if user_to_chat:
        messages = Message.objects.filter(
            (Q(sender=user) & Q(receiver=user_to_chat)) |
            (Q(sender=user_to_chat) & Q(receiver=user))
        ).order_by('timestamp')
        are_friends = user.is_friend(user_to_chat)  # Assuming is_friend is a method to check friendship

    # Exclude blocked users and users who have blocked the current user
    blocked_users = Block.objects.filter(Q(from_user=user) | Q(to_user=user)).values_list('to_user', flat=True)
    blocking_users = Block.objects.filter(Q(to_user=user)).values_list('from_user', flat=True)
    users = Player.objects.exclude(id__in=blocked_users).exclude(id__in=blocking_users).exclude(id=user.id)

    template = 'spa/pages/chat_interface.html' if username else 'spa/pages/chat_friends_list.html'

    context = {
        'users': users,
        'user_to_chat': user_to_chat,
        'messages': messages,
        'are_friends': are_friends,  # Pass friendship status to the template
    }

    return render(request, template, context)

def shifumi_lobby(request):
    user : Player = request.user
    active_game = user.get_active_shifumi_game()
    
    context = {
        'active_game': active_game
    }
    
    return render(request, 'spa/pages/shifumi_lobby.html', context)

def shifumi_game_PVP(request, room_name):
    user : Player = request.user
    user.set_active_shifumi_game(room_name)
    return render(request, 'spa/pages/shifumi.html', {'room_name': room_name})

@login_required
def profile_editor(request):
    return render(request, 'spa/pages/profile_editor.html', {
        'update_profile_picture_url': reverse('update_profile_picture'),
        'change_password_url': reverse('change_password')
    })

def pong_game(request, room_name):
    return render(request, 'spa/pages/pong.html', {'room_name': room_name, 'tournament': False})

def touranement_pong_game(request, tournament_id, game_id):
    from pong_game.models import Tournament
    tournament = get_object_or_404(Tournament, id=tournament_id)
    game = next(game for game in tournament.upcoming_games if game['game_id'] == game_id);
    context = {
        'room_name': f'{tournament_id}_{game_id}',
        'tournament': True,
        'game': json.dumps(game),
    }
    
    return render(request, 'spa/pages/pong.html', context)

def waiting_tournament_page(request, tournament_id):
    return render(request, 'spa/pages/waiting_joining_tournament.html', {'tournament_id': tournament_id})

def waiting_tournament_game(request: HttpRequest, tournament_id, game_id):
    from pong_game.models import Tournament
    tournament = get_object_or_404(Tournament, id=tournament_id)
    game = next(game for game in tournament.upcoming_games if game['game_id'] == game_id);
    otherUser : Player = get_object_or_404(Player, username=next(player for player in game['players'] if player != request.user.username))

    context = {
        'tournamentGameData' : json.dumps(game),
        'tournament_id' : tournament_id,
        'otherUser' : otherUser.username
    }
    return render(request, 'spa/pages/waiting_tournament_game.html', context)

def tournament_page(request, tournament_id):
    from pong_game.models import Tournament
    from users.models import Player
    tournament = get_object_or_404(Tournament, id=tournament_id)
    
    players_availability = {
        player: Player.object.get(username=player).is_available() for player in tournament.players
        }

    players_nicknames = {
        player: Player.object.get(username=player).nickname if Player.object.get(username=player).nickname else player
        for player in tournament.players
    }

    context = {
        'scores'            :   tournament.scores,
        'upcoming_games'    :   tournament.get_upcoming_games(),
        'game_history'      :   tournament.get_game_history(),
        'final_positions'   :  tournament.final_position,
        'is_finished'       :   tournament.is_finished,
        'playerStatus'      :   players_availability,
        'nicknames'         :   players_nicknames,
    }
    return render(request, 'spa/pages/tournament.html',context={'tournament_data': json.dumps(context)});

@login_required
def view_history(request):
    user: Player = request.user
    # Fetch Pong game statistics for the user
    pong_stats_raw = Player_stat(user.username, 'pong')
    pong_stats = [
        f"vs {stat[2] if stat[1] == user.username else stat[1]} - {stat[3]} - [{'WINNER' if stat[4] == user.username else 'LOSER'}]"
        for stat in pong_stats_raw
    ]

    # Fetch Shifumi game statistics for the user
    shifumi_stats_raw = Player_stat(user.username, 'shifumi')
    shifumi_stats = [
        f"vs {stat[2] if stat[1] == user.username else stat[1]} - {stat[3]} - [{'WINNER' if stat[4] == user.username else 'LOSER' if stat[4] != 'Draw' else 'DRAW'}]"
        for stat in shifumi_stats_raw
    ]

    context = {
        'pong_stats': pong_stats,
        'shifumi_stats': shifumi_stats,
    }
    return render(request, 'spa/pages/history.html', context)
