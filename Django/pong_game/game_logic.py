import random
import math
import asyncio
from blockchain.ALL_FILE_NEEDED.blockchain_access import Add_game_history
from channels.db import database_sync_to_async

class PongGameLogic: 
    def __init__(self):
        self.width = 500
        self.height = 500
        self.paddle_width = 12
        self.paddle_height = 100
        self.ball_size = 10
        self.paddle_speed = 10
        self.init_ball_speed = 10
        self.ball_speed = self.init_ball_speed
        self.ball_speed_increase = 1
        self.max_score = 11

        self.players_usernames = [] #gives order of users
        self.paddles = {} # Player_username : {y : position }
        self.ball = self.__initialize_ball()
        self.scores = {}
        self.game_running :bool = False
        self.is_tournament :bool = False
        self.tournament_id = -1
        self.ending_normal = True

    def __initialize_ball(self):
        # Choose a random angle, excluding ±π/2
        angle = random.uniform(-math.pi, math.pi)
        while abs(abs(angle) - math.pi/2) < math.pi/4:  # Avoid angles too close to ±π/2
            angle = random.uniform(-math.pi, math.pi)

        return {
            'x': self.width // 2,
            'y': self.height // 2,
            'dx': math.cos(angle),
            'dy': math.sin(angle)
        }

    def add_player(self, username):
        if len(self.players_usernames) < 2:
            self.players_usernames.append(username)
            self.paddles[username] = {'y': self.height // 2 - self.paddle_height // 2}
            self.scores[username] = 0


    async def start(self, consumer):
        print(f'Starting game in python file with players: {self.players_usernames}')
        if len(self.players_usernames) == 2:
            self.game_running = True
            asyncio.create_task(self.__update(consumer))
        else:
            print(f'?? player are: {self.players_usernames}')
        
    async def __update(self, consumer):
        print('Thread is starting')
        while self.game_running:
            self.__update_ball_position()
            # Send game state update to all players_usernames
            await self.__send_game_state(consumer)

            await asyncio.sleep(0.03)
        
        print('thread finishing game')
        if (self.ending_normal):
            await self.finish_game(consumer)

    async def __send_game_state(self, consumer):
        await consumer.channel_layer.group_send(
            consumer.room_group_name,
            {
                'type': 'game_state_update',
                'game_state': {
                    'paddles': self.paddles,
                    'ball': self.ball,
                    'scores': self.scores
                }
            }
        )
    @database_sync_to_async
    def __add_tournament_game(self):
        from .models import Tournament
        tournament = Tournament.objects.get(id=self.tournament_id)
        print('finised finding game')
        tournament.add_game(self.scores)
        print('finised __add_tournament')

    async def finish_game(self, consumer):
        if (self.is_tournament):
            await self.__add_tournament_game()
        else:
            Add_game_history(self.scores, 'pong')
            
        print('before sending message through websocket');
        await consumer.channel_layer.group_send(
            consumer.room_group_name,
            {
                'type': 'game_over',
                'game_state': {
                    'paddles': self.paddles,
                    'ball': self.ball,
                    'scores': self.scores
                },
                'is_tournament': self.is_tournament,
            }
        )

    def __update_ball_position(self):
        if not self.game_running or len(self.players_usernames) != 2:
            return

        # Calculate future position
        future_x = self.ball['x'] + self.ball['dx'] * self.ball_speed
        future_y = self.ball['y'] + self.ball['dy'] * self.ball_speed

        # Check collision with top and bottom walls
        if future_y <= 0 + self.ball_size or future_y >= self.height - self.ball_size:
            self.ball['dy'] *= -1
            future_y = max(0, min(future_y, self.height - self.ball_size))  # Keep within bounds

        # Get player paddle positions
        player1, player2 = self.players_usernames[0], self.players_usernames[1]
        paddle1_y = self.paddles[player1]['y']
        paddle2_y = self.paddles[player2]['y']

        # Check collision with paddles
        if (future_x <= self.paddle_width and
            paddle1_y - self.ball_size / 2 <= self.ball['y'] <= paddle1_y + self.paddle_height + self.ball_size / 2):
            self.__handle_paddle_collision(player1)
        elif (future_x >= self.width - self.paddle_width - self.ball_size and
            paddle2_y - self.ball_size / 2 <= self.ball['y'] <= paddle2_y + self.paddle_height + self.ball_size / 2):
            self.__handle_paddle_collision(player2)
        else:   # Update ball position
            self.ball['x'] = future_x
            self.ball['y'] = future_y

        # Scoring
        if self.ball['x'] <= 0:
            self.scores[player2] += 1
            self.__reset_ball()
        elif self.ball['x'] >= self.width - self.ball_size:
            self.scores[player1] += 1
            self.__reset_ball()

        # End game
        if self.scores[player1] >= self.max_score or self.scores[player2] >= self.max_score:
            print('Game finished');
            self.game_running = False

    def __handle_paddle_collision(self, player):
        paddle_center = self.paddles[player]['y'] + self.paddle_height / 2
        hit_position = (self.ball['y'] - paddle_center) / (self.paddle_height / 2)
        
        # Calculate new angle based on hit position
        angle = hit_position * (math.pi / 3)  # Max angle of 60 degrees (pi/3 radians)
        
        self.ball['dx'] = -1 if player == self.players_usernames[1] else 1  # Reverse x direction
        self.ball['dx'] *= math.cos(angle)
        self.ball['dy'] = math.sin(angle)
        
        # Increase ball speed
        self.ball_speed += self.ball_speed_increase

        # Update Ball position
        self.ball['x'] = self.ball['x'] + self.ball['dx'] * self.ball_speed
        self.ball['y'] = self.ball['y'] + self.ball['dy'] * self.ball_speed

    def __reset_ball(self):
        self.ball = self.__initialize_ball()
        self.ball_speed = self.init_ball_speed

    def get_game_state(self):
        return {
            'paddles': self.paddles,
            'ball': self.ball,
            'scores': self.scores
        }

    def move_paddle(self, username, direction):
        if username in self.paddles:
            paddle = self.paddles[username]
            if direction == 'up':
                paddle['y'] = max(0, paddle['y'] - self.paddle_speed)
            elif direction == 'down':
                paddle['y'] = min(self.height - self.paddle_height, paddle['y'] + self.paddle_speed)
