import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .game_logic import PongGameLogic
from blockchain.ALL_FILE_NEEDED.blockchain_access import Add_game_history
import datetime

class PongConsumer(AsyncWebsocketConsumer):
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
        print(f"{self.user.username} is disconnecting from room {self.room_name}.")
        
        # Check if the room exists before trying to access it
        
        if self.room_name in self.rooms:
            other_player = [username for username in self.rooms[self.room_name]['players_usernames'] if username != self.user.username]
            
            if other_player:
                print('Other player: ',other_player)
                other_player_username = other_player[0]
                room = self.rooms[self.room_name]
                game: PongGameLogic = room['game']
                
                # Set a flag to prevent multiple saves
                if game.ending_normal:
                    game.ending_normal = False
                    if game.game_running:
                        game.game_running = False
                    
                    # Update scores
                    game.scores[self.user.username] = 0
                    game.scores[other_player_username] = game.max_score
                    
                    # Finish the game and save to blockchain
                    await game.finish_game(self)
                    
                    # Notify the other player
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'player_left',
                            'player': self.user.username
                        }
                    )
                    print(f"Notified {other_player_username} that {self.user.username} has left the game.")            
        else:
            print(f"Room {self.room_name} does not exist. Cannot disconnect.")
        
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"{self.user.username} has been removed from the room {self.room_name}.")
    
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            action = data['action']
            
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'error': "Invalid JSON"
            }))
        except KeyError as e:
            print(f'KeyError: {str(e)}')
            await self.send(text_data=json.dumps({
                'error': f"Missing key in data: {str(e)}"
            }))

        if action == 'join':
            print(f'Calling join_game function with {self.user.username}')
            await self.join_game()
        elif action == 'move_paddle':
            await self.handle_move(data['direction'])
        elif action == 'init':
            print('Received data:', data)
            room = self.rooms[self.room_name]
            game : PongGameLogic = room['game']
            game.is_tournament = data['tournament'] == 'True'
            if game.is_tournament:
                game.tournament_id = data['game_info']['tournament_id']
            
        else:
            await self.send(text_data=json.dumps({
                'error': f"Unknown action: {action}"
            }))

    async def join_game(self):
        if self.room_name not in self.rooms:
            self.rooms[self.room_name] = {
                'players_usernames': [],
                'scores': {},
                'game': PongGameLogic()
            }
        else:
            print(f'{self.user.username} has joined the game the room usernames are {self.rooms[self.room_name]["players_usernames"]}')
        
        if len(self.rooms[self.room_name]['players_usernames']) < 2:
            print(f'{self.user.username} is added to the list')
            self.rooms[self.room_name]['players_usernames'].append(self.user.username)
            self.rooms[self.room_name]['scores'][self.user.username] = 0
            print(f'list = {self.rooms[self.room_name]["players_usernames"]} and len = {len(self.rooms[self.room_name]["players_usernames"])}')
        if len(self.rooms[self.room_name]['players_usernames']) == 2:
            await self.start_game()


    async def start_game(self):
        print(f'Starting game for {self.room_name} with players {self.rooms[self.room_name]["players_usernames"]}')
        room = self.rooms[self.room_name]
        game : PongGameLogic = room['game']
        for player_username in room['players_usernames']:
            game.add_player(player_username)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_start',
                'game': vars(game)
            }
        )
        await game.start(self);
        print(f'game has started !')

    async def handle_move(self, direction):
        room = self.rooms[self.room_name]
        game : PongGameLogic = room['game']
        game.move_paddle(self.user.username, direction)

    async def game_start(self, event):
        game = event['game']
        await self.send(text_data=json.dumps({
            'type': 'game_start',
            'game': game
        }))

    async def game_state_update(self, event):
        game_state = event['game_state']
        await self.send(text_data=json.dumps({
            'type': 'game_state_update',
            'game_state': game_state
        }))

    async def game_over(self, event):
        game_state = event['game_state']
        is_tournament = event['is_tournament']
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'game_state': game_state,
            'is_tournament': is_tournament,
        }))
        
        if self.room_name in self.rooms:
            self.rooms.pop(self.room_name)


#Not usefull ?
    async def send_game_state(self):
        game_state = self.rooms[self.room_name]['game'].get_game_state()
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'game_state_update',
                'game_state': game_state
            }
        )

    async def player_left(self, event):
        player = event['player']
        await self.send(text_data=json.dumps({
            'type': 'player_left',
            'player': player
        }))


