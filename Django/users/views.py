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
		return JsonResponse({'errors': {'login': 'Player does not exist or password is wrong'}}, status=400)
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
			profile_picture = image
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
	profile_picture = request.user.profile_picture.url
	return JsonResponse({'profile_picture': profile_picture})


def send_friend_request(request):
	if request.method == 'POST':
		username = request.POST.get('username')
		from_user = request.user
		try:
			to_user = Player.object.get(username=username)
			if not FriendRequest.objects.filter(from_user=from_user, to_user=to_user).exists()\
				and not FriendRequest.objects.filter(from_user=to_user, to_user=from_user).exists():

				FriendRequest.objects.get_or_create(from_user=request.user, to_user=to_user)
				return JsonResponse({'status': 'succes'})
			else:
				return JsonResponse ({'errors': {'friend_request': f'There is already a friend request between you and {to_user.username}\nAccepts his or wait for his to accept yours'}}, status=400)
		except Player.DoesNotExist:
			return JsonResponse({"errors": {'friend_request': f'{username} does not exist in the database'}})
	return JsonResponse({'status': 'invalid method'}, status=405)



def accept_friend_request(request, request_id):
	try:
		request = FriendRequest.objects.get(id=request_id)
	except FriendRequest.DoesNotExist:
		return JsonResponse({'errors': {'accept-friend-request': 'Friend request does not exist anymore'}}, status=500)
	from_user = request.from_user
	to_user = request.to_user
	Friendship.objects.get_or_create(from_user=from_user, to_user=to_user)
	Friendship.objects.get_or_create(from_user=to_user, to_user=from_user)
	request.delete()
	return JsonResponse({'status': 'succes'})


def deny_friend_request(request, request_id):
	try:
		request = FriendRequest.objects.get(id=request_id)
	except FriendRequest.DoesNotExist:
		return JsonResponse({'errors': {'deny-friend-request': 'Friend request does not exist anymore'}}, status=500)
	request.delete()
	return JsonResponse({'status': 'succes'})


def block_user(request):
	if request.method == 'POST':
		username = request.POST.get('username')
		from_user = request.user
		try :
			to_user = Player.object.get(username=username)
			if not Block.objects.filter(from_user=from_user, to_user=to_user).exists():
				Block.objects.get_or_create(from_user=request.user, to_user=to_user)
				return JsonResponse({'status': 'succes'})
			else:
				return JsonResponse ({'errors': {'block_user': f'There is already a blokking between you and {to_user.username}'}}, status=400)
		except Player.DoesNotExist:
			return JsonResponse({'errors': {'block_user': 'User does not exist'}})

	return JsonResponse({'status': 'invalid method'}, status=405)

def user_data(request, username):
	user = get_object_or_404(Player, username=username)

	data = {
		'username': 		user.username,
		'email':			user.email,
		'profile_picture.url':	user.profile_picture.url,
		'nickname':			user.nickname
	}
	return JsonResponse(data)

def current_user_data(request):
	username = request.user.username
	return user_data(request, username=username)

def find_user(request):
	if request.method == 'POST':
		username	= request.POST.get('username')
		if username == request.user.username:
			return JsonResponse({'errors': {'find-user': 'are you trying to break be by looking for yourself ?'}}, status=400)
		try:
			user = Player.object.get(username=username)
			return JsonResponse({'status': 'success'})
		except Player.DoesNotExist:
			return JsonResponse({'errors': {'find-user': 'User does not exist'}}, status=400)
	else:
		return JsonResponse({'status': 'invalid method'}, status=405)