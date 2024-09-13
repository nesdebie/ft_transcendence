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
    fetch('/api/pong/tournaments/')
    .then(response => response.json())
    .then(data => {
        const tournamentList = document.getElementById('tournament-list');
        const currentUser = tournamentList.getAttribute('data-currentUser');
        tournamentList.innerHTML = ''; // Clear existing list
        if (data.length == 0) {
            console.log('No Tournaments; data = ', data);
            tournamentList.innerHTML = 'No available Tournaments';
        } else {
            data.forEach(tournament => {
                const listItem = document.createElement('li');
                listItem.textContent = `Tournament ID: ${tournament.id}, Players: ${tournament.players.length}/${tournament.number_of_players}`;

                // Check if the player has joined the tournament
                console.log('Tournament: ', tournament);
                console.log('currentUser: ', currentUser);
                if (tournament.players.includes(currentUser)) {
                    const viewButton = document.createElement('button');
                    viewButton.textContent = 'View Tournament';
                    viewButton.onclick = () => redirectToRoute(`/waiting_joining_tournament/${tournament.id}/`);
                    listItem.appendChild(viewButton);
                } else if (tournament.players.length < tournament.number_of_players) {
                    const joinButton = document.createElement('button');
                    joinButton.textContent = 'Join Tournament';
                    joinButton.onclick = () => {
                        // Logic to join the tournament
                        joinTournament(tournament.id);
                    };
                    listItem.appendChild(joinButton);
                }

                tournamentList.appendChild(listItem);
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
        listItem.textContent = game;
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

    redirectToRoute(`/waiting_joining_game/${tournamentId}/${gameId}`);
    // Add the user to the player_joined list
}

export function checkTournamentGameStatus() {
    const tournamentGameData    = document.getElementById('waiting-status').getAttribute('data-tournament-game');;
    const currentUser           = document.getElementById().getAttribute('data-currentUser');

    const tournamentId          = tournamentGameData.tournament_id;
    const gameId                = tournamentGameData.game_id; // Assuming game_id is part of tournamentGameData

    fetch(`/api/pong/tournament/${tournamentId}/${gameId}/`)
        .then(response => response.json())
        .then(data => {
            console.log('waiting for other player: ',data);
            if (data.ready) {
                redirectToRoute(`/pong/${tournamentId}_${gameId}/`)
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


