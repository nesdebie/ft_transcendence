import json
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from blockchain.ALL_FILE_NEEDED.blockchain_access import Add_game_history
import datetime

class ShifumiConsumer(AsyncWebsocketConsumer):
    rooms = {}

    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'shifumi_{self.room_name}'
        self.user = self.scope['user']

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()


    async def disconnect(self, close_code):
        print(f"Disconnecting with close code: {close_code}")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        if self.room_name in self.rooms:
            if self.user.username in self.rooms[self.room_name]['players_usernames']:
                self.rooms[self.room_name]['players_usernames'].remove(self.user.username)
            if not self.rooms[self.room_name]['players_usernames']:
                del self.rooms[self.room_name]
            else:
                # Notify the other player that this player has left
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'player_left',
                        'player': self.user.username
                    }
                )
        await self.clear_active_game(self.user.username)
        print(f"Disconnected. Rooms: {self.rooms}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data['action']
            
            if action == 'join':
                await self.join_game()
            elif action == 'move':
                await self.handle_move(data['move'])
            else:
                await self.send(text_data=json.dumps({
                    'error': f"Unknown action: {action}"
                }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': "Invalid JSON"
            }))
        except KeyError as e:
            await self.send(text_data=json.dumps({
                'error': f"Missing key in data: {str(e)}"
            }))
        except Exception as e:
            print(f"Error in receive: {str(e)}")
            await self.send(text_data=json.dumps({
                'error': "An unexpected error occurred"
            }))

    async def join_game(self):
        if self.room_name not in self.rooms:
            self.rooms[self.room_name] = {
                'players_usernames': [self.user.username],
                'game_history': {},
                'scores': {self.user.username: 0},
                'round_number': 1
            }
        elif len(self.rooms[self.room_name]['players_usernames']) < 2:
            self.rooms[self.room_name]['players_usernames'].append(self.user.username)
            self.rooms[self.room_name]['scores'][self.user.username] = 0
        
        if len(self.rooms[self.room_name]['players_usernames']) == 2:
            self.rooms[self.room_name]['players_usernames'].sort()  # Sort usernames alphabetically
            await self.start_game()

    async def start_game(self):
        room = self.rooms[self.room_name]
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_start',
                'player1Username': room['players_usernames'][0],
                'player2Username': room['players_usernames'][1],
                'scores': room['scores']
            }
        )
        await self.start_round()

    async def start_round(self):
        room = self.rooms[self.room_name]
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'round_start',
                'roundNumber': room['round_number']
            }
        )

    async def handle_move(self, move):
        room = self.rooms[self.room_name]
        current_round = room['round_number']
        
        if current_round not in room['game_history']:
            room['game_history'][current_round] = {}
        
        room['game_history'][current_round][self.user.username] = move
        
        if len(room['game_history'][current_round]) == 2:
            await self.resolve_round()
        else:
            # Start countdown for the other player
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'start_countdown',
                    'player': self.user.username
                }
            )

    async def resolve_round(self):
        room = self.rooms[self.room_name]
        current_round = room['round_number']
        players = room['players_usernames']
        moves = room['game_history'][current_round]
        
        winner = self.get_winner(moves)
        if winner:
            room['scores'][winner] += 1

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_result',
                'moves': moves,
                'scores': room['scores'],
                'roundNumber': current_round,
                'player1Username': players[0],
                'player2Username': players[1],
                'winner': winner
            }
        )
        room['round_number'] += 1

        if room['round_number'] > 10:
            await self.end_game()
        else:
            await self.start_round()

    async def end_game(self):
        room = self.rooms[self.room_name]
        scores = room['scores']
        players = room['players_usernames']
        winner = max(scores, key=scores.get) if scores[players[0]] != scores[players[1]] else None

        game = 'shifumi'
        timestamp = datetime.datetime.now().isoformat()
        Add_game_history(scores, game)

        # Send the game over message
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_over',
                'winner': winner,
                'scores': scores,
                'result': 'tie' if winner is None else 'win' if self.user.username == winner else 'lose'
            }
        )

        # Clear the active game for both players
        for player in players:
            await self.clear_active_game(player)
        
        # Remove the room
        if self.room_name in self.rooms:
            del self.rooms[self.room_name]

    @database_sync_to_async
    def clear_active_game(self, username):
        from users.models import Player
        player = Player.objects.get(username=username)
        player.clear_active_shifumi_game()

    async def start_countdown(self, event):
        if self.user.username != event['player']:
            await self.send(text_data=json.dumps({
                'type': 'start_countdown',
                'message': 'Your turn to make a move'
            }))

    async def game_start(self, event):
        await self.send(text_data=json.dumps(event))

    async def round_start(self, event):
        await self.send(text_data=json.dumps(event))

    async def game_result(self, event):
        players = [event['player1Username'], event['player2Username']]
        opponent = event['player2Username'] if self.user.username == event['player1Username'] else event['player1Username']
        
        result = 'tie'
        if event['winner']:
            print(f"Winner: {event['winner']} and self.user.username: {self.user.username}")
            result = 'win' if self.user.username == event['winner'] else 'lose'
        
        await self.send(text_data=json.dumps({
            'type': 'game_result',
            'result': result,
            'moves': event['moves'],
            'scores': event['scores'],
            'roundNumber': event['roundNumber'],
            'playerMove': event['moves'][self.user.username],
            'opponentMove': event['moves'][opponent],
            'player1Username': event['player1Username'],
            'player2Username': event['player2Username']
        }))

    async def player_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'player_left',
            'player': event['player']
        }))

    def get_winner(self, moves):
        print(f"Moves: {moves}")
        if len(moves) != 2:
            return None

        players = list(moves.keys())
        move1, move2 = moves[players[0]], moves[players[1]]

        if move1 == move2:
            return None
        elif (move1 == 'rock' and move2 == 'scissors') or \
             (move1 == 'scissors' and move2 == 'paper') or \
             (move1 == 'paper' and move2 == 'rock') or \
             (move2 == 'timeout'):
            return players[0]
        else:
            return players[1]
    
    async def game_over(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'winner': event['winner'],
            'scores': event['scores'],
            'result': event['result']
        }))