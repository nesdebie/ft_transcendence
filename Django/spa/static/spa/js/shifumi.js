window.ShifumiGame = (function() {
    let socket;
    let playerScore = 0;
    let opponentScore = 0;
    let moves = 0;
    let playerOptions = [];
    let currentRoom = '';
    let isGameActive = false;

    function initGame(roomName) {
        currentRoom = roomName;
        socket = new WebSocket(`ws://${window.location.host}/ws/shifumi/${roomName}/`);

        socket.onopen = function(e) {
            console.log("WebSocket connection established");
            socket.send(JSON.stringify({action: 'join'}));
        };

        socket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            handleServerMessage(data);
        };

        socket.onclose = function(e) {
            console.error("WebSocket connection closed unexpectedly");
        };

        resetGameState();
        setupEventListeners();
    }

    function resetGameState() {
        const rockBtn = document.querySelector('.rock');
        const paperBtn = document.querySelector('.paper');
        const scissorBtn = document.querySelector('.scissor');
        playerOptions = [rockBtn, paperBtn, scissorBtn];

        playerOptions.forEach(option => {
            option.style.display = 'inline-block';
        });

        const movesLeft = document.querySelector('.movesleft');
        movesLeft.style.display = 'block';
        movesLeft.innerText = 'Moves Left: 10';

        const chooseMove = document.querySelector('.move');
        chooseMove.innerText = '';

        const result = document.querySelector('.result');
        result.style.fontSize = '';
        result.innerText = '';
        result.style.color = '';

        const playerScoreBoard = document.querySelector('.p-count');
        const opponentScoreBoard = document.querySelector('.c-count');
        playerScoreBoard.textContent = '0';
        opponentScoreBoard.textContent = '0';
    }

    function setupEventListeners() {
        const options = document.querySelectorAll('.options button');
        options.forEach(option => {
            option.addEventListener('click', function() {
                const move = this.id;
                socket.send(JSON.stringify({action: 'move', move: move}));
            });
        });
    }

    function handleServerMessage(data) {
        if (data.type === 'game_move') {
            updateGameState(data);
        } else if (data.type === 'game_result') {
            displayResult(data);
        } else if (data.type === 'game_start') {
            console.log("Game started");
            startCountdown();
        } else if (data.type === 'error') {
            alert(data.message);
            resetUI();
        } else if (data.type === 'game_over') {
            displayGameOver(data.winner);
        }
    }

    function startCountdown() {
        let timeLeft = 10;
        const countdownElement = document.querySelector('.countdown');
        countdownElement.style.display = 'block';

        const countdownInterval = setInterval(() => {
            countdownElement.textContent = `Time left: ${timeLeft} seconds`;
            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(countdownInterval);
                countdownElement.style.display = 'none';
            }
        }, 1000);
    }

    function updateGameState(data) {
        moves++;
        const movesLeft = document.querySelector('.movesleft');
        movesLeft.innerText = `Moves Left: ${10 - moves}`;

        if (data.player === socket.username) {
            // This is the current player's move
            console.log(`You played ${data.move}`);
        } else {
            // This is the opponent's move
            console.log(`Opponent played ${data.move}`);
        }
    }

    function displayResult(data) {
        const result = document.querySelector('.result');
        const playerScoreBoard = document.querySelector('.p-count');
        const opponentScoreBoard = document.querySelector('.c-count');

        if (data.winner === socket.username) {
            result.textContent = 'You Won';
            playerScore++;
        } else if (data.winner === 'tie') {
            result.textContent = 'Tie';
        } else {
            result.textContent = 'Opponent Won';
            opponentScore++;
        }

        playerScoreBoard.textContent = playerScore;
        opponentScoreBoard.textContent = opponentScore;

        if (moves === 10) {
            endGame();
        }
    }

    function endGame() {
        const chooseMove = document.querySelector('.move');
        const result = document.querySelector('.result');

        playerOptions.forEach(option => {
            option.style.display = 'none';
            option.removeEventListener('click', handleClick);
        });

        chooseMove.innerText = '[GAME OVER]';
        document.querySelector('.movesleft').style.display = 'none';

        if (playerScore > opponentScore) {
            result.style.fontSize = '2rem';
            result.innerText = 'You Won The Game';
            result.style.color = '#308D46';
        } else if (playerScore < opponentScore) {
            result.style.fontSize = '2rem';
            result.innerText = 'You Lost The Game';
            result.style.color = 'red';
        } else {
            result.style.fontSize = '2rem';
            result.innerText = 'Tie';
            result.style.color = 'grey';
        }

        $("#shifumi-start").prop("disabled", false);
    }

    function resetUI() {
        document.getElementById('game-setup').style.display = 'block';
        document.getElementById('waiting-message').style.display = 'none';
        document.getElementById('shifumi-game').style.display = 'none';
    }

    function displayGameOver(winner) {
        // Display game over message
        const result = document.querySelector('.result');
        result.textContent = `Game Over! ${winner} wins!`;

        // Disable game controls
        playerOptions.forEach(option => {
            option.disabled = true;
        });

        // Add a button to return to chat
        const returnButton = document.createElement('button');
        returnButton.textContent = 'Return to Chat';
        returnButton.addEventListener('click', () => {
            window.location.href = '/chat'; // Adjust this URL as needed
        });
        document.querySelector('.shifumi-game').appendChild(returnButton);
    }

    return {
        init: function(roomName) {
            initGame(roomName);
            const gameContainer = document.getElementById('shifumi-game');
            if (gameContainer) {
                $("#shifumi-start").prop("disabled", true);
            }
        },
        isActive: function() {
            return isGameActive;
        }
    };
})();

if (document.getElementById('shifumi-game')) {
    $(document).ready(function() {
        $("#shifumi-start").click(function() {
            const roomName = Math.random().toString(36).substring(7);
            window.ShifumiGame.init(roomName);
        });
    });
}