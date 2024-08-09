import json
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from django.conf import settings
from django.utils import timezone
from channels.db import database_sync_to_async


class ChatConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.channel_layer = get_channel_layer()
        print(f"Channel layer in __init__: {self.channel_layer}")
        if self.channel_layer is None:
            print("Channel layer is None in __init__. CHANNEL_LAYERS config:", settings.CHANNEL_LAYERS)
            print("Environment variables:")
            print(f"CHANNEL_DB_NAME: {os.environ.get('CHANNEL_DB_NAME')}")
            print(f"CHANNEL_DB_USER: {os.environ.get('CHANNEL_DB_USER')}")
            print(f"CHANNEL_DB_HOST: {os.environ.get('CHANNEL_DB_HOST')}")
            print(f"CHANNEL_DB_PORT: {os.environ.get('CHANNEL_DB_PORT')}")

    async def connect(self):
        print("Connecting...")
        if self.channel_layer is None:
            print("Channel layer is None. Check your CHANNEL_LAYERS configuration.")
            await self.close()
            return

        print(f"Channel layer: {self.channel_layer}")
        
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        try:
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            print(f"Added to group: {self.room_group_name}")
        except Exception as e:
            print(f"Error adding to group: {e}")
            await self.close()
            return

        await self.accept()
        print("Connection accepted")
    
    async def disconnect(self, close_code):
        print(f"Disconnecting with code: {close_code}")
        if self.channel_layer:
            try:
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
                print(f"Removed from group: {self.room_group_name}")
            except Exception as e:
                print(f"Error removing from group: {e}")

    async def receive(self, text_data):
        if self.channel_layer is None:
            print("Channel layer is None. Cannot send message.")
            return

        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender = text_data_json['sender']
        receiver = text_data_json['receiver']

        # Save message to database
        await self.save_message(sender, receiver, message)

        current_time = timezone.now()
        formatted_time = current_time.strftime('%Y-%m-%d %H:%M:%S')

        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message,
                    'sender': sender,
                    'timestamp': formatted_time
                }
            )
        except Exception as e:
            print(f"Error sending message to group: {e}")

    @database_sync_to_async
    def save_message(self, sender, receiver, message):
        from users.models import Player, Message
        sender_user = Player.objects.get(username=sender)
        receiver_user = Player.objects.get(username=receiver)
        Message.objects.create(
            sender=sender_user,
            receiver=receiver_user,
            message=message
        )

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']
        timestamp = event['timestamp']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender,
            'timestamp': timestamp
        }))