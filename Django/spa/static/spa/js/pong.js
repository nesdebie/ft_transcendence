import { setWebSocket, getWebSocket, closeWebSocket } from "./websocketManager.js";

function initPong() {
    let canvas, context;
    let gameState;
    let room_name;
    console.log(`room_name: ${room_name}`);

    function init() {
        canvas = document.getElementById('pong-game');
        if (canvas) {
            context = canvas.getContext('2d');
            document.addEventListener('keydown', handleKeyPress);
        }
        room_name = canvas.getAttribute('data-game-id');
        connectWebSocket(room_name);
    }

    function connectWebSocket(room_name) {
        const socket = new WebSocket(`wss://${window.location.host}/ws/pong/${room_name}/`);

        socket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            if (data.type === 'game_state_update') {
                gameState = data.game_state;
                console.log('Game State in onmessage:', gameState);
                drawGame();
            }
            else if (data.type = 'game_over') {
                gameState = data.game_state;
                console.log('Game over: ', gameState);
                game_over(data)
            }
        };

        socket.onopen = function(e) {
            console.log('Pong websocket connection made')
            setWebSocket(socket);
            socket.send(JSON.stringify({action: 'join'}));
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
        if (!gameState || !gameState.paddles || gameState.paddles.length < 2) {
            console.error('Game State:', gameState);
            return;
        }
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

    function game_over() {
        document.querySelectorAll('pong-game').forEach(el => {
            el.style.display = 'none';
        });

        // Show game over message
        const gameOverDiv = document.getElementById('game-over');
        const gameOverMessage = document.getElementById('game-over-message');
        gameOverDiv.style.display = 'block';

        const playerUsername = document.getElementById('pong-game').getAttribute('data-player-username');
        const opponentUsername = Object.keys(data.scores).find(user => user !== username);
        
        const playerScore = data.score[playerUsername];
        const opponentScore = data.score[opponentUsername];
        
        if (playerScore = opponentScore) {
            gameOverMessage.textContent = 'It\'s a tie!';
            gameOverMessage.style.color = 'blue';
        } else if (playerScore > opponentScore) {
            gameOverMessage.textContent = 'GG Well Played!';
            gameOverMessage.style.color = 'green';
        } else {
            gameOverMessage.textContent = 'GAME OVER';
            gameOverMessage.style.color = 'red';
        }
        // Add event listener to go back button
        document.getElementById('go-back-button').addEventListener('click', () => {
            closeWebSocket();
            window.history.back();
        });
    }

    init();
}

export { initPong };