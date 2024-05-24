from django.contrib.auth.models import AbstractUser
from django.db import models

class Player(AbstractUser):
    level = models.IntegerField(default=1)

    def __str__(self):
        return self.username