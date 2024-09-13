from django.db import models
from django.conf import settings
from blockchain.ALL_FILE_NEEDED.blockchain_acces import Add_game_history, Game_history

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
    room_name = models.CharField(max_length=70 ,default='')
    game = models.ForeignKey(PongGame, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Matchmaking for {self.player.username}"
    

class Tournament(models.Model):
    number_of_players = models.IntegerField(default=2)
    players = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='tournaments')
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    scores = models.JSONField(default=dict)  # Store scores as a JSON field
    upcoming_games = models.JSONField(default=list)

    def __str__(self):
        return f"Tournament: {self.number_of_players} players"

    def initialize_scores(self):
        for player in self.players.all():
            self.scores[player.username] = 0
        self.save()

    def get_upcoming_games(self):
        if self.is_active:
            return self.upcoming_games
        else:
            return []

    def get_upcoming_game(self, game_id):
        return next((game for game in self.upcoming_games if game['game_id'] == game_id), None)
    
    def get_game_history(self):
        if self.is_active:
            return Game_history(f'Tournament Match: {self.id}')
        else:
            return []

    def start(self):   
        self.is_active = True   
        # Initialize scores for all players
        for player in self.players.all():
            self.scores[player.username] = 0
        
        # Create upcoming games
        self.upcoming_games = []
        player_list = list(self.players.all())
        id = 0
        for i in range(len(player_list)):
            for j in range(i + 1, len(player_list)):
                id += 1;
                self.upcoming_games.append({
                    'players': (player_list[i].username, player_list[j].username),
                    'Players_joined': [],
                    'tournament_id': self.id,
                    'game_id': id
                })
        
        self.save()

    def add_game(self, scores:dict):
        Add_game_history(scores, f'Tournament Match: {self.id}'); # add the match to the blockchain
        players = list(scores.keys())
        
        # remove the match from the upcoming games
        self.upcoming_games = [game for game in self.upcoming_games if not (
            (game[0] == players[0] and game[1] == players[1]) or
            (game[0] == players[1] and game[1] == players[0])
        )]

    def end(self):
        """
        This function is called when the tournament is over.
        It adds the results to the blockchain as matches between the players.
        So that the first player will have {number_of_players} wins 
        """
        self.is_active = False
        sorted_players = sorted(self.scores.items(), key=lambda item: item[1], reverse=True)
        for i in range(len(sorted_players)):
            for j in range(i + 1, len(sorted_players)):
                if sorted_players[i][1] > sorted_players[j][1]:
                    Add_game_history({sorted_players[i][0]: self.number_of_players - 1 - i, sorted_players[j][0]: self.number_of_players - 1 - j}, f'Tournament Result: {self.id}')
                else:
                    Add_game_history({sorted_players[i][0]: self.number_of_players - 1 - i, sorted_players[j][0]: self.number_of_players - 1 - i}, f'Tournament Result: {self.id}')

        self.save()

