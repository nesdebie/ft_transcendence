import random

class PongGameLogic:
    def __init__(self):
        self.width = 500
        self.height = 500
        self.paddle_width = 10
        self.paddle_height = 50
        self.ball_size = 10
        self.paddle_speed = 5
        self.ball_speed = 5

        self.players = []
        self.paddles = {}
        self.ball = {'x': self.width // 2, 'y': self.height // 2, 'dx': random.choice([-1, 1]), 'dy': random.choice([-1, 1])}
        self.score = {}
        self.game_running = False

    def add_player(self, username):
        if len(self.players) < 2:
            self.players.append(username)
            self.paddles[username] = {'y': self.height // 2 - self.paddle_height // 2}
            self.score[username] = 0

    def start_game(self):
        if len(self.players) == 2:
            self.game_running = True

    def move_paddle(self, username, direction):
        if username in self.paddles:
            paddle = self.paddles[username]
            if direction == 'up':
                paddle['y'] = max(0, paddle['y'] - self.paddle_speed)
            elif direction == 'down':
                paddle['y'] = min(self.height - self.paddle_height, paddle['y'] + self.paddle_speed)

    def update_ball_position(self):
        if not self.game_running or len(self.players) != 2:
            return

        self.ball['x'] += self.ball['dx'] * self.ball_speed
        self.ball['y'] += self.ball['dy'] * self.ball_speed

        # Ball collision with top and bottom walls
        if self.ball['y'] <= 0 or self.ball['y'] >= self.height - self.ball_size:
            self.ball['dy'] *= -1

        # Ball collision with paddles
        player1, player2 = self.players
        if (self.ball['x'] <= self.paddle_width and
            self.paddles[player1]['y'] <= self.ball['y'] <= self.paddles[player1]['y'] + self.paddle_height) or \
           (self.ball['x'] >= self.width - self.paddle_width - self.ball_size and
            self.paddles[player2]['y'] <= self.ball['y'] <= self.paddles[player2]['y'] + self.paddle_height):
            self.ball['dx'] *= -1

        # Scoring
        if self.ball['x'] <= 0:
            self.score[player2] += 1
            self.reset_ball()
        elif self.ball['x'] >= self.width - self.ball_size:
            self.score[player1] += 1
            self.reset_ball()

    def reset_ball(self):
        self.ball = {'x': self.width // 2, 'y': self.height // 2, 'dx': random.choice([-1, 1]), 'dy': random.choice([-1, 1])}

    def get_game_state(self):
        self.update_ball_position()
        return {
            'paddles': self.paddles,
            'ball': self.ball,
            'score': self.score
        }