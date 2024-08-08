import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("Connecting...")
        channel_layer = get_channel_layer()
        print(f"Channel layer: {channel_layer}")
        print(f"Channel layer config: {channel_layer.config if channel_layer else 'No config'}")
        
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        if channel_layer is None:
            print("Channel layer is None!")
        else:
            try:
                await channel_layer.group_add(
                    self.room_group_name,
                    self.channel_name
                )
                print(f"Added to group: {self.room_group_name}")
            except Exception as e:
                print(f"Error adding to group: {e}")

        await self.accept()
        print("Connection accepted")

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message
            }
        )

    async def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))