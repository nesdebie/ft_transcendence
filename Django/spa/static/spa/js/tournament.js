import { redirectToRoute } from "./router.js";

export function createTournament() {
	let numberOfPlayers = prompt("Enter the number of players for the tournament:");
    while (numberOfPlayers < 2 || numberOfPlayers > 10)
        numberOfPlayers = prompt("Please enter the number of players between 2 and 10 included:");
    if (numberOfPlayers) {
        fetch('/api/pong/tournaments/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ number_of_players: numberOfPlayers }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert('Error creating tournament: ' + data.error);
            } else {
                console.log('Tournament created successfully')
                loadTournaments(); // Refresh the tournament list
            }
        });
    }
}

export function loadTournaments() {
    fetch('/api/pong/tournaments_lists/')
    .then(response => response.json())
    .then(data => {
        console.log('tournament list: ', data);  
        const yourTournamentList = document.getElementById('your-tournament-list');
        const availableTournamentList = document.getElementById('available-tournament-list');
        const finishedTournamentList = document.getElementById('finished-tournament-list');

        const yourTournamentsTitle = document.getElementById('your-tournaments-title');
        const availableTournamentsTitle = document.getElementById('available-tournaments-title');
        const finishedTournamentsTitle = document.getElementById('finished-tournaments-title');

        // Clear existing lists
        yourTournamentList.innerHTML = '';
        availableTournamentList.innerHTML = '';
        finishedTournamentList.innerHTML = '';

        // Populate Your Tournaments
        if (data.your.length === 0) {
            yourTournamentsTitle.style.display = 'none';
        } else {
            yourTournamentsTitle.style.display = 'block';
            data.your.forEach(tournament => {
                const listItem = document.createElement('li');
                listItem.textContent = `Tournament ID: ${tournament.id}, Players: ${tournament.players.length}/${tournament.number_of_players}`;
                
                const viewButton = document.createElement('button');
                viewButton.textContent = 'View Tournament';
                viewButton.onclick = () => redirectToRoute(`/waiting_joining_tournament/${tournament.id}/`);
                listItem.appendChild(viewButton);
                
                yourTournamentList.appendChild(listItem);
            });
        }

        // Populate Available Tournaments
        if (data.available.length === 0) {
            availableTournamentsTitle.style.display = 'none';
        } else {
            availableTournamentsTitle.style.display = 'block';
            data.available.forEach(tournament => {
                const listItem = document.createElement('li');
                listItem.textContent = `Tournament ID: ${tournament.id}, Players: ${tournament.players.length}/${tournament.number_of_players}`;
                
                const joinButton = document.createElement('button');
                joinButton.textContent = 'Join Tournament';
                joinButton.onclick = () => {
                    // Logic to join the tournament
                    joinTournament(tournament.id);
                };
                listItem.appendChild(joinButton);
                
                availableTournamentList.appendChild(listItem);
            });
        }

        // Populate Finished Tournaments
        if (data.your_finished.length === 0) {
            finishedTournamentsTitle.style.display = 'none';
        } else {
            finishedTournamentsTitle.style.display = 'block';
            data.your_finished.forEach(tournament => {
                const listItem = document.createElement('li');
                listItem.textContent = `Tournament ID: ${tournament.id}, Players: ${tournament.players.length}/${tournament.number_of_players}`;
                
                const viewButton = document.createElement('button');
                viewButton.textContent = 'View Tournament';
                viewButton.onclick = () => redirectToRoute(`/waiting_joining_tournament/${tournament.id}/`);
                listItem.appendChild(viewButton);
                
                finishedTournamentList.appendChild(listItem);
            });
        }
    });
}

function joinTournament(tournamentId) {
    fetch(`/api/pong/join_tournament/${tournamentId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            redirectToRoute(`/waiting_joining_tournament/${tournamentId}/`); // Redirect to waiting page
        } else {
            alert('Error joining tournament: ' + data.error);
        }
    });
}

export function populateTournamentPage() {
    const Players_score_List = document.getElementById('Players_score-list');
    const gameHistory = document.getElementById('game-history');
    const upcomingGames = document.getElementById('upcoming-games');
    const currentUser = Players_score_List.getAttribute('data-currentUser');
    
    // Parse the data-tournament attribute
    const data = JSON.parse(document.getElementById('participants-table').getAttribute('data-tournament'));
    console.log('Tournament data received: ', data);

    // Clear existing content
    Players_score_List.innerHTML = '';
    gameHistory.innerHTML = '';
    upcomingGames.innerHTML = '';

    // Populate participants with online/offline status
    Object.entries(data.scores).forEach(([username, score]) => {
        const row = document.createElement('tr');
        const statusColor = data.playerStatus[username] ? 'green' : 'red'; // Assuming playerStatus is provided in data
        row.innerHTML = `<td>${username}&nbsp <span style="color: ${statusColor};">(${data.playerStatus[username] ? 'Online' : 'Offline'})</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td>${score}</td>`;        Players_score_List.appendChild(row);
    });

    // Populate game history
    data.game_history.forEach(game => {
        const listItem = document.createElement('li');
    
        // Extract values from the game array
        const player1 = game[1]; // game[1]
        const player2 = game[2]; // game[2]
        const score = game[3]; // game[3]
        const winner = game[4]; // game[4]
    
        // Create a span for player1
        const player1Span = document.createElement('span');
        player1Span.textContent = player1;
    
        // Create a span for player2
        const player2Span = document.createElement('span');
        player2Span.textContent = player2;
    
        // Apply color based on currentUser and whether they won
        if (player1 === currentUser) {
            if (winner === currentUser) {
                player1Span.style.color = 'green'; // Player1 won
            } else {
                player1Span.style.color = 'red'; // Player1 lost
            }
        } else if (player2 === currentUser) {
            if (winner === currentUser) {
                player2Span.style.color = 'green'; // Player2 won
            } else {
                player2Span.style.color = 'red'; // Player2 lost
            }
        }
    
        // Create a text node for the score
        const scoreText = document.createTextNode(` ${score} `);
    
        // Append player1Span, scoreText, and player2Span to the list item
        listItem.appendChild(player1Span);
        listItem.appendChild(scoreText);
        listItem.appendChild(player2Span);
        
        // Append the list item to the game history
        gameHistory.appendChild(listItem);
    });

    // Populate upcoming games with dynamic button text
    data.upcoming_games.forEach(game => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `Game: ${game.players[0]} VS ${game.players[1]} `;
        console.log('Game: ',game);

        if (game.players.includes(currentUser)) {
            if (game.Players_joined.length > 0) {
                listItem.innerHTML += `<button id='join-tournament-game' data-currentUser='${currentUser}' data-tournament-game='${JSON.stringify(game)}'>Join Game !</button>`;
            } else if (data.playerStatus[game.players.find(player => player !== currentUser)] == false) {
                listItem.innerHTML += `<span>Waiting for other player to be available...</span>`;
            } else {
                listItem.innerHTML += `<button id='join-tournament-game' data-currentUser='${currentUser}' data-tournament-game='${JSON.stringify(game)}'>Create Game</button>`;
            }
        }
        upcomingGames.appendChild(listItem);
    });
}

export function join_tournament_game(username, tournamentGameData) {
    console.log(tournamentGameData);
    const tournamentId = tournamentGameData.tournament_id;
    const gameId = tournamentGameData.game_id; // Assuming game_id is part of tournamentGameData
    
    console.log('GameId: ',gameId);
    // Redirect to waiting page
    fetch(`/api/pong/tournament/${tournamentId}/game_info/${gameId}/switch_player_status`) //add player to join list of the game
        .catch(error => console.error('Error in changing player status in game:', error));

    redirectToRoute(`/waiting_tournament_game/${tournamentId}/${gameId}`);
    // Add the user to the player_joined list
}

export function checkTournamentGameStatus() {
    const tournamentGameData    = JSON.parse(document.getElementById('waiting-status').getAttribute('data-tournament-game'));
    console.log('tournamentGameData: ', tournamentGameData);

    const tournamentId          = tournamentGameData.tournament_id;
    const gameId                = tournamentGameData.game_id; // Assuming game_id is part of tournamentGameData


    fetch(`/api/pong/tournament/${tournamentId}/${gameId}/status/`)
        .then(response => response.json())
        .then(data => {
            console.log('waiting for other player: ',data);
            if (data.ready) {
                redirectToRoute(`/pong/tournament/${tournamentId}/game/${gameId}/`)
            } else {
                setTimeout(() => {
                    if (window.location.pathname.startsWith('/waiting_tournament_game')) {
                        checkTournamentGameStatus();
                    }
                    else {
                        fetch(`/api/pong/tournament/${tournamentId}/game_info/${gameId}/switch_player_status`) //add player to join list of the game
                            .catch(error => console.error('Error in changing player status in game:', error));//remove player from ready list
                        console.log(`Player has been removed from game`);
                    }
                }, 2000);                
            }
        })
}

export function checkTournamentStatus() {
    const tournamentId = document.getElementById('waiting-status').getAttribute('data-tournament_id')
    fetch(`/api/pong/tournament/${tournamentId}/is_active/`)
        .then(response => response.json())
        .then(data => {
            console.log('data: ',data);
            if (data.is_active) {
                // Redirect to the tournament page
                redirectToRoute(`/tournament/${tournamentId}/`);
            } else {
                // Check again after a delay
                setTimeout(() => {
                    if (window.location.pathname.startsWith('/waiting_joining_tournament')) {
                        checkTournamentStatus();
                    }
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error checking tournament status:', error);
        });
}

