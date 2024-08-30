import random
import math
import asyncio

class PongGameLogic: 
    def __init__(self):
        self.width = 500
        self.height = 500
        self.paddle_width = 15
        self.paddle_height = 150
        self.ball_size = 10
        self.paddle_speed = 10
        self.ball_speed = 5
        self.ball_speed_increase = 1
        self.max_score = 5

        self.players_usernames = [] #gives order of users
        self.paddles = {} # Player_username : {y : position }
        self.ball = self.__initialize_ball()
        self.scores = {}
        self.game_running = False

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
        
        await self.__finish_game(consumer)

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

    async def __finish_game(self, consumer):
        await consumer.channel_layer.group_send(
            consumer.room_group_name,
            {
                'type': 'game_over',
                'game_state': {
                    'paddles': self.paddles,
                    'ball': self.ball,
                    'scores': self.scores
                }
            }
        )

    def __update_ball_position(self):
        if not self.game_running or len(self.players_usernames) != 2:
            return

        self.ball['x'] += self.ball['dx'] * self.ball_speed
        self.ball['y'] += self.ball['dy'] * self.ball_speed

        # Ball collision with top and bottom walls
        if self.ball['y'] <= 0 or self.ball['y'] >= self.height - self.ball_size:
            self.ball['dy'] *= -1

        # Ball collision with paddles
        player1, player2 = self.players_usernames[0], self.players_usernames[1]

        # Check collision with left paddle (player1)
        if (self.ball['x'] <= self.paddle_width and
            self.paddles[player1]['y'] <= self.ball['y'] <= self.paddles[player1]['y'] + self.paddle_height):
            self.__handle_paddle_collision(player1)

        # Check collision with right paddle (player2)
        elif (self.ball['x'] >= self.width - self.paddle_width - self.ball_size and
            self.paddles[player2]['y'] <= self.ball['y'] <= self.paddles[player2]['y'] + self.paddle_height):
            self.__handle_paddle_collision(player2)

        # Scoring
        if self.ball['x'] <= 0:
            self.scores[player2] += 1
            self.__reset_ball()
        elif self.ball['x'] >= self.width - self.ball_size:
            self.scores[player1] += 1
            self.__reset_ball()
        
        # End game
        if self.scores[player1] >= self.max_score or self.scores[player2] >= self.max_score:
            self.game_running = False

    def __handle_paddle_collision(self, player):
        paddle_center = self.paddles[player]['y'] + self.paddle_height / 2
        hit_position = (self.ball['y'] - paddle_center) / (self.paddle_height / 2)
        
        # Calculate new angle based on hit position
        angle = hit_position * (math.pi / 4)  # Max angle of 45 degrees (pi/4 radians)
        
        self.ball['dx'] = -1 if player == self.players_usernames[1] else 1  # Reverse x direction
        self.ball['dx'] *= math.cos(angle)
        self.ball['dy'] = math.sin(angle)
        
        # Increase ball speed
        self.ball_speed += self.ball_speed_increase

    def __reset_ball(self):
        self.ball = self.__initialize_ball()
        self.ball_speed = 5

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
