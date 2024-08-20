from django.urls import re_path
from . import consumers
from .shifumi_consumer import ShifumiConsumer
from pong_game.consumers import PongConsumer

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r'ws/shifumi/(?P<room_name>\w+)/$', ShifumiConsumer.as_asgi()),
	re_path(r'ws/pong/(?P<game_id>\w+)/$', PongConsumer.as_asgi()),
]