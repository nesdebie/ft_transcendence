import { redirectToRoute } from "./router.js";
import { setWebSocket, getWebSocket, closeWebSocket } from "./websocketManager.js";

function initPong() {
    let canvas, context;
    let gameState;
    let game_data;
    let room_name;
    let tournament;

    
    function init() {
        canvas = document.getElementById('pong-game');
        if (canvas) {
            context = canvas.getContext('2d');
            let isKeyPressed = false;
            document.addEventListener('keydown', (event) => {
                if ((event.key === 'ArrowUp' || event.key === 'ArrowDown') && !isKeyPressed) {
                    isKeyPressed = true; // Set the flag to true
                    handleKeyPress(event);
                }
            });
            
            document.addEventListener('keyup', (event) => {
                if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                    isKeyPressed = false; // Reset the flag on key release
                    stopMovement();
                }
            });
        }
        room_name = canvas.getAttribute('data-room_name');
        tournament = canvas.getAttribute('data-tournament');
        console.log(`room_name: ${room_name}`);
        connectWebSocket(room_name);
    }
    
    function connectWebSocket(room_name) {
        const socket = new WebSocket(`wss://${window.location.host}/ws/pong/${room_name}/`);

        socket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            if (data.type === 'game_state_update') {
                gameState = data.game_state;
                updateBoard();
            } else if (data.type === 'game_over') {
                console.log('Game over');
                gameState = data.game_state;
                game_over(data);
            } else if (data.type === 'game_start') {
                console.log('game start: ', data)
                game_data = data.game;
                drawBoard();
            } else if (data.type === 'player_left') {
                alert(`${data.player} has left the game. You win!`);
                redirectToRoute('/pong_lobby')
            } else {
                console.error(e);
            } 
        };
        
        socket.onopen = function(e) {
            console.log('Pong websocket connection made, Sending join');
            setWebSocket(socket);
            socket.send(JSON.stringify({'action': 'join'}));
            
            let init_message = {"action": "init", "tournament": tournament}
            if (tournament) {
                init_message["game_info"] =  JSON.parse(document.getElementById('game-over').getAttribute('data-game_info'))
            }
            socket.send(JSON.stringify(init_message))
        };
        
        socket.onclose = function(e) {
            console.log('Pong websocket connection closed');
        };
    }
    
    const moveIntervalDuration = 30; // ms
    
    let moveInterval = null; 

    function handleKeyPress(event) {
        const action = { 'action': 'move_paddle', 'direction': event.key === 'ArrowUp' ? 'up' : 'down' };
    
        if (getWebSocket() && getWebSocket().readyState === WebSocket.OPEN) {
            getWebSocket().send(JSON.stringify(action));
        }
    
        // Start sending commands at a regular interval
        if (!moveInterval) {
            moveInterval = setInterval(() => {
                if (getWebSocket() && getWebSocket().readyState === WebSocket.OPEN) {
                    getWebSocket().send(JSON.stringify(action));
                }
            }, moveIntervalDuration); // Set your desired interval duration
        }
    }
    
    function stopMovement() {
        clearInterval(moveInterval);
        moveInterval = null; // Reset the interval
    }

    function drawBoard() {
        if (!game_data) {
            console.error('Game data not available');
            return;
        }
        canvas.width = game_data.width;
        canvas.height = game_data.height;
        
        // Clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Reset line dash
        context.setLineDash([]);
    }

    function updateBoard() {
        if (!gameState || !gameState.paddles || Object.keys(gameState.paddles).length < 2) {
            console.error('Invalid game state:', gameState);
            return;
        }

        // Clear the canvas
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);


        // Draw paddles
        context.fillStyle = 'white';
        const players = Object.keys(gameState.paddles);
        context.fillRect(0, gameState.paddles[players[0]].y, game_data.paddle_width, game_data.paddle_height);
        context.fillRect(canvas.width - game_data.paddle_width, gameState.paddles[players[1]].y, game_data.paddle_width, game_data.paddle_height);

        // Draw ball
        context.beginPath();
        context.arc(gameState.ball.x, gameState.ball.y, game_data.ball_size / 2, 0, Math.PI * 2);
        context.fill();

        // Draw scores
        context.font = '24px Arial';
        context.fillText(gameState.scores[players[0]], canvas.width / 4, 50);
        context.fillText(gameState.scores[players[1]], 3 * canvas.width / 4, 50);
    }

    function game_over(data) {
        document.querySelectorAll('pong-game').forEach(el => {
            el.style.display = 'none';
        });

        // Show game over message
        const gameOverDiv = document.getElementById('game-over');
        const gameOverMessage = document.getElementById('game-over-message');
        gameOverDiv.style.display = 'block';
        
        const playerUsername = document.getElementById('pong-game').getAttribute('data-player-username');
        const opponentUsername = Object.keys(gameState.scores).find(user => user !== playerUsername);
        
        const playerScore = gameState.scores[playerUsername];
        const opponentScore = gameState.scores[opponentUsername];
        
        if (playerScore == opponentScore) {
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
        if (!data.is_tournament) {
            document.getElementById('go-back-button').textContent = "Go to pong Lobby"
            document.getElementById('go-back-button').addEventListener('click', () => {
                closeWebSocket();
                redirectToRoute('/pong_lobby'); 
            });
        } else {
            const gameInfo = JSON.parse(gameOverDiv.getAttribute('data-game_info'))
            document.getElementById('go-back-button').textContent = "Go back to tournament page"
            document.getElementById('go-back-button').addEventListener('click', () => {
                closeWebSocket();
                redirectToRoute(`/tournament/${gameInfo.tournament_id}`)
            });            
        }
        
    }

    init();
}

export { initPong };