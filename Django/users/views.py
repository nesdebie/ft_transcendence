from django.contrib.auth import authenticate, login, logout
from .models import Player, FriendRequest, Friendship, Block
from django.http import JsonResponse
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import json
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect, get_object_or_404

def login_view(request):
	if request.method == 'POST':
		username = request.POST.get('username')
		password = request.POST.get('password')
		user = authenticate(request, username=username, password=password)
		if user is not None:
			login(request, user)
			return JsonResponse({'status': 'success'})
		return JsonResponse({'errors': {'password': 'Player does not exist or password is wrong'}}, status=400)
	return JsonResponse({'status': 'invalid method'}, status=405)

def register_view(request):
	if request.method == 'POST':
		username	= request.POST.get('username')
		password 	= request.POST.get('password')
		password2 	= request.POST.get('password2')
		email 		= request.POST.get('email')
		image		= request.FILES.get('image')
		nickname	= request.POST.get('nickname')
	
		errors = {}

		if Player.objects.filter(username=username).exists():
			errors['username'] = "Username exist already."

		if Player.object.filter(email=email).exists():
			errors['email'] = "This email is already used, if it is yours try to log in instead."

		try:
			validate_password(password, Player)
		except ValidationError as error:
			errors['password'] = error.messages
			

		if (password != password2):
			errors['password2'] = "Passwords don't match"

		if (errors):
			return JsonResponse({"errors": errors}, status=400)

		user = Player.objects.create_user(
			username=username, 
			password=password,
			email = email,
			nickname = nickname,
			image = image
			)
		login(request, user)
		return JsonResponse({'status': 'success'})
	return JsonResponse({'status': 'invalid method'}, status=405)

def logout_view(request):
	logout(request)
	return JsonResponse({'status': 'success'})

@csrf_exempt
def check_authentication(request):
	if request.user.is_authenticated:
		return JsonResponse({'authenticated': True})
	else:
		return JsonResponse({'authenticated': False})

def user_profile_picture(request):
	user_picture = request.user.image.url
	return JsonResponse({'user_picture': user_picture})


def send_friend_request(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        to_user = get_object_or_404(Player, username=username)
        FriendRequest.objects.get_or_create(from_user=request.user, to_user=to_user)
        return redirect('profile', username=username)
    return redirect('view_friend_requests')



def accept_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=request.user)
    Friendship.objects.get_or_create(from_user=friend_request.from_user, to_user=friend_request.to_user)
    friend_request.delete()
    return redirect('view_friend_requests')


def deny_friend_request(request, request_id):
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=request.user)
    friend_request.delete()
    return redirect('view_friend_requests')


def block_user(request, request_id):
    friend_request = get_object_or_404(FriendRequest, id=request_id, to_user=request.user)
    Block.objects.get_or_create(blocker=request.user, blocked=friend_request.from_user)
    friend_request.delete()
    return redirect('view_friend_requests')
