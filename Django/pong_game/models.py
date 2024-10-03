from django.db import models
from django.conf import settings
from blockchain.ALL_FILE_NEEDED.blockchain_access import Add_game_history, Game_history, Match_history

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
    game_type = models.CharField(max_length=20, choices=[('pong', 'Pong'),('shifumi', 'Shifumi')], default='pong')

    def __str__(self):
        return f"Matchmaking for {self.player.username}"
    

class Tournament(models.Model):
    number_of_players = models.IntegerField(default=2)
    players = models.JSONField(default=list)    
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)
    is_finished = models.BooleanField(default=False)
    scores = models.JSONField(default=dict)  # Store scores as a JSON field
    upcoming_games = models.JSONField(default=list)
    final_position = models.JSONField(default=list) #store the position of everybody at the end of the game

    def __str__(self):
        return f"Tournament: {self.number_of_players} players"

    def initialize_scores(self):
        for username in self.players:
            self.scores[username] = 0
        self.save()

    def get_upcoming_games(self):
        if self.is_active:
            return self.upcoming_games
        else:
            return []

    def get_upcoming_game(self, game_id):
    # Check if there is a game with the given game_id
        for game in self.upcoming_games:
            if game['game_id'] == game_id:
                return game
        return None    
            
    def get_game_history(self):
        if self.is_active:
            return Game_history(f'Tournament Match: {self.id}')
        else:
            return []

    def start(self):
        self.is_active = True
        # Initialize scores for all players
        for username in self.players:
            self.scores[username] = 0

        # Create upcoming games
        self.upcoming_games = []
        id = 0
        for i in range(len(self.players)):
            for j in range(i + 1, len(self.players)):
                id += 1
                self.upcoming_games.append({
                    'players': (self.players[i], self.players[j]),
                    'Players_joined': [],
                    'tournament_id': self.id,
                    'game_id': id
                })

        self.final_position = [[]] * self.number_of_players

        self.save()

    def add_game(self, scores:dict):
        Add_game_history(scores, f'Tournament Match: {self.id}'); # add the match to the blockchain
        print('Added Game in History')
        players = list(scores.keys())
        # remove the match from the upcoming games
        self.upcoming_games = [game for game in self.upcoming_games if not (
            (game['players'][0] == players[0] and game['players'][1] == players[1]) or
            (game['players'][0] == players[1] and game['players'][1] == players[0])
        )]
        # Add score into db
        self.__update_scores_from_blockchain()
        if not self.upcoming_games:
            print('starting end :)')
            self.end()
        self.save()

    def __update_scores_from_blockchain(self):
        games = Game_history(f'Tournament Match: {self.id}')
        print('found all games in tournament and updating scores')
        for player in self.scores:
            self.scores[player] = 0;
        for game in games:
            self.scores[game[4]] += 1
        print('score updated: ',self.scores)
        


    def end(self):
        """
        This function is called when the tournament is over.
        It adds the results to the blockchain as matches between the players.
        So that the first player will have {number_of_players} wins 
        if 2 players have the same points the one who won the game between them will have the top place
        In the edge case where more than 2 players have the same score the they will not have an entry in the blockchain
        for this tournament againt the other player with the same score so they will not lose nor win points 
        """
        self.is_finished = True
        sorted_players = sorted(self.scores.items(), key=lambda item: item[1], reverse=True)
        # Look up if players have the exact same score then put the one who won the game between the 2 at the top
        print("sorted Player retreived")
        for i in range(len(sorted_players) - 1):
            if (sorted_players[i][1] == sorted_players[i + 1][1] and (i == len(sorted_players) - 2 or sorted_players[i][1] != sorted_players[i + 2][1])): #if there is an equality
                print('found_player equal: ',sorted_players[i][0], sorted_players[i + 1][0])
                game = Match_history(sorted_players[i][0], sorted_players[i + 1][0], f'Tournament Match: {self.id}')
                print('equal game found: ', game);
                game = game[0]
                print('now game = ', game)
                if (game[4] == sorted_players[i + 1][0]):
                    sorted_players[i], sorted_players[i + 1] = sorted_players[i + 1], sorted_players[i]

        print("sorted Player doubles managed")
        for i in range(len(sorted_players)):
            for j in range(i + 1, len(sorted_players)):
                if sorted_players[i][1] > sorted_players[j][1]:
                    print('Adding to blockChain')
                    Add_game_history({sorted_players[i][0]: self.number_of_players - 1 - i, sorted_players[j][0]: self.number_of_players - 1 - j}, f'Tournament Result: {self.id}')
        self.__calculate_finish_positions(sorted_players)
        self.save()
    
    def __calculate_finish_positions(self, sorted_players):

        for i in range(self.number_of_players):
            if i < self.number_of_players - 2 and sorted_players[i][1] == sorted_players[i + 1][1] == sorted_players[i + 2][1]: #more than 2 player with the same score
                self.final_position[i + 2] = [sorted_players[i + j][0] for j in range(3)]
                i += 2
            else:
                self.final_position[i] = [sorted_players[i][0]]
        

