import random
import os
import time
import threading

class Paddle:
    def __init__(self, y):
        self.y = y
        self.height = 10  # Increased paddle height

class Ball:
    def __init__(self):
        self.x = 30
        self.y = 15
        self.dx = random.choice([-1, 1])
        self.dy = random.choice([-1, 1])

class PongGame:
    def __init__(self):
        self.width = 60
        self.height = 30
        self.paddle1 = Paddle(self.height // 2 - 5)
        self.paddle2 = Paddle(self.height // 2 - 5)
        self.ball = Ball()
        self.score1 = 0
        self.score2 = 0
        self.game_over = False

    def update(self):
        self.ball.x += self.ball.dx
        self.ball.y += self.ball.dy

        # Ball collision with top and bottom
        if self.ball.y <= 0 or self.ball.y >= self.height - 1:
            self.ball.dy *= -1

        # Ball collision with paddles
        if self.ball.x <= 1 and self.paddle1.y <= self.ball.y <= self.paddle1.y + self.paddle1.height:
            self.ball.dx *= -1
        elif self.ball.x >= self.width - 2 and self.paddle2.y <= self.ball.y <= self.paddle2.y + self.paddle2.height:
            self.ball.dx *= -1

        # Scoring
        if self.ball.x <= 0:
            self.score2 += 1
            self.ball = Ball()
        elif self.ball.x >= self.width - 1:
            self.score1 += 1
            self.ball = Ball()

        if self.score1 >= 5 or self.score2 >= 5:
            self.game_over = True

    def move_paddle(self, player, direction):
        paddle = self.paddle1 if player == 1 else self.paddle2
        if direction == 'up':
            paddle.y = max(0, paddle.y - 2)
        elif direction == 'down':
            paddle.y = min(self.height - paddle.height, paddle.y + 2)

def clear_screen():
    os.system('clear')

def draw_game(game):
    clear_screen()
    print(f"Score: Player 1: {game.score1} | Player 2: {game.score2}")
    print("=" * game.width)
    
    for y in range(game.height):
        line = ""
        for x in range(game.width):
            if x == 0 and game.paddle1.y <= y < game.paddle1.y + game.paddle1.height:
                line += "█"
            elif x == game.width - 1 and game.paddle2.y <= y < game.paddle2.y + game.paddle2.height:
                line += "█"
            elif x == game.ball.x and y == game.ball.y:
                line += "●"
            else:
                line += " "
        print(line)
    
    print("=" * game.width)
    print("Controls: 'a'/'z' for Player 1, 'k'/'m' for Player 2, 'q' to quit")

def game_loop(game):
    while not game.game_over:
        game.update()
        draw_game(game)
        time.sleep(0.1)  # Small delay to control game speed

    print("Game Over!")

def main():
    game = PongGame()
    
    # Start the game loop in a separate thread
    game_thread = threading.Thread(target=game_loop, args=(game,))
    game_thread.start()

    while not game.game_over:
        # Get player input
        action = input().lower()
        if action == 'a':
            game.move_paddle(1, 'up')
        elif action == 'z':
            game.move_paddle(1, 'down')
        elif action == 'k':
            game.move_paddle(2, 'up')
        elif action == 'm':
            game.move_paddle(2, 'down')
        elif action == 'q':
            game.game_over = True
            print("Quitting the game...")
            break

    # Wait for the game thread to finish
    game_thread.join()

if __name__ == "__main__":
    main()