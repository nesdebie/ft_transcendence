/* --- BOARD VARIABLES --- */
let board;
let boardWidth = 500;
let boardHeight = 500;
let context;
let gamePaused = false;
let gameStarted = false;
let animationFrameId;

/* --- PLAYERS VARIABLES --- */
let playerWidth = 10;
let playerHeight = 50;
let playerVelocityY = 0;

/* --- PLAYER1 VARIABLES --- */
let player1 = {
    x: 10,
    y: boardHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: 0
};

/* --- PLAYER2 VARIABLES --- */
let player2 = {
    x: boardWidth - playerWidth - 10,
    y: boardHeight / 2,
    width: playerWidth,
    height: playerHeight,
    velocityY: 0
};

/* --- BALL VARIABLES --- */
let ballWidth = 10;
let ballHeight = 10;
let ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: ballWidth,
    height: ballHeight,
    velocityX: 1,
    velocityY: 2
};

/* --- SCORES VARIABLES --- */
let player1Score = 0;
let player2Score = 0;

function outOfBounds(yPosition) {
    return (yPosition < 0 || yPosition + playerHeight > boardHeight);
}

function movePlayer(e) {
    //player1
    if (e.code == "KeyW") {
        player1.velocityY = -3;
    } else if (e.code == "KeyS") {
        player1.velocityY = 3;
    }

    //player2
    if (e.code == "ArrowUp") {
        player2.velocityY = -3;
    } else if (e.code == "ArrowDown") {
        player2.velocityY = 3;
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && //a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x && //a's top right corner passes b's top left corner
        a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y; //a's bottom left corner passes b's top left corner
}

function resetGame(direction) {
    ball = {
        x: boardWidth / 2,
        y: boardHeight / 2,
        width: ballWidth,
        height: ballHeight,
        velocityX: direction,
        velocityY: 2
    };
}

function resetScore() {
    player1.y = boardHeight / 2 - playerHeight / 2;
    player2.y = boardHeight / 2 - playerHeight / 2;
    player1.velocityY = 0;
    player2.velocityY = 0;
    player1Score = 0;
    player2Score = 0;
    resetGame(1);
}

function update() {
    if (gamePaused) {
        return;
    }
    animationFrameId = requestAnimationFrame(update);
    context.clearRect(0, 0, boardWidth, boardHeight);

    // player1
    context.fillStyle = "white";
    let nextPlayer1Y = player1.y + player1.velocityY;
    if (!outOfBounds(nextPlayer1Y)) {
        player1.y = nextPlayer1Y;
    }
    context.fillRect(player1.x, player1.y, playerWidth, playerHeight);

    // player2
    let nextPlayer2Y = player2.y + player2.velocityY;
    if (!outOfBounds(nextPlayer2Y)) {
        player2.y = nextPlayer2Y;
    }
    context.fillRect(player2.x, player2.y, playerWidth, playerHeight);

    // ball
    context.fillStyle = "white";
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    context.fillRect(ball.x, ball.y, ballWidth, ballHeight);

    if (ball.y <= 0 || (ball.y + ballHeight >= boardHeight)) {
        // if ball touches top or bottom of canvas
        ball.velocityY *= -1; //reverse direction
    }

    //bounce the ball back
    if (detectCollision(ball, player1)) {
        if (ball.x <= player1.x + player1.width) { //left side of ball touches right side of player 1 (left paddle)
            ball.velocityX *= -1; // flip x direction
        }
    } else if (detectCollision(ball, player2)) {
        if (ball.x + ballWidth >= player2.x) { //right side of ball touches left side of player 2 (right paddle)
            ball.velocityX *= -1; // flip x direction
        }
    }

    //game over
    if (ball.x < 0) {
        player2Score++;
        resetGame(-1);

    } else if (ball.x + ballWidth > boardWidth) {
        player1Score++;
        resetGame(1);

    }

    //score
    context.font = "45px sans-serif";
    context.fillText(player1Score, boardWidth / 5, 45);
    context.fillText(player2Score, boardWidth * 4 / 5 - 45, 45);

    // draw dotted line down the middle
    for (let i = 10; i < boardHeight; i += 25) { //i = starting y Position, draw a square every 25 pixels down
        // (x position = half of boardWidth (middle) - 10), i = y position, width = 5, height = 5
        context.fillRect(boardWidth / 2 - 2, i, 5, 5);
    }
}

function handleKeyPress(e) {
    if (e.code == "Space") {
        gamePaused = !gamePaused;
        if (!gamePaused && gameStarted) {
            update();
        }
    } else if (e.code == "Enter") {
        if (!gameStarted) {
            gameStarted = true;
            update();
        } else {
            resetScore();
            if (gamePaused) {
                gamePaused = false;
                update();
            }
        }
    }
}

export function initializePong() {
    const board = document.getElementById("pong-game"); // Updated ID to match HTML
    if (board) {
        board.height = boardHeight;
        board.width = boardWidth;
        context = board.getContext("2d"); //used for drawing on the board
        //draw initial player1
        context.fillStyle = "white";
        context.fillRect(player1.x, player1.y, playerWidth, playerHeight);
        document.addEventListener("keydown", movePlayer);
        document.addEventListener("keydown", handleKeyPress);
    } else {
        console.error('Canvas element with id "pong-game" not found.');
    }
}
