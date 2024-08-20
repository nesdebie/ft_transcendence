import { setWebSocket, getWebSocket, closeWebSocket } from "./websocketManager.js";

function initPong() {
    let canvas, context;
    let gameState;
    let gameId;
    console.log(`gameId: ${gameId}`);

    function init() {
        canvas = document.getElementById('pong-game');
        if (canvas) {
            context = canvas.getContext('2d');
            document.addEventListener('keydown', handleKeyPress);
        }
        gameId = canvas.getAttribute('data-game-id');
        connectWebSocket(gameId);
    }

    function connectWebSocket(gameId) {
        const socket = new WebSocket(`wss://${window.location.host}/ws/pong/${gameId}/`);

        socket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            if (data.type === 'game_state_update') {
                gameState = data.game_state;
                drawGame();
            }
        };

        socket.onopen = function(e) {
            setWebSocket(socket);
            socket.send(JSON.stringify({action: 'start_game'}));
        };
    }

    function handleKeyPress(event) {
        let action;
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            action = {action: 'move_paddle', direction: event.key === 'ArrowUp' ? 'up' : 'down'};
        }
        if (action && getWebSocket() && getWebSocket().readyState === WebSocket.OPEN) {
            getWebSocket().send(JSON.stringify(action));
        }
    }

    function drawGame() {
        if (!gameState) return;

        // Clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Draw paddles
        context.fillStyle = 'white';
        const players = Object.keys(gameState.paddles);
        context.fillRect(0, gameState.paddles[players[0]].y, 10, 50);
        context.fillRect(490, gameState.paddles[players[1]].y, 10, 50);

        // Draw ball
        context.beginPath();
        context.arc(gameState.ball.x, gameState.ball.y, 5, 0, Math.PI * 2);
        context.fill();

        // Draw scores
        context.font = '24px Arial';
        context.fillText(gameState.score[players[0]], 100, 50);
        context.fillText(gameState.score[players[1]], 400, 50);
    }

    init();
}

export { initPong };