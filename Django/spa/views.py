from django.shortcuts import render, get_object_or_404
from users.models import Player, FriendRequest, Friendship

def index(request):
	return render(request, 'spa/index.html')

def pages(request, page):
	return render(request, f'spa/pages/{page}.html')

def view_self_profile(request):
	 return render(request, 'spa/pages/profile.html', {'user_profile': request.user, 'is_own_profile': True})

def find_friend(user: Player, username):
	for friend in user.get_friends():
		if (friend.username == username):
			return friend
	return False

def view_profile(request, username):
	user = request.user
	user_profile = get_object_or_404(Player, username=username)

	context = {
		'user_profile':     user_profile,
		'is_own_profile':   False,
		'friend':           find_friend(user=user, username=username),
		'request_pending':  FriendRequest.objects.filter(from_user=user, to_user=user_profile).first()
	}
	
	return render(request, 'spa/pages/profile.html', context)

def view_friend_requests(request):
	user = request.user
	received_requests = FriendRequest.objects.filter(to_user=user)
	friends = user.friends.all()  # Assuming you have a ManyToManyField for friends in your Player model
	
	context = {
		'received_requests': received_requests,
		'friends': friends,
	}
	return render(request, 'spa/pages/friend_requests.html', context)