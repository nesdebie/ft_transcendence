import logging
from django.shortcuts import render, get_object_or_404
from users.models import Player, FriendRequest, Block, Message
from django.db.models import Q

logger = logging.getLogger(__name__)

def index(request):
	return render(request, 'spa/index.html')

def pages(request, page):
	logger.debug(f'View function reached for page {page}')
	return render(request, f'spa/pages/{page}.html')

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
		'received_requests':	FriendRequest.objects.filter(to_user=user),
		'friends':				user.friends.all()
	}
	
	return render(request, 'spa/pages/profile.html', context)



def view_profile(request, username):
	user: Player = request.user
	user_profile: Player = get_object_or_404(Player, username=username)


	context = {
		'user_profile':			user_profile,
		'is_own_profile':		False,
		'friendship':			user.get_friendship(player=user_profile) if user.is_friend(user_profile) else None,
		'request_pending':		FriendRequest.objects.filter(from_user=user, to_user=user_profile).first(),
		'blocked':				Block.objects.filter(from_user=user, to_user=user_profile).first(),
		'received_requests':	None,
		'friends':				None,
	}
	print(context)
	return render(request, 'spa/pages/profile.html', context)

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
	# Get the user to chat with
	if username:
		user_to_chat = get_object_or_404(Player, username=username)
	else:
		user_to_chat = None

	# Get all users except the current user
	users = Player.objects.exclude(username=request.user.username)
	messages = []
	if user_to_chat:
		messages = Message.objects.filter(
			(Q(sender=request.user) & Q(receiver=user_to_chat)) |
			(Q(sender=user_to_chat) & Q(receiver=request.user))
		).order_by('timestamp')
		
	context = {
		'users': users,
		'user_to_chat': user_to_chat,
		'messages': messages,
	}
	return render(request, 'spa/pages/chat.html', context)

