import { setWebSocket, getWebSocket, closeWebSocket } from "./websocketManager.js";
import { redirectToRoute } from "./router.js";

function initShifumi(roomName) {
    const websocket = new WebSocket(
        'wss://' + window.location.host + '/ws/shifumi/' + roomName + '/'
    );
    let countdownIntervalId = null;
    const playerUsername = document.getElementById('shifumi-game').getAttribute('data-player-username');


    websocket.onopen = function(e) {
        console.log("WebSocket connection established");
        setWebSocket(websocket);
        websocket.send(JSON.stringify({action: 'join'}));
    };

    websocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        handleServerMessage(data);
    };

    websocket.onclose = function(e) {
        console.log("shifumi websocket connection closed");
    };

    function handleServerMessage(data) {
    
        if (data.type === 'game_start') {
            updateScoreBoard(data.player1Username, data.player2Username, data.scores);
        } else if (data.type === 'round_start') {
            enableButtons();
            updateRoundInfo(data.roundNumber);
        } else if (data.type === 'start_countdown') {
            countdownIntervalId = startCountdown();
        } else if (data.type === 'game_result') {
            stopCountdown(countdownIntervalId);
            countdownIntervalId = null;
            displayResult(data);
            updateRoundLog(data);
            updateScoreBoard(data.player1Username, data.player2Username, data.scores);
        } else if (data.type === 'game_over') {
            stopCountdown(countdownIntervalId);
            countdownIntervalId = null;
            endGame(data, playerUsername);
        } else if (data.type === 'player_left') {
            handlePlayerLeft(data.player);
        } else if (data.type === 'error') {
            alert(data.message);
        }
    }

    function handlePlayerLeft(leftPlayer) {
        alert(`${leftPlayer} has left the game.`);
        // Optionally, you can disable buttons or show a message
        disableButtons();

        // Check if both players have left
        if (getWebSocket() && getWebSocket().readyState === WebSocket.CLOSED) {
            endGame({ winner: null }); // End the game if both players have left
        }
    }

    function setupEventListeners() {
        const playerOptions = document.querySelectorAll('.options button');
        playerOptions.forEach(option => {
            option.addEventListener('click', function() {
                const move = this.id;
                websocket.send(JSON.stringify({action: 'move', move: move}));
                disableButtons();
                if (countdownIntervalId) {
                    stopCountdown(countdownIntervalId);
                    countdownIntervalId = null;
                }
            });
        });
    }

    setupEventListeners();
    console.log("Shifumi game initialized");

}

function endGame(data, playerUsername) {
    // Hide all game elements
    document.querySelectorAll('.shifumi-game > *:not(#game-over)').forEach(el => {
        el.style.display = 'none';
    });

    // Show game over message
    const gameOverDiv = document.getElementById('game-over');
    const gameOverMessage = document.getElementById('game-over-message');
    gameOverDiv.style.display = 'block';

    if (data.winner === null) {
        gameOverMessage.textContent = 'It\'s a tie!';
        gameOverMessage.style.color = 'blue';
    } else if (data.winner === playerUsername) {
        gameOverMessage.textContent = 'GG Well Played!';
        gameOverMessage.style.color = 'green';
    } else {
        gameOverMessage.textContent = 'GAME OVER';
        gameOverMessage.style.color = 'red';
    }

    // Add event listener to go back button
    document.getElementById('go-back-button').addEventListener('click', () => {
        closeWebSocket();
        redirectToRoute('/shifumi_lobby');
    });
}

function disableButtons() {
    const playerOptions = document.querySelectorAll('.options button');
    playerOptions.forEach(option => {
        option.disabled = true;
    });
}

function enableButtons() {
    const playerOptions = document.querySelectorAll('.options button');
    playerOptions.forEach(option => {
        option.disabled = false;
    });
}

function updateRoundInfo(roundNumber) {
    const roundInfo = document.querySelector('.round-info');
    roundInfo.textContent = `Round: ${roundNumber}/10`;
}

function startCountdown() {
    const countdownElement = document.querySelector('.countdown');
    countdownElement.style.display = 'block';
    let timeLeft = 10;
    const countdownInterval = setInterval(() => {
        countdownElement.textContent = `Time left: ${timeLeft} seconds`;
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(countdownInterval);
            countdownElement.style.display = 'none';
            getWebSocket().send(JSON.stringify({action: 'move', move: 'timeout'}));
        }
    }, 1000);
    
    return countdownInterval;
}

function stopCountdown(intervalId) {
    if (intervalId) {
        clearInterval(intervalId);
        const countdownElement = document.querySelector('.countdown');
        countdownElement.style.display = 'none';
    }
}

function updateScoreBoard(player1Username, player2Username, scores) {
    const playerNames = document.getElementById('player-names');
    const scoreDisplay = document.getElementById('player-scores');
    playerNames.textContent = `${player1Username} - ${player2Username}`;
    scoreDisplay.textContent = `${scores[player1Username]} - ${scores[player2Username]}`;
}

function displayResult(data) {
    const result = document.querySelector('.result');
    result.textContent = data.resultMessage;
    updateScoreBoard(data.player1Username, data.player2Username, data.scores);
}

function updateRoundLog(data) {
    const logElement = document.querySelector('.round-log');
    const resultMessage = getResultMessage(data.result, data.playerMove, data.opponentMove);
    const logEntry = `Round ${data.roundNumber}: ${data.playerMove} vs ${data.opponentMove} - ${resultMessage}`;
    logElement.innerHTML += logEntry + '<br>';
}

function getResultMessage(result, playerMove, opponentMove) {
    if (result === 'tie') {
        return "It's a tie!";
    } else if (result === 'win') {
        return `${playerMove} beats ${opponentMove}. You win!`;
    } else {
        return `${opponentMove} beats ${playerMove}. You lose!`;
    }
}

export { initShifumi };