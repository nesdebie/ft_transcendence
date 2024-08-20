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
	context = {
		'user_profile':			request.user,
		'is_own_profile':		True,
		'friendship':			None,
		'request_pending':  	None,
		'blocked':				None,
		'received_requests':	received_requests,
		'friends':				friends
	}
	
	return render(request, 'spa/pages/profile.html', context)


@login_required
def view_profile(request, username):
    user: Player = request.user
    user_profile: Player = get_object_or_404(Player, username=username)


    context = {
        'user_profile': user_profile,
        'is_own_profile': False,
        'friendship': user.get_friendship(player=user_profile) if user.is_friend(user_profile) else None,
        'request_pending': FriendRequest.objects.filter(from_user=user, to_user=user_profile).first(),
        'blocked': Block.objects.filter(from_user=user, to_user=user_profile).first(),
        'received_requests': None,
        'friends': None,
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

def view_chat(request, username=None):
    user: Player = request.user
    if username:
        user_to_chat = get_object_or_404(Player, username=username)
    else:
        user_to_chat = None


    if user_to_chat:
        messages = Message.objects.filter(
            (Q(sender=user) & Q(receiver=user_to_chat)) |
            (Q(sender=user_to_chat) & Q(receiver=user))
        ).order_by('timestamp')
    else:
        messages = []

    if user_to_chat:
        template = 'spa/pages/chat_interface.html'
    else:
        template = 'spa/pages/chat_friends_list.html'

    context = {
        'friends': user.friends.all(),
        'user_to_chat': user_to_chat,
        'messages': messages,
    }

    for m in messages:
        print(f'{m.sender.username} -> {m.receiver.username}: {m.message}\n')
    return render(request, template, context)

@login_required
def profile_editor(request):
    return render(request, 'spa/pages/profile_editor.html', {
        'update_profile_picture_url': reverse('update_profile_picture'),
        'change_password_url': reverse('change_password')
    })

@login_required
def update_profile_picture(request):
    if request.method == 'POST':
        if 'image' in request.FILES:
            profile_picture = request.FILES['image']
            if profile_picture.content_type not in ['image/png', 'image/jpeg']:
                return JsonResponse({'errors': {'image': 'Profile picture must be a PNG or JPEG file'}}, status=400)

            # Use the original file name
            image_name = profile_picture.name
            image_path = os.path.join('profile_pics', image_name)

            # Save the new profile picture
            default_storage.save(image_path, ContentFile(profile_picture.read()))

            # Update the user's profile picture path
            user = request.user
            user.profile_picture = image_path
            user.save()
            return JsonResponse({'status': 'success', 'profile_picture': user.profile_picture.url})
        return JsonResponse({'errors': {'image': 'No image file provided'}}, status=400)
    return JsonResponse({'status': 'invalid method'}, status=405)

@login_required
def change_password(request):
    if request.method == 'POST':
        old_password = request.POST.get('old_password')
        new_password = request.POST.get('new_password')
        new_password2 = request.POST.get('new_password2')

        if not request.user.check_password(old_password):
            return JsonResponse({'errors': {'old_password': 'Old password is incorrect'}}, status=400)

        if new_password != new_password2:
            return JsonResponse({'errors': {'new_password2': "Passwords don't match"}}, status=400)

        try:
            validate_password(new_password, request.user)
        except ValidationError as error:
            return JsonResponse({'errors': {'new_password': error.messages}}, status=400)

        request.user.set_password(new_password)
        request.user.save()
        update_session_auth_hash(request, request.user)  # Important to keep the user logged in

        return JsonResponse({'success': 'Password changed successfully'})

    return JsonResponse({'error': 'Invalid request method'}, status=400)

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

def shifumi_game_PVE(request):
    return render(request, 'spa/pages/shifumi_pve.html')

def pong_game(request, game_id):
    return render(request, 'spa/pages/pong.html', {'game_id': game_id})