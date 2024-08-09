from django.shortcuts import render, redirect, get_object_or_404
from users.models import Player, FriendRequest, Block
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.urls import reverse
from django.http import JsonResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os

def index(request):
    if request.user.is_authenticated:
        return redirect('self_profile')
    return render(request, 'spa/index.html')

def pages(request, page):
    return render(request, f'spa/pages/{page}.html')

@login_required
def view_self_profile(request):
    print("view_self_profile called")  # Debug statement
    user_profile = request.user
    print(f"user_profile: {user_profile}")  # Debug statement
    return render(request, 'spa/pages/profile.html', {'user_profile': user_profile, 'is_own_profile': True})

@login_required
def view_profile(request, username):
    print("view_profile called with username:", username)  # Debug statement
    user = request.user
    user_profile = get_object_or_404(Player, username=username)

    context = {
        'user_profile':     user_profile,
        'is_own_profile':   False,
        'friends':          user.is_friend(player=user_profile),
        'request_pending':  FriendRequest.objects.filter(from_user=user, to_user=user_profile).first(),
        'blocked':          Block.objects.filter(from_user=user, to_user=user_profile).first()
    }
    
    print("User profile context:", context)  # Debug statement
    return render(request, 'spa/pages/profile.html', context)

@login_required
def view_friend_requests(request):
    print("view_friend_requests called")  # Debug statement
    user = request.user
    received_requests = FriendRequest.objects.filter(to_user=user)
    friends = user.friends.all()
    
    context = {
        'received_requests': received_requests,
        'friends': friends,
    }
    return render(request, 'spa/pages/friend_requests.html', context)

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
            if profile_picture.content_type != 'image/png':
                return JsonResponse({'errors': {'image': 'Profile picture must be a PNG file'}}, status=400)

            username = request.user.username
            image_name = f"{username}.png"
            image_path = os.path.join('profile_pics', image_name)

            # Delete the old profile picture if it exists
            if default_storage.exists(image_path):
                default_storage.delete(image_path)

            # Save the new profile picture
            default_storage.save(image_path, ContentFile(profile_picture.read()))
            request.user.profile_picture = image_path
            request.user.save()
            return JsonResponse({'status': 'success', 'profile_picture': request.user.profile_picture.url})
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
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'invalid method'}, status=405)
