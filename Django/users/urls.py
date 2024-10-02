from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('check_authentication/', views.check_authentication, name='check_authentication'),
    path('user_profile_picture/', views.user_profile_picture, name='user_profile_picture'),
    path('send_friend_request/', views.send_friend_request, name='send_friend_request'),
    path('remove_friend_request/', views.remove_friend_request, name='remove_friend_request'),
    path('accept_friend_request/<int:request_id>/', views.accept_friend_request, name='accept_friend_request'),
    path('deny_friend_request/<int:request_id>/', views.deny_friend_request, name='deny_friend_request'),
    path('remove_friend/', views.remove_friend, name='remove_friend'),
    path('block_user/', views.block_user, name='block_user'),
    path('unblock_user/', views.unblock_user, name='unblock_user'),
    path('user_data/', views.current_user_data, name='current_user_data'),
    path('user_data/<str:username>', views.user_data, name='user_data'),
    path ('find_user/', views.find_user, name='find_user'),
    path('update_profile_picture/', views.update_profile_picture, name='update_profile_picture'),
    path('change_password/', views.change_password, name='change_password'),
	
    # 2FA 
    path('verify_otp/', views.verify_otp, name='verify_otp'),
    path('generate_qr_code/', views.generate_qr_code, name='generate_qr_code'),

    # LOGIN 42 AUTH
	path('find_user_for_login_with_username/', views.find_user_for_login_with_username, name='find_user_for_login_with_username'),
    path('login_user/', views.login_user_by_username, name='login_user_by_username'),

    # AUTH 
    path('login_42/', views.login_42, name='login_42'),
    path('callback/', views.callback, name='callback'),

    path('change_nickname/', views.change_nickname, name='change_nickname'),
]
