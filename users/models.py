from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models

class MyAccountManager(BaseUserManager):
	def create_user(self, username, password=None, **extra_fields):
		if not username:
			raise ValueError("The Username field must be set")
		extra_fields.setdefault('level', 1)
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
	username 	= models.CharField(max_length=30, unique=True)
	email 		= models.EmailField(verbose_name="email", max_length=60, unique=True)
	image 		= models.ImageField(max_length=255, upload_to='profile_pics', default='profile_pics/default.jpg')

	nickname = models.CharField(max_length=100, blank=True, default='')

	def save(self, *args, **kwargs):
		# Set default value for nickname if empty
		if not self.nickname:
			self.nickname = self.username
		if not self.image:
			self.image = 'profile_pics/default.jpg'
		super().save(*args, **kwargs)

	object = MyAccountManager()

	def __str__(self):
		return self.username

