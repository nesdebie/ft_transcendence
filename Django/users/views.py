from django.contrib.auth import authenticate, login, logout
from .models import Player, FriendRequest, Friendship, Block
from django.http import JsonResponse
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import json
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect, get_object_or_404
from . import views
from django.conf import settings  # Assurez-vous d'importer settings ici
import requests 

# AUTH 
from django.shortcuts import render, get_object_or_404
from .models import Player


import requests
from django.shortcuts import redirect, render
from django.http import HttpResponse
from django.conf import settings

def login_42(request):
    authorize_url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.CLIENT_ID}&redirect_uri={settings.REDIRECT_URI}&response_type=code"
    return redirect(authorize_url)

from django.shortcuts import render, redirect
from django.http import HttpResponse
from .models import Player
from .forms import UserProfileForm

from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .models import Player
from .forms import UserProfileForm

from django.http import JsonResponse

from django.http import HttpResponse

# AUTH 42
def callback(request):
    if request.method == 'GET':
        code = request.GET.get('code')
        if not code:
            return JsonResponse({"error": "No code provided."}, status=400)

        token_url = 'https://api.intra.42.fr/oauth/token'
        token_data = {
            'grant_type': 'authorization_code',
            'client_id': settings.CLIENT_ID,
            'client_secret': settings.CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.REDIRECT_URI,
        }
        token_response = requests.post(token_url, data=token_data)
        token = token_response.json().get('access_token')

        if not token:
            return JsonResponse({"error": "Failed to retrieve access token."}, status=400)

        user_info_response = requests.get('https://api.intra.42.fr/v2/me', headers={'Authorization': f'Bearer {token}'})
        user_info = user_info_response.json()

        # Utilisation uniquement de localStorage pour transmettre les informations
        response_script = f"""
        <script>
            localStorage.setItem('user_info', JSON.stringify({{
                username: '{user_info.get('login', '')}',
                email: '{user_info.get('email', '')}',
                nickname: '{user_info.get('login', '')}'
            }}));
            window.close();
        </script>
        """
        return HttpResponse(response_script)


# 2FA
import pyotp
import qrcode
import base64
from io import BytesIO
from django.contrib.auth import login


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            if user.two_factor_enabled:
                secret = user.activation_code
                otp_url = pyotp.totp.TOTP(secret).provisioning_uri(name=user.username, issuer_name='Transcendence')
                qr = qrcode.make(otp_url)
                qr_bytes = BytesIO()
                qr.save(qr_bytes)

                qr_base = qr_bytes.getvalue()
                qr_base64 = base64.b64encode(qr_base).decode('utf-8').replace('\n', '')

                login(request, user) # 2FA added so user can connect normally with 2 FA

                return JsonResponse({
                    'status': 'success',
                    'two_factor_enabled': True,
                    'qr_code_base64': qr_base64,
                    'username': user.username
                })
            else:
                login(request, user)
                return JsonResponse({'status': 'success'})
			
        return JsonResponse({'errors': {'login': 'Player does not exist or password is wrong'}}, status=400)
    
    return JsonResponse({'status': 'invalid method'}, status=405)

def register_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        email = request.POST.get('email')
        image = request.FILES.get('image')
        nickname = request.POST.get('nickname')
        two_factor_auth = request.POST.get('two_factor_auth') == 'on'
    
        errors = {}

        if Player.objects.filter(username=username).exists():
            errors['username'] = "Username already exists."

        if Player.objects.filter(email=email).exists():
            errors['email'] = "This email is already used, if it is yours try to log in instead."

        try:
            validate_password(password, Player)
        except ValidationError as error:
            errors['password'] = error.messages

        if password != password2:
            errors['password2'] = "Passwords don't match."

        if errors:
            return JsonResponse({"errors": errors}, status=400)

        user = Player.objects.create_user(
            username=username,
            password=password,
            email=email,
            nickname=nickname,
            profile_picture=image
        )
        if two_factor_auth:
            secret = pyotp.random_base32()
            user.activation_code = secret
            user.two_factor_enabled = True
            user.save()

            otp_url = pyotp.totp.TOTP(secret).provisioning_uri(name=user.username, issuer_name='Transcendence')
            qr = qrcode.make(otp_url)
            qr_bytes = BytesIO()
            qr.save(qr_bytes)

            qr_base = qr_bytes.getvalue()
            qr_base64 = base64.b64encode(qr_base).decode('utf-8').replace('\n', '')

            login(request, user)
            return JsonResponse({
                'status': 'success',
                'two_factor_enabled': True,
                'qr_code_base64': qr_base64
            })

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

