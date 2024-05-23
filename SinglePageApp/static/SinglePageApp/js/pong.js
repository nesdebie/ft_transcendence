// board
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;

// players
let playerWidth = 10;
let playerHeight = 50;
let player1Speed = 3;
let player2Speed = 3;

let player1 = {
    x: 10,
    y: boardHeight / 2 - playerHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: 0
}

let player2 = {
    x: boardWidth - playerWidth - 10,
    y: boardHeight / 2 - playerHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: 0
}

// ball
let ballWidth = 10;
let ballHeight = 10;
let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: 1,
    velocityY: 2
}

let player1Score = 0;
let player2Score = 0;
let gameInterval;
let gamePaused = false;

document.addEventListener("DOMContentLoaded", function() {
    board = document.getElementById("pong");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // used for drawing on the board

    document.getElementById("startGame").addEventListener("click", startGame);
    document.getElementById("pauseGame").addEventListener("click", pauseGame);
    document.getElementById("resetGame").addEventListener("click", resetGame);
    
    document.getElementById("increasePlayer1Speed").addEventListener("click", function() {
        player1Speed++;
    });

    document.getElementById("decreasePlayer1Speed").addEventListener("click", function() {
        if (player1Speed > 1) player1Speed--;
    });

    document.getElementById("increasePlayer2Speed").addEventListener("click", function() {
        player2Speed++;
    });

    document.getElementById("decreasePlayer2Speed").addEventListener("click", function() {
        if (player2Speed > 1) player2Speed--;
    });

    document.addEventListener("keyup", movePlayer);

    // Initial drawing of players and ball
    draw();
});

function startGame() {
    if (!gameInterval) {
        gameInterval = setInterval(update, 1000 / 60); // 60 FPS
    }
    gamePaused = false;
}

function pauseGame() {
    if (gameInterval) {
        clearInterval(gameInterval);
        gameInterval = null;
    }
    gamePaused = true;
}

function resetGame() {
    ball.x = boardWidth / 2;
    ball.y = boardHeight / 2;
    ball.velocityX = 1;
    ball.velocityY = 2;
    player1Score = 0;
    player2Score = 0;
    player1.y = boardHeight / 2 - playerHeight / 2;
    player2.y = boardHeight / 2 - playerHeight / 2;
    pauseGame();
    draw();
}

function update() {
    if (gamePaused) return;

    context.clearRect(0, 0, board.width, board.height);

    // Player 1
    context.fillStyle = "#fdf800";
    let nextPlayer1Y = player1.y + player1.velocityY;
    if (!outOfBounds(nextPlayer1Y)) {
        player1.y = nextPlayer1Y;
    }
    context.fillRect(player1.x, player1.y, playerWidth, playerHeight);

    // Player 2
    let nextPlayer2Y = player2.y + player2.velocityY;
    if (!outOfBounds(nextPlayer2Y)) {
        player2.y = nextPlayer2Y;
    }
    context.fillRect(player2.x, player2.y, playerWidth, playerHeight);

    // Ball
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ballWidth, ballHeight);

    if (ball.y <= 0 || (ball.y + ballHeight >= boardHeight)) { 
        ball.velocityY *= -1; // Reverse direction
    }

    if (ball.y <= 0) { 
        ball.velocityY = 2; // Go down
    } else if (ball.y + ballHeight >= boardHeight) {
        ball.velocityY = -2; // Go up
    }

    // Bounce the ball back
    if (detectCollision(ball, player1)) {
        if (ball.x <= player1.x + player1.width) { // Left side of ball touches right side of player 1
            ball.velocityX *= -1; // Flip x direction
        }
    } else if (detectCollision(ball, player2)) {
        if (ball.x + ballWidth >= player2.x) { // Right side of ball touches left side of player 2
            ball.velocityX *= -1; // Flip x direction
        }
    }

    // Game over
    if (ball.x < 0) {
        player2Score++;
        resetBall(1);
    } else if (ball.x + ballWidth > boardWidth) {
        player1Score++;
        resetBall(-1);
    }

    // Score
    context.font = "45px sans-serif";
    context.fillText(player1Score, boardWidth / 5, 45);
    context.fillText(player2Score, boardWidth * 4 / 5 - 45, 45);

    // Draw dotted line down the middle
    for (let i = 10; i < board.height; i += 25) {
        context.fillRect(board.width / 2 - 10, i, 5, 5);
    }
}

function outOfBounds(yPosition) {
    return (yPosition < 0 || yPosition + playerHeight > boardHeight);
}

function movePlayer(e) {
    if (gamePaused) return;

    // Player 1
    if (e.code == "KeyW") {
        player1.velocityY = -player1Speed;
    } else if (e.code == "KeyS") {
        player1.velocityY = player1Speed;
    }

    // Player 2
    if (e.code == "ArrowUp") {
        player2.velocityY = -player2Speed;
    } else if (e.code == "ArrowDown") {
        player2.velocityY = player2Speed;
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   // a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   // a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  // a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    // a's bottom left corner passes b's top left corner
}

function resetBall(direction) {
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: direction,
        velocityY: 2
    }
}

function draw() {
    context.clearRect(0, 0, board.width, board.height);

    // Player 1
    context.fillStyle = "#fdf800";
    context.fillRect(player1.x, player1.y, playerWidth, playerHeight);

    // Player 2
    context.fillRect(player2.x, player2.y, playerWidth, playerHeight);

    // Ball
    context.fillStyle = "white";
    context.fillRect(ball.x, ball.y, ballWidth, ballHeight);

    // Draw dotted line down the middle
    for (let i = 10; i < board.height; i += 25) {
        context.fillRect(board.width / 2 - 10, i, 5, 5);
    }
}
