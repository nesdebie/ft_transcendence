from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .models import Player, FriendRequest, Friendship, Block
from django.http import JsonResponse
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render, redirect, get_object_or_404
from django.conf import settings 
import requests 
from django.contrib.auth import update_session_auth_hash
from django.db import IntegrityError
import re
import jwt
import datetime


# LOGIN 42 AUTH 

from django.http import JsonResponse
from django.contrib.auth import login
from django.views.decorators.csrf import csrf_protect
from .models import Player


from django.contrib.auth import login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from .models import Player

@csrf_protect
def login_user_by_username(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        if not username:
            return JsonResponse({'errors': {'login-user': 'Username is required'}}, status=400)
        
        try:
            user = Player.objects.get(username=username)
            login(request, user) 
            return JsonResponse({
                'status': 'success',
                'message': f'User {username} logged in successfully.'
            })
        except Player.DoesNotExist:
            return JsonResponse({'errors': {'login-user': 'User does not exist'}}, status=400)
        except Exception as e:
            return JsonResponse({'errors': {'login-user': f'An unexpected error occurred: {str(e)}'}}, status=500)
    else:
        return JsonResponse({'status': 'invalid method'}, status=405)


@csrf_protect
def find_user_for_login_with_username(request):
    if request.method == 'POST':
       
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Invalid authorization header'}, status=401)

        jwt_token = auth_header.split(' ')[1]
        try:
            payload = jwt.decode(jwt_token, settings.SECRET_KEY, algorithms=['HS256'])
            jwt_username = payload.get('username')
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)

        # verify user name 
        username = request.POST.get('username')
        if not username:
            return JsonResponse({'errors': {'find-user': 'Username is required'}}, status=400)
        
        # compare user name in db with jwt token 
        if jwt_username != username:
            return JsonResponse({'error': 'JWT username does not match the provided username'}, status=401)

        try:
            user = Player.objects.get(username=username)

            if user.auth_42:
                if user.two_factor_enabled:
                    return JsonResponse({
                        'status': 'success',
                        'user_exists': True,
                        'two_factor_enabled': True
                   })
                else:
                    login(request, user)
                    return JsonResponse({
                        'status': 'success',
                        'user_exists': True,
                        'two_factor_enabled': False
                   })
            else:
                base_username = f"{username}_42"
                i = 1
                while True:
                    try:
                        user = Player.objects.get(username=base_username)
                        if user.auth_42:
                            break
                        base_username = f"{username}_42_{i}"
                        i += 1
                    except Player.DoesNotExist:
                        break
                if not user.auth_42:
                    return JsonResponse({'errors': {'login': 'User does not exist'}}, status=400)
                if user.two_factor_enabled:
                    return JsonResponse({
                        'status': 'success',
                        'user_exists': True,
                        'two_factor_enabled': True
                   })
                else:
                    login(request, user)
                    return JsonResponse({
                        'status': 'success',
                        'user_exists': True,
                        'two_factor_enabled': False
                   })

        except Player.DoesNotExist:
            return JsonResponse({'errors': {'login': 'User does not exist'}}, status=400)
        except Exception as e:
            return JsonResponse({'errors': {'find-user': f'An unexpected error occurred: {str(e)}'}}, status=500)
    else:
        return JsonResponse({'status': 'invalid method'}, status=405)

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


from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse
from .models import Player
from .forms import UserProfileForm

from django.http import JsonResponse

# gen password for user
import random
import string

