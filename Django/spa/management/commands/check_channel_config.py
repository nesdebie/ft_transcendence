from django.core.management.base import BaseCommand
from django.conf import settings
from channels.layers import get_channel_layer

class Command(BaseCommand):
    help = 'Check channel layer configuration'

    def handle(self, *args, **options):
        print(f"CHANNEL_LAYERS setting: {settings.CHANNEL_LAYERS}")
        print(f"INSTALLED_APPS: {settings.INSTALLED_APPS}")
        
        channel_layer = get_channel_layer()
        print(f"Channel layer: {channel_layer}")
        
        if channel_layer is None:
            print("Channel layer is None")
        else:
            print(f"Channel layer config: {channel_layer.config}")