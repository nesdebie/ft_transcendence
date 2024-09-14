import logging
from django.shortcuts import render, get_object_or_404
from users.models import Player, FriendRequest, Block, Message
from django.db.models import Q
from django.shortcuts import render, redirect, get_object_or_404
from users.models import Player, FriendRequest, Block
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.urls import reverse
from django.http import JsonResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from PIL import Image
import logging
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import update_session_auth_hash

logger = logging.getLogger(__name__)

def index(request):
    return render(request, 'spa/index.html')

def pages(request, page):
    return render(request, f'spa/pages/{page}.html')

@login_required
def view_self_profile(request):
	user: Player = request.user
	received_requests = FriendRequest.objects.filter(to_user=user)
	friends = user.friends.all()
	blocked_users = Block.objects.filter(from_user=user)  # Get all users blocked by the current user

	context = {
		'user_profile':			request.user,
		'is_own_profile':		True,
		'friendship':			None,
		'request_pending':  	None,
		'blocked':				None,
		'received_requests':	received_requests,
		'friends':				friends,
		'blocked_users':		blocked_users  # Add blocked users to the context
	}
	
	return render(request, 'spa/pages/profile.html', context)


@login_required
def view_profile(request, username):
    user: Player = request.user
    user_profile: Player = get_object_or_404(Player, username=username)
    blocked_users = Block.objects.filter(from_user=user)  # Get all users blocked by the current user

    context = {
        'user_profile': user_profile,
        'is_own_profile': False,
        'friendship': user.get_friendship(player=user_profile) if user.is_friend(user_profile) else None,
        'request_pending': FriendRequest.objects.filter(from_user=user, to_user=user_profile).first(),
        'blocked': Block.objects.filter(from_user=user, to_user=user_profile).first(),
        'received_requests': None,
        'friends': None,
        'blocked_users': blocked_users  # Add blocked users to the context
    }
    print(context)
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

    template = 'spa/pages/chat_interface.html' if user_to_chat else 'spa/pages/chat_friends_list.html'

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
    return render(request, 'spa/pages/pong.html', {'room_name': room_name})
