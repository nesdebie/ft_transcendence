import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.conf import settings
from django.utils import timezone
from channels.db import database_sync_to_async
from django.urls import reverse

class ChatConsumer(AsyncWebsocketConsumer):

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
        message_type = text_data_json.get('type', 'chat_message')
        sender = text_data_json['sender']
        receiver = text_data_json['receiver']
        game_type = text_data_json.get('game_type', 'default_game')  # Extract game_type here

        if message_type in ['game_invite', 'game_invite_accepted']:
            message = f"{message_type.replace('_', ' ').title()}"
        else:
            message = text_data_json['message']

        # Save message to database
        await self.save_message(sender, receiver, message, message_type, game_type=game_type)  # Pass game_type to save_message
        current_time = timezone.now()
        formatted_time = current_time.strftime('%Y-%m-%d %H:%M:%S')

        try:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': message_type,
                    'message': message,
                    'sender': sender,
                    'receiver': receiver,
                    'timestamp': formatted_time,
                    'game_type': game_type  # Include game_type in the message sent to the group
                }
            )
        except Exception as e:
            print(f"Error sending message to group: {e}")

    @database_sync_to_async
    def save_message(self, sender, receiver, message, message_type='chat_message', is_game_invite=False, game_type='default_game'):
        from users.models import Player, Message
        sender_user = Player.objects.get(username=sender)
        receiver_user = Player.objects.get(username=receiver)
        Message.objects.create(
            sender=sender_user,
            receiver=receiver_user,
            message=message,
            message_type=message_type,
            is_game_invite=is_game_invite,
            game_type=game_type  # Save the game type
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

    async def game_invite(self, event):
        game_type = event.get('game_type', 'default_game')  # Default to 'default_game' if not specified
        await self.save_message(event['sender'], event['receiver'], "Game invite", message_type='game_invite', is_game_invite=True, game_type=game_type)
        await self.send(text_data=json.dumps({
            'type': 'game_invite',
            'sender': event['sender'],
            'receiver': event['receiver'],
            'game_type': game_type
        }))

    async def game_invite_accepted(self, event):
        game_type = event.get('game_type', 'default_game')
        await self.send(text_data=json.dumps({
            'type': 'game_invite_accepted',
            'sender': event['sender'],
            'receiver': event['receiver'],
            'game_type': game_type
        }))