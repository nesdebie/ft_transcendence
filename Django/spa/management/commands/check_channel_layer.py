# myapp/management/commands/check_channel_layer.py

from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer


class Command(BaseCommand):
    help = 'Check connection to the channel layer'

    def handle(self, *args, **kwargs):
        channel_layer = get_channel_layer()
        if channel_layer is None:
            print("Channel Layer is not initialized.")
            self.stdout.write(self.style.ERROR('Channel Layer is not initialized.'))
            return

        try:
            # Test basic operation: send a test message
            self.stdout.write('Attempting to connect to channel layer...')
            async def test_connection():
                from channels.layers import get_channel_layer
                channel_layer = get_channel_layer()
                if channel_layer is None:
                    raise ValueError("Channel Layer is not initialized.")
                response = await channel_layer.send('test_channel', {'type': 'test.message'})
                self.stdout.write(self.style.SUCCESS('Successfully connected to channel layer.'))
            
            import asyncio
            asyncio.run(test_connection())
        except Exception as e:
            print("Failed to connect to the channel layer: " + str(e))
            self.stdout.write(self.style.ERROR(f'Failed to connect to the channel layer: {e}'))
