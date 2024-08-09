import json
from channels.generic.websocket import AsyncWebsocketConsumer
import time
import asyncio
from channels.db import database_sync_to_async

class ShifumiConsumer(AsyncWebsocketConsumer):
	rooms = {}
	player_games = {}

	@database_sync_to_async
	def set_active_game(self, user, room_name):
		from users.models import Player
		player = Player.objects.get(username=user.username)
		player.set_active_shifumi_game(room_name)

	@database_sync_to_async
	def clear_active_game(self, user):
		from users.models import Player
		player = Player.objects.get(username=user.username)
		player.clear_active_shifumi_game()

	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['room_name']
		self.room_group_name = f'shifumi_{self.room_name}'
		self.user = self.scope['user']

		if self.user.username in self.player_games:
			await self.close()
			return

		await self.channel_layer.group_add(
			self.room_group_name,
			self.channel_name
		)

		await self.accept()
		await self.set_active_game(self.user, self.room_name)

	async def disconnect(self, close_code):
		await self.channel_layer.group_discard(
			self.room_group_name,
			self.channel_name
		)
		if self.room_name in self.rooms:
			self.rooms[self.room_name]['players'].remove(self.channel_name)
			if not self.rooms[self.room_name]['players']:
				del self.rooms[self.room_name]
		if self.user.username in self.player_games:
			del self.player_games[self.user.username]
		await self.clear_active_game(self.user)

	async def receive(self, text_data):
		data = json.loads(text_data)
		action = data['action']
		
		if action == 'join':
			await self.join_game()
		elif action == 'move':
			player_move = data['move']
			await self.handle_move(player_move)

	async def handle_move(self, move):
		room = self.rooms[self.room_name]
		room['moves'][self.channel_name] = move

		if len(room['moves']) == 1:
			# Start countdown for the other player
			asyncio.create_task(self.start_countdown())
		elif len(room['moves']) == 2:
			# Both players have moved, resolve the game
			await self.resolve_game()

	async def start_countdown(self):
		await asyncio.sleep(10)
		room = self.rooms[self.room_name]
		if len(room['moves']) < 2:
			# Time's up, add a 'timeout' move for the player who didn't respond
			for player in room['players']:
				if player not in room['moves']:
					room['moves'][player] = 'timeout'
			await self.resolve_game()

	async def resolve_game(self):
		room = self.rooms[self.room_name]
		moves = list(room['moves'].values())
		players = room['players']
		
		result = self.get_winner(moves[0], moves[1])

		await self.channel_layer.group_send(
			self.room_group_name,
			{
				'type': 'game_result',
				'result': result,
				'moves': dict(zip(players, moves))
			}
		)
		room['moves'].clear()

	def get_winner(self, move1, move2):
		if 'timeout' in [move1, move2]:
			return 'player1' if move2 == 'timeout' else 'player2'
		elif move1 == move2:
			return 'tie'
		elif (move1 == 'rock' and move2 == 'scissors') or \
			 (move1 == 'scissors' and move2 == 'paper') or \
			 (move1 == 'paper' and move2 == 'rock'):
			return 'player1'
		else:
			return 'player2'

	async def game_move(self, event):
		await self.send(text_data=json.dumps(event))

	async def start_game(self):
		if self.room_name in self.rooms and len(self.rooms[self.room_name]['players']) == 2:
			await self.channel_layer.group_send(
				self.room_group_name,
				{
					'type': 'game_start',
					'message': 'Both players have joined. The game is starting!'
				}
			)
		else:
			await self.send(text_data=json.dumps({
				'type': 'error',
				'message': 'Waiting for another player to join.'
			}))

	async def game_start(self, event):
		await self.send(text_data=json.dumps(event))

	async def game_result(self, event):
		await self.send(text_data=json.dumps(event))

	async def game_over(self, event):
		await self.send(text_data=json.dumps({
			'type': 'game_over',
			'winner': event['winner']
		}))
		await self.clear_active_game(self.user)

	async def join_game(self):
		if self.user.username in self.player_games:
			await self.send(text_data=json.dumps({
				'type': 'error',
				'message': 'You already have an active game.'
			}))
			return

		if self.room_name not in self.rooms:
			self.rooms[self.room_name] = {'players': [self.channel_name]}
		elif len(self.rooms[self.room_name]['players']) < 2:
			self.rooms[self.room_name]['players'].append(self.channel_name)
		
		self.player_games[self.user.username] = self.room_name
		await self.start_game()