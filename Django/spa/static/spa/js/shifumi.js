window.ShifumiGame = (function() {
    let playerScore, computerScore, moves;
    
    function initGame() {
        playerScore = 0;
        computerScore = 0;
        moves = 0;
        console.log("Shifumi initialized");
        setupEventListeners();
    }

    function setupEventListeners() {
        const rockBtn = document.querySelector('.rock');
        const paperBtn = document.querySelector('.paper');
        const scissorBtn = document.querySelector('.scissor');
        const playerOptions = [rockBtn, paperBtn, scissorBtn];

        playerOptions.forEach(option => {
            option.addEventListener('click', function () {
                const movesLeft = document.querySelector('.movesleft');
                moves++;
                movesLeft.innerText = `Moves Left: ${10 - moves}`;

                const choiceNumber = Math.floor(Math.random() * 3);
                const computerChoice = ['rock', 'paper', 'scissors'][choiceNumber];

                determineWinner(this.innerText, computerChoice);

                if (moves === 10) {
                    endGame(playerOptions, movesLeft);
                }
            });
        });
    }

    function determineWinner(player, computer) {
        const result = document.querySelector('.result');
        const playerScoreBoard = document.querySelector('.p-count');
        const computerScoreBoard = document.querySelector('.c-count');
        player = player.toLowerCase();
        computer = computer.toLowerCase();

        if (player === computer) {
            result.textContent = 'Tie';
        } else if ((player === 'rock' && computer === 'scissors') ||
                   (player === 'scissors' && computer === 'paper') ||
                   (player === 'paper' && computer === 'rock')) {
            result.textContent = 'Player Won';
            playerScore++;
        } else {
            result.textContent = 'Computer Won';
            computerScore++;
        }

        playerScoreBoard.textContent = playerScore;
        computerScoreBoard.textContent = computerScore;
    }

    function endGame(playerOptions, movesLeft) {
        const chooseMove = document.querySelector('.move');
        const result = document.querySelector('.result');;

        playerOptions.forEach(option => {
            option.style.display = 'none';
        });

        chooseMove.innerText = 'Game Over!!';
        movesLeft.style.display = 'none';

        if (playerScore > computerScore) {
            result.style.fontSize = '2rem';
            result.innerText = 'You Won The Game';
            result.style.color = '#308D46';
        } else if (playerScore < computerScore) {
            result.style.fontSize = '2rem';
            result.innerText = 'You Lost The Game';
            result.style.color = 'red';
        } else {
            result.style.fontSize = '2rem';
            result.innerText = 'Tie';
            result.style.color = 'grey';
        }
    }

    return {
        init: function() {
            initGame();
            const gameContainer = document.getElementById('shifumi-game');
            if (gameContainer) {
                $("#shifumi-start").prop("disabled", true); // Disable the button initially
            }
        }
    };
})();

if (document.getElementById('shifumi-game')) {
    $(document).ready(function() {
        $("#shifumi-start").click(function() {
            window.ShifumiGame.init();
        });
    });
}
