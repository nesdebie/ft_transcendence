from django.contrib.auth import authenticate, login, logout
from .models import Player
from django.http import JsonResponse
import json

def login_view(request):
	if request.method == 'POST':
		username = request.POST.get('username')
		password = request.POST.get('password')
		user = authenticate(request, username=username, password=password)
		if user is not None:
			login(request, user)
			return JsonResponse({'message': 'success'})
		return JsonResponse({'status': 'failure'}, status=400)
	return JsonResponse({'status': 'invalid method'}, status=405)

def register_view(request):
	if request.method == 'POST':
		username	= request.POST.get('username')
		password 	= request.POST.get('password')
		password2 	= request.POST.get('password2')
		email 		= request.POST.get('email')
		image		= request.FILES.get('image')
		nickname	= request.POST.get('nickname')
	
		if (password != password2):
			return JsonResponse({'Error': 'passwords do not match'})
		user = Player.objects.create_user(
			username=username, 
			password=password,
			email = email,
			nickname = nickname,
			image = image
			)
		login(request, user)
		return JsonResponse({'message': 'success'})
	return JsonResponse({'status': 'invalid method'}, status=405)

def logout_view(request):
	logout(request)
	return JsonResponse({'message': 'success'})

def check_authentication(request):
	if request.user.is_authenticated:
		return JsonResponse({'authenticated': True})
	else:
		return JsonResponse({'authenticated': False})

def user_profile_picutre(request):
	user_picture = request.user.image.url
	return JsonResponse({'user_picture': user_picture})