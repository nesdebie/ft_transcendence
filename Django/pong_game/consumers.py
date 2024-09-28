import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .game_logic import PongGameLogic
from blockchain.ALL_FILE_NEEDED.asked_functions import Add_game_history
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
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            print(f' received: {data}') 
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
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'game_state': game_state
        }))
        
        if self.room_name in self.rooms:
            room = self.rooms[self.room_name]
            game = room['game']
            scores = game.scores
            print(f"Final scores before saving: {scores}")
            
            if scores:
                game_name = 'pong'
                timestamp = datetime.datetime.now().isoformat()
                result = Add_game_history(scores, game_name, timestamp)
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


