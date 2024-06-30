window.ShifumiGame = (function() {
    let playerScore, computerScore, moves, gameInitialized = false;
    let mentalistMode = false; // Add a global variable for mentalist mode

    function initGame(difficulty, mentalist) {
        if (gameInitialized) return;
        gameInitialized = true;

        playerScore = 0;
        computerScore = 0;
        moves = 0;
        mentalistMode = mentalist; // Initialize mentalist mode
        console.log("Shifumi initialized");
        setupEventListeners(difficulty);
    }

    function setupEventListeners(difficulty) {
        const rockBtn = document.querySelector('.rock');
        const paperBtn = document.querySelector('.paper');
        const scissorBtn = document.querySelector('.scissor');
        const playerOptions = [rockBtn, paperBtn, scissorBtn];

        playerOptions.forEach(option => {
            option.addEventListener('click', function () {
                if (mentalistMode && moves < 10) {
                    goMentalist();
                }
                const movesLeft = document.querySelector('.movesleft');
                moves++;
                movesLeft.innerText = `Moves Left: ${10 - moves}`;

                const choiceNumber = Math.floor(Math.random() * 3);
                const computerChoice = ['rock', 'paper', 'scissors'][choiceNumber];

                determineWinner(this.innerText, computerChoice, difficulty);

                if (moves === 10) {
                    endGame(playerOptions, movesLeft);
                }
            });
        });
    }

    function determineWinner(player, computer, difficulty) {
        const result = document.querySelector('.result');
        const playerScoreBoard = document.querySelector('.p-count');
        const computerScoreBoard = document.querySelector('.c-count');
        player = player.toLowerCase();
        computer = computer.toLowerCase();

        if (difficulty === 0) {
            result.textContent = 'Player Won';
            playerScore++;
        }
        else if (difficulty === 2) {
            result.textContent = 'Computer Won';
            computerScore++;
        }
        else if (difficulty === 1) {
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
        }

        playerScoreBoard.textContent = playerScore;
        computerScoreBoard.textContent = computerScore;
    }

    function goMentalist() {
        const chooseMove = document.querySelector('.move');
        const choiceNumber = Math.floor(Math.random() * 3);
        const computerChoice = ['rock', 'paper', 'scissors'][choiceNumber];

        chooseMove.innerText = '[CPU] : "I g0nna play ' + computerChoice + '!"';
    }

    function endGame(playerOptions, movesLeft) {
        const chooseMove = document.querySelector('.move');
        const result = document.querySelector('.result');

        playerOptions.forEach(option => {
            option.style.display = 'none';
        });

        chooseMove.innerText = '[GAME OVER]';
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
        init: function(difficulty, mentalistMode) {
            initGame(difficulty, mentalistMode);
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
            let difficulty = parseInt($("#difficultySlider").val());
            let mentalistMode = $("#mentalistMode").is(":checked");
            window.ShifumiGame.init(difficulty, mentalistMode);
        });
    });
}

function updateSliderValue(value) {
    const difficulty = ['easy', 'normal', 'hard'];
    document.getElementById('sliderValue').textContent = difficulty[value];
}
