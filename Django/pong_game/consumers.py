import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .game_logic import PongGameLogic

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

    async def join_game(self):
        if self.room_name not in self.rooms:
            self.rooms[self.room_name] = {
                'players_usernames': [],
                'game': PongGameLogic()
            }
        elif len(self.rooms[self.room_name]['players_usernames']) < 2:
            self.rooms[self.room_name]['players_usernames'].append(self.user.username)
            self.rooms[self.room_name]['scores'][self.user.username] = 0
        
        if len(self.rooms[self.room_name]['players_usernames']) == 2:
            self.rooms[self.room_name]['players_usernames'].sort()  # Sort players alphabetically

            await self.start_game()


    async def start_game(self):
        print(f'Starting game for {self.game_id} with players {self.rooms[self.game_id]["players"]}')
        room = self.rooms[self.room_name]
        game = room['game']
        for player_username in room['players_usernames']:
            game.add_player(player_username)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_start',
                'game': game
            }
        )
        game.start(self);

    async def handle_move(self, move):
        room = self.rooms[self.room_name]
        game = room['game']
        game.handle_move(move)

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


#Not usefull ?
    async def send_game_state(self):
        game_state = self.rooms[self.game_id]['game'].get_game_state()
        await self.channel_layer.group_send(
            self.game_group_name,
            {
                'type': 'game_state_update',
                'game_state': game_state
            }
        )


