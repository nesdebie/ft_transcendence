# test_websocket.py

import asyncio
import websockets

async def test_websocket():
    uri = "wss://localhost/ws/chat/test/"
    async with websockets.connect(uri) as websocket:
        await websocket.send("Hello, World!")
        response = await websocket.recv()
        print(response)

asyncio.get_event_loop().run_until_complete(test_websocket())