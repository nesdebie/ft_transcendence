import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .game_logic import PongGameLogic

class PongConsumer(AsyncWebsocketConsumer):
    rooms = {}

    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.game_group_name = f'pong_{self.game_id}'
        self.user = self.scope['user']

        await self.channel_layer.group_add(
            self.game_group_name,
            self.channel_name
        )

        await self.accept()

        if self.game_id not in self.rooms:
            self.rooms[self.game_id] = {
                'players': [],
                'game_logic': PongGameLogic()
            }

        await self.add_player()

    async def add_player(self):
        room = self.rooms[self.game_id]
        room['players'].append(self.user.username)

        if len(room['players']) == 2:
            room['players'].sort()  # Sort players alphabetically
            await self.start_game()

    async def start_game(self):
        print(f'Starting game for {self.game_id} with players {self.rooms[self.game_id]["players"]}')
        room = self.rooms[self.game_id]
        game_logic = room['game_logic']
        for player in room['players']:
            game_logic.add_player(player)

        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'game_start',
                'players': room['players'],
                'game_state': game_logic.get_game_state()
            }
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.game_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data['action']

        if action == 'move_paddle':
            direction = data['direction']
            self.rooms[self.game_id]['game_logic'].move_paddle(self.user.username, direction)
        elif action == 'start_game':
            self.rooms[self.game_id]['game_logic'].start_game()

        await self.send_game_state()

    async def send_game_state(self):
        game_state = self.rooms[self.game_id]['game_logic'].get_game_state()
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'game_state_update',
                'game_state': game_state
            }
        )

    async def game_state_update(self, event):
        game_state = event['game_state']
        await self.send(text_data=json.dumps({
            'type': 'game_state_update',
            'game_state': game_state
        }))

    async def game_start(self, event):
        players = event['players']
        game_state = event['game_state']
        await self.send(text_data=json.dumps({
            'type': 'game_start',
            'players': players,
            'game_state': game_state
        }))