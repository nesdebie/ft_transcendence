from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json

class OnlineStatusConsumer(AsyncWebsocketConsumer):
	
	async def connect(self):
		self.group_name = 'online_status_group'
		await self.channel_layer.group_add(self.group_name, self.channel_name)
		self.user = None
		await self.accept()

	async def disconnect(self, close_code):
		
		# Update the user's online status to false
		if self.user:
			self.user.online_status = False
			await self.user.save()
	

	async def receive(self, text_data):
		data = json.loads(text_data)
		self.user = await self.get_user(data['user_id'])
		self.user.online_status = True
		await self.save_user(self.user)
		# Process the data as needed
	

	@database_sync_to_async
	def get_user(self, user_id):
		from .models import Player
		return Player.objects.get(id=user_id)
	
	@database_sync_to_async
	def save_user(self, user):
		user.save()
