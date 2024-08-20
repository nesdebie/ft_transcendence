from django.db import models
from django.conf import settings

class PongGame(models.Model):
    player1 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='pong_games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='pong_games_as_player2', on_delete=models.CASCADE)
    score1 = models.IntegerField(default=0)
    score2 = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pong Game: {self.player1.username}: {self.score1} vs {self.player2.username}: {self.score2}"

class Matchmaking(models.Model):
    player = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    matched = models.BooleanField(default=False)
    game = models.ForeignKey(PongGame, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Matchmaking for {self.player.username}"