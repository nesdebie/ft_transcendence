from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
from blockchain.ALL_FILE_NEEDED.get_match_data import get_match_data
from blockchain.ALL_FILE_NEEDED.set_match_data import set_match_data


class MyAccountManager(BaseUserManager):
	def create_user(self, username, password=None, **extra_fields):
		if not username:
			raise ValueError("The Username field must be set")
		if 'image' not in extra_fields or not extra_fields['image']:
			extra_fields['image'] = 'profile_pics/default.jpg'
		
		user = self.model(username=username, **extra_fields)
		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_superuser(self, username, password=None, **extra_fields):
		extra_fields.setdefault('is_staff', True)
		extra_fields.setdefault('is_superuser', True)

		if extra_fields.get('is_staff') is not True:
			raise ValueError("Superuser must have is_staff=True.")
		if extra_fields.get('is_superuser') is not True:
			raise ValueError("Superuser must have is_superuser=True.")

		return self.create_user(username, password, **extra_fields)


class Player(AbstractUser):
	username 			= models.CharField(max_length=30, unique=True)
	email 				= models.EmailField(verbose_name="email", max_length=60, unique=True)
	profile_picture 	= models.ImageField(max_length=255, upload_to='profile_pics', default='profile_pics/default.jpg')

	nickname 			= models.CharField(max_length=100, blank=True, default='')
	online_status		= models.BooleanField(default=False)

	activation_code 	= models.CharField(max_length=32, blank=True, null=True)  # Ajout de l'attribut activation_code
	two_factor_enabled 	= models.BooleanField(default=False)  # Ajout de l'attribut two_factor_enabled

	active_shifumi_game = models.CharField(max_length=100, null=True, blank=True)

	friends 			= models.ManyToManyField('self', through='Friendship', symmetrical=False, related_name='related_friends')
	friend_requests 	= models.ManyToManyField('self', through='FriendRequest', symmetrical=False, related_name='related_friend_requests')
	blocked_players 	= models.ManyToManyField('self', through='Block', symmetrical=False, related_name='related_blocked_players')

	object = MyAccountManager()
	
	def save(self, *args, **kwargs):
		# Set default value for nickname if empty
		if not self.nickname:
			self.nickname = self.username
		if not self.profile_picture:
			self.profile_picture = 'profile_pics/default.jpg'
		super().save(*args, **kwargs)

	def get_friends(self):
		return self.friends.all()

	def is_friend(self, player: 'Player') -> bool:
		try:
			friendship = Friendship.objects.get(from_user=self, to_user=player)
			return True
		except Friendship.DoesNotExist:
			return False

	def get_friendship(self, player: 'Player'):
		""" return firendship, if it exist or NONE otherwise """
		try:
			friendship = Friendship.objects.get(from_user=self, to_user=player)
			return friendship
		except Friendship.DoesNotExist:
			return None

	def get_received_friend_requests(self):
		return FriendRequest.objects.filter(to_user=self)

	def get_sent_friend_requests(self):
		return FriendRequest.objects.filter(from_user=self)

	def get_blocked_players(self):
		return Block.objects.filter(from_user=self).values_list('to_user', flat=True)

	def has_blocked(self, player: 'Player'):
		"""  Return the Blocked instance if it exist else return false """
		try:
			block = Block.objects.get(from_user=self, to_user=player) 
			return block
		except Block.DoesNotExist:
			return False

	def get_active_shifumi_game(self):
		return self.active_shifumi_game

	def set_active_shifumi_game(self, room_name):
		self.active_shifumi_game = room_name
		self.save()

	def clear_active_shifumi_game(self):
		self.active_shifumi_game = None
		self.save()

	def __str__(self):
		return self.username


class Friendship(models.Model):
	from_user = models.ForeignKey(Player, related_name='friendships_from', on_delete=models.CASCADE)
	to_user = models.ForeignKey(Player, related_name='friendships_to', on_delete=models.CASCADE)
	created_on = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('from_user', 'to_user')
	
	def __str__(self):
		return f"{self.from_user.username} is friends with {self.to_user.username}"

class FriendRequest(models.Model):
	from_user = models.ForeignKey(Player, related_name='sent_friend_requests', on_delete=models.CASCADE)
	to_user = models.ForeignKey(Player, related_name='received_friend_requests', on_delete=models.CASCADE)
	created_on = models.DateTimeField(auto_now_add=True)

	class Meta:
		unique_together = ('from_user', 'to_user')
	
	def __str__(self):
		return f"{self.from_user.username} sent a friend request to {self.to_user.username}"

class Block(models.Model):
	from_user = models.ForeignKey(Player, related_name='blocking', on_delete=models.CASCADE)
	to_user = models.ForeignKey(Player, related_name='blocked_by', on_delete=models.CASCADE)
	created_on = models.DateTimeField(auto_now_add=True)
	
	def __str__(self):
		return f"{self.blocker.username} blocked {self.blocked.username}"

class OnlineStatus(models.Model):
	user = models.OneToOneField(Player, on_delete=models.CASCADE)
	is_online = models.BooleanField(default=False)
	last_seen = models.DateTimeField(default=timezone.now)


class Message(models.Model):
    sender = models.ForeignKey(Player, related_name='sent_messages', on_delete=models.CASCADE)
    receiver = models.ForeignKey(Player, related_name='received_messages', on_delete=models.CASCADE)
    message = models.TextField()
    message_type = models.CharField(max_length=20, default='chat_message')
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.sender} to {self.receiver} at {self.timestamp}'