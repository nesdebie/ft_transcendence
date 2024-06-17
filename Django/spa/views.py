from django.shortcuts import render, get_object_or_404
from users.models import Player 

def index(request):
    return render(request, 'spa/index.html')

def pages(request, page):
    return render(request, f'spa/pages/{page}')

def view_profile(request, username):
    user_profile = get_object_or_404(Player, username=username)
    return render(request, 'spa/pages/profile.html', {'user_profile': user_profile})

def view_friend_requests(request):
    received_requests = request.user.received_friend_requests.all()
    return render(request, 'spa/friend_requests.html', {'received_requests': received_requests})