def generate_strong_password(length=12):
    """Génère un mot de passe robuste avec des lettres majuscules, minuscules, des chiffres et des caractères spéciaux."""
    characters = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(random.choice(characters) for i in range(length))
    return password

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
		
        # Debug: Print the full JSON response to the console
        # print(user_info)
		
        # Générer un mot de passe robuste
        generated_password = generate_strong_password()
		
        # Récupérer l'URL de la photo de profil
        profile_image_url = user_info.get('image', {}).get('versions', {}).get('medium', '')
        user_login = user_info.get('login', '')

        ######## gen JWT token 
        payload = {
            'user_id': user_login,
            'username': user_login,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24),
            'iat': datetime.datetime.utcnow()
        }
        jwt_token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

        # Utilisation uniquement de localStorage pour transmettre les informations
        response_script = f"""
        <script>
            localStorage.setItem('user_info', JSON.stringify({{
                username: '{user_info.get('login', '')}',
                email: '{user_info.get('email', '')}',
                nickname: '{user_info.get('login', '')}', 
                password: '{generated_password}', 
                profile_image: '{profile_image_url}'

            }}));

            localStorage.setItem('is_connected_with_42', 'true');

            localStorage.setItem('jwt_token', '{jwt_token}');

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
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from django.views.decorators.http import require_POST
import shutil


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            
            if user.two_factor_enabled:
                #login(request, user)  # Authentifier l'utilisateur

                return JsonResponse({
                    'status': 'success',
                    'two_factor_enabled': True,
                    'username': user.username
                })

            else:
                login(request, user)
                return JsonResponse({'status': 'success'})
			
        return JsonResponse({'errors': {'login': 'Player does not exist or password is wrong'}}, status=400)
    
    return JsonResponse({'status': 'invalid method'}, status=405)


from django.http import JsonResponse
import pyotp
import qrcode
import base64
from io import BytesIO

from django.http import JsonResponse




# WORKS 
def generate_qr_code(request):
    if request.method == 'POST':
        secret = pyotp.random_base32()  # Génère un secret temporaire
        otp_url = pyotp.totp.TOTP(secret).provisioning_uri(name=request.POST.get('username'), issuer_name='Transcendence')
        qr = qrcode.make(otp_url)
        qr_bytes = BytesIO()
        qr.save(qr_bytes)

        qr_base64 = base64.b64encode(qr_bytes.getvalue()).decode('utf-8')

        # Stocke le secret temporairement dans la session
        # request.session['temp_2fa_secret'] = secret
        # return JsonResponse({'qr_code_base64': qr_base64})

		###########################
		# test local storage 
		# Renvoyer le secret au client pour qu'il soit stocké dans localStorage
        return JsonResponse({'qr_code_base64': qr_base64, 'secret': secret})
		##########################

    return JsonResponse({'error': 'Invalid method'}, status=405)

# WORKS 
def register_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        email = request.POST.get('email')
        image = request.FILES.get('image')
        two_factor_auth = request.POST.get('two_factor_auth') == 'on'
		############### test local storage 
        secret = request.POST.get('2fa_secret')  # Récupérer le secret depuis le POST
		##################
        # Récupérer l'état 42 AUTH à partir du formulaire ou POST
        auth_42 = request.POST.get('auth_42') == 'true'

        errors = {}

        if not is_valid_username(username):
            errors['username'] = "Invalid username. Usernames cannot contain special characters."
        if Player.objects.filter(username=username).exists():
            if auth_42:
                base_username = username + '_42'
                new_username = base_username
                i = 1
                while Player.objects.filter(username=new_username).exists():
                    new_username = f"{base_username}_{i}"
                    i += 1
                username = new_username
            else:
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
            profile_picture=image,
            auth_42=auth_42 
        )

        if two_factor_auth:
            # local storage 
            if secret:
                print("Activation code is ok")
                user.activation_code = secret
                user.two_factor_enabled = True
                user.save()

            # Génération du QR code et enregistrement comme avant
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

def is_valid_username(username):
    # Regex to allow only alphanumeric characters and underscores
    return re.match(r'^[\w]+$', username) is not None

def logout_view(request):
    logout(request)
    return JsonResponse({'status': 'success'})

@csrf_exempt
def check_authentication(request):
	if request.user.is_authenticated:
		return JsonResponse({'authenticated': True, 'user_id': request.user.id})
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
        try:
            to_user = Player.object.get(username=username)
            if Block.objects.filter(from_user=from_user, to_user=to_user).exists():
                Block.objects.filter(from_user=from_user, to_user=to_user).delete()  # Use filter() instead of get()
                return JsonResponse({'status': 'success'})
            else:
                return JsonResponse({'errors': {'unblock': f'You haven\'t blocked {to_user.username} yet, so you cannot unblock them'}}, status=400)
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
			return JsonResponse({'errors': {'find-user': 'User try to find himself/herself'}}, status=404)
		try:
			user = Player.object.get(username=username)
			if (user.has_blocked(player=request.user)):
				return JsonResponse({'errors': {'find-user': 'User does not exist'}}, status=404)
			return JsonResponse({'status': 'success'})
		except Player.DoesNotExist:
			return JsonResponse({'errors': {'find-user': 'User does not exist'}}, status=404)
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

@csrf_exempt
def change_nickname(request):
    if request.method != 'POST':
        return JsonResponse({'errors': {'nickname': 'Wrong method'}}, status=405)
    
    nickname = request.POST.get('nickname')
    if Player.objects.filter(username=nickname).exists():
        return JsonResponse({'errors': {'nickname': 'This nickname cannot be the same as another user\'s username'}}, status=400)


    user :Player = request.user
    user.nickname = nickname
    try:
        user.save()
        return JsonResponse({'status': 'success', 'nickname': user.nickname}, status=200)
    except IntegrityError:
        return JsonResponse({'errors': {'nickname': 'This nickname has already be chosen'}}, status=400)
    except Exception as e:
        return JsonResponse({'errors': {'nickname': e}}, status=400)
    
    