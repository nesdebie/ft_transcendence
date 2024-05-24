from django.contrib.auth import authenticate, login, logout
from .models import Player
from django.http import JsonResponse
import json

def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'status': 'success'})
        return JsonResponse({'status': 'failure'}, status=400)
    return JsonResponse({'status': 'invalid method'}, status=405)

def register_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        level = data.get('level')
        if Player.objects.filter(username=username).exists():
            return JsonResponse({'status': 'user exists'}, status=400)
        user = Player.objects.create_user(username=username, password=password, level=level)
        login(request, user)
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'invalid method'}, status=405)

def logout_view(request):
    logout(request)
    return JsonResponse({'status': 'success'})

def check_authentication(request):
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True})
    else:
        return JsonResponse({'authenticated': False})

def user_level(request):
    if request.user.is_authenticated:
        level = request.user.level
        return JsonResponse({'level': level})
    else:
        return JsonResponse({'error': 'User not authenticated'}, status=401)
