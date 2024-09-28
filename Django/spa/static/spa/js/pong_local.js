window.PongGame = (function() {
    let context;
    let player1, player2, ball;
    let player1Score, player2Score;
    let gameWon, scoreToReset;

    function initVal(score) {
        scoreToReset = score; // Initialize scoreToReset here
        gameWon = false;

        player1 = { x: 10, y: 250, width: 10, height: 50, velocityY: 0 };
        player2 = { x: 480, y: 250, width: 10, height: 50, velocityY: 0 };
        ball = { x: 250, y: 250, width: 10, height: 10, velocityX: 1, velocityY: 2 };
        player1Score = 0;
        player2Score = 0;

        document.addEventListener('keydown', keyDownHandler);
        document.addEventListener('keyup', keyUpHandler);
        requestAnimationFrame(update);
    }

    function detectCollision(ball, player) {
        return ball.x < player.x + player.width &&
               ball.x + ball.width > player.x &&
               ball.y < player.y + player.height &&
               ball.y + ball.height > player.y;
    }

    function outOfBounds(y) {
        return y < 0 || y + player1.height > 500;
    }

    function keyDownHandler(event) {
        switch(event.key) {
            case 'ArrowUp':
                player2.velocityY = -5;
                break;
            case 'ArrowDown':
                player2.velocityY = 5;
                break;
            case 'w':
                player1.velocityY = -5;
                break;
            case 's':
                player1.velocityY = 5;
                break;
        }
    }

    function keyUpHandler(event) {
        switch(event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
                player2.velocityY = 0;
                break;
            case 'w':
            case 's':
                player1.velocityY = 0;
                break;
        }
    }

    function cleanup() {
        gameWon = true;
        document.removeEventListener('keydown', keyDownHandler);
        document.removeEventListener('keyup', keyUpHandler);
        if (context) {
            context.clearRect(0, 0, 500, 500);
        }
    }

    function update() {
        if (gameWon) return;
        if (!gameWon && window.location.pathname !== '/pong_local') {
            console.log("Game interrupted !");
            cleanup();
        }
        requestAnimationFrame(update);
        context.clearRect(0, 0, 500, 500);

        // Update and draw player1
        context.fillStyle = "white";
        if (!outOfBounds(player1.y + player1.velocityY)) {
            player1.y += player1.velocityY;
        }
        context.fillRect(player1.x, player1.y, player1.width, player1.height);

        // Update and draw player2
        if (!outOfBounds(player2.y + player2.velocityY)) {
            player2.y += player2.velocityY;
        }
        context.fillRect(player2.x, player2.y, player2.width, player2.height);

        // Update and draw ball
        ball.x += ball.velocityX;
        ball.y += ball.velocityY;
        context.fillRect(ball.x, ball.y, ball.width, ball.height);

        // Ball collision detection
        if (ball.y <= 0 || ball.y + ball.height >= 500) {
            ball.velocityY *= -1;
        }
        if (detectCollision(ball, player1) || detectCollision(ball, player2)) {
            ball.velocityX *= -1;
        }

        if (ball.x < 0) {
            player2Score++;
            resetGame(1);
        } else if (ball.x + ball.width > 500) {
            player1Score++;
            resetGame(-1);
        }

        // Draw scores
        context.font = "45px sans-serif";
        context.fillText(player1Score, 100, 45);
        context.fillText(player2Score, 400, 45);

        // Draw dotted line down the middle
        for (let i = 10; i < 500; i += 25) {
            context.fillRect(500 / 2 - 2, i, 5, 5);
        }
    }

    function resetGame(direction) {
        ball.x = 250;
        ball.y = 250;
        ball.velocityX = direction;
        ball.velocityY = 2;

        if (player1Score >= scoreToReset || player2Score >= scoreToReset) {
            gameWon = true;
            console.log(player1Score > player2Score ? "P1 WON :" : "P2 WON :", player1Score, "-", player2Score);
            context.font = "100px sans-serif";
            context.fillText(player1Score > player2Score ? "P1 WON!" : "P2 WON!", 40, 275);
            $("#pong-local-start").prop("disabled", false); // Enable the button
        }
    }

    return {
        init: function(score) {
            let canvas = document.getElementById('pong-local-game');
            if (canvas) {
                context = canvas.getContext('2d');
                initVal(score);
                $("#pong-local-start").prop("disabled", true); // Disable the button initially
            }
        },
        cleanup: cleanup
    };
})();

if (document.getElementById('pong-local-game')) {
    $(document).ready(function() {
        $("#pong-local-start").click(function(){
            let scoreToReset = parseInt($("#scoreSlider").val());
            window.PongGame.init(scoreToReset);
        });
    });
}

function updateSliderValue(value) {
    document.getElementById('sliderValue').textContent = value;
}