def remove_friend_request(request):
	if request.method == 'POST':
		username = request.POST.get('username')
		from_user = request.user
		try:
			to_user = Player.object.get(username=username)
			if FriendRequest.objects.filter(from_user=from_user, to_user=to_user).exists():

				FriendRequest.objects.filter(from_user=from_user, to_user=to_user).delete()
				return JsonResponse({'status': 'succes'})
			else:
				return JsonResponse ({'errors': {'friend_request': f'You haven\'t send any friend request to {to_user.username}\n'}}, status=400)
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


def remove_friend(request):
	print('Removing friend')
	if request.method == 'POST':
		username = request.POST.get('username')
		from_user = request.user
		try:
			to_user = Player.object.get(username=username)
			if Friendship.objects.filter(from_user=from_user, to_user=to_user).exists() \
				or Friendship.objects.filter(from_user=to_user, to_user=from_user).exists():

				Friendship.objects.filter(from_user=from_user, to_user=to_user).delete()
				Friendship.objects.filter(from_user=to_user, to_user=from_user).delete()
				return JsonResponse({'status': 'succes'})
			else:
				return JsonResponse ({'errors': {'remove_friend': f'There isn\'t any friendshi between you and {to_user.username}\n'}}, status=400)
		except Player.DoesNotExist:
			return JsonResponse({"errors": {'remove_friend': f'{username} does not exist in the database'}})
	return JsonResponse({'status': 'invalid method'}, status=405)

def block_user(request):
	if request.method == 'POST':
		username = request.POST.get('username')
		from_user = request.user
		try :
			print(f'looking for user {username}')
			to_user = Player.object.get(username=username)
			print(f'found user {to_user}')
			if not Block.objects.filter(from_user=from_user, to_user=to_user).exists():
				Block.objects.get_or_create(from_user=request.user, to_user=to_user)
				return JsonResponse({'status': 'succes'})
			else:
				return JsonResponse ({'errors': {'block': f'There is already a blokking between you and {to_user.username}'}}, status=400)
		except Player.DoesNotExist:
			return JsonResponse({'errors': {'block': 'User does not exist'}}, status=400)

	return JsonResponse({'status': 'invalid method'}, status=405)

def unblock_user(request):
	if request.method == 'POST':
		username = request.POST.get('username')
		from_user = request.user
		try :
			to_user = Player.object.get(username=username)
			if Block.objects.filter(from_user=from_user, to_user=to_user).exists():
				Block.objects.get(from_user=request.user, to_user=to_user).delete()
				return JsonResponse({'status': 'succes'})
			else:
				return JsonResponse ({'errors': {'unblock': f'You haven\'t block {to_user.username} yet, so you can not unblock him'}}, status=400)
		except Player.DoesNotExist:
			return JsonResponse({'errors': {'unblock': 'User does not exist'}}, status=400)

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
			return JsonResponse({'errors': {'find-user': 'are you trying to break me by looking for yourself ?'}}, status=400)
		try:
			user = Player.object.get(username=username)
			if (user.has_blocked(player=request.user)):
				return JsonResponse({'errors': {'find-user': 'User does not exist'}}, status=400)
			return JsonResponse({'status': 'success'})
		except Player.DoesNotExist:
			return JsonResponse({'errors': {'find-user': 'User does not exist'}}, status=400)
	else:
		return JsonResponse({'status': 'invalid method'}, status=405)
	
# 2FA
def verify_otp(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        otp_code = request.POST.get('otp_code')
        try:
            user = Player.objects.get(username=username)
            otp = pyotp.TOTP(user.activation_code)
            if otp.verify(otp_code):
                return JsonResponse({'detail': 'OTP is valid'}, status=200)
            else:
                return JsonResponse({'detail': 'Invalid OTP'}, status=400)
        except Player.DoesNotExist:
            return JsonResponse({'detail': 'User not found'}, status=404)
    return JsonResponse({'detail': 'Invalid method'}, status=405)