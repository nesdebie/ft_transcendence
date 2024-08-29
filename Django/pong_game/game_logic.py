import random
import threading
import asyncio

class PongGameLogic: 
    def __init__(self):
        self.width = 500
        self.height = 500
        self.paddle_width = 10
        self.paddle_height = 150
        self.ball_size = 10
        self.paddle_speed = 10
        self.ball_speed = 5
        self.ball_speed_increase = 0.5
        self.max_score = 10

        self.players_usernames = [] #gives order of users
        self.paddles = {} # Player_username : {y : position }
        self.ball = {'x': self.width // 2, 'y': self.height // 2, 'dx': random.choice([-1, 1]), 'dy': random.choice([-1, 1])}
        self.score = {}
        self.game_running = False



    def add_player(self, username):
        if len(self.players_usernames) < 2:
            self.players_usernames.append(username)
            self.paddles[username] = {'y': self.height // 2 - self.paddle_height // 2}
            self.score[username] = 0


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

            await asyncio.sleep(0.016)
        
        await self.__finish_game(consumer)

    async def __send_game_state(self, consumer):
        await consumer.channel_layer.group_send(
            consumer.room_group_name,
            {
                'type': 'game_state_update',
                'game_state': {
                    'paddles': self.paddles,
                    'ball': self.ball,
                    'score': self.score
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
                    'score': self.score
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
        player1, player2 = self.players_usernames
        if (self.ball['x'] <= self.paddle_width and
            self.paddles[player1]['y'] <= self.ball['y'] <= self.paddles[player1]['y'] + self.paddle_height) or \
           (self.ball['x'] >= self.width - self.paddle_width - self.ball_size and
            self.paddles[player2]['y'] <= self.ball['y'] <= self.paddles[player2]['y'] + self.paddle_height):
            self.ball['dx'] *= -1
            self.ball_speed += self.ball_speed_increase
        # Scoring
        if self.ball['x'] <= 0:
            self.score[player2] += 1
            self.__reset_ball()
        elif self.ball['x'] >= self.width - self.ball_size:
            self.score[player1] += 1
            self.__reset_ball()
        
        # end game
        if self.score[player1] >= self.max_score or self.score[player2] >= self.max_score:
            self.game_running = False

    def __reset_ball(self):
        self.ball = {'x': self.width // 2, 'y': self.height // 2, 'dx': random.choice([-1, 1]), 'dy': random.choice([-1, 1])}
        self.ball_speed = 5

    def get_game_state(self):
        return {
            'paddles': self.paddles,
            'ball': self.ball,
            'score': self.score
        }

    def move_paddle(self, username, direction):
        if username in self.paddles:
            paddle = self.paddles[username]
            if direction == 'up':
                paddle['y'] = max(0, paddle['y'] - self.paddle_speed)
            elif direction == 'down':
                paddle['y'] = min(self.height - self.paddle_height, paddle['y'] + self.paddle_speed)
