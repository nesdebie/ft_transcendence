import { redirectToRoute } from "./router.js";

export function createTournament() {
	const numberOfPlayers = prompt("Enter the number of players for the tournament:");
    if (numberOfPlayers) {
        fetch('/api/pong/create_tournament/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ number_of_players: numberOfPlayers }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Tournament created successfully!');
                loadTournaments(); // Refresh the tournament list
            } else {
                alert('Error creating tournament: ' + data.error);
            }
        });
    }
}

export function loadTournaments() {
    fetch('/api/pong/tournaments/')
    .then(response => response.json())
    .then(data => {
        const tournamentList = document.getElementById('tournament-list');
        tournamentList.innerHTML = ''; // Clear existing list
        data.forEach(tournament => {
            const listItem = document.createElement('li');
            listItem.textContent = `Tournament ID: ${tournament.id}, Players: ${tournament.players.length}/${tournament.number_of_players}`;

            // Check if the player has joined the tournament
            if (tournament.players.includes(currentUser.username)) {
                const viewButton = document.createElement('button');
                viewButton.textContent = 'View Tournament';
                viewButton.onclick = () => redirectToRoute(`/tournament/${tournament.id}/`);
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
            redirectToRoute(`/tournament/${tournament.id}/`); // Redirect to waiting page
        } else {
            alert('Error joining tournament: ' + data.error);
        }
    });
}

// Function to fetch tournament details
export function fetchTournamentDetails(tournamentId) {
    fetch(`/api/pong/tournament/${tournamentId}/`)
    .then(response => response.json())
    .then(data => {
        populateTournamentPage(data);
    });
}

function populateTournamentPage(data) {
    const participantsList = document.getElementById('participants-list');
    const gameHistory = document.getElementById('game-history');
    const upcomingGames = document.getElementById('upcoming-games');

    // Populate participants
    data.participants.forEach(participant => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${participant.username}</td><td>${participant.score}</td>`;
        participantsList.appendChild(row);
    });

    // Populate game history
    data.gameHistory.forEach(game => {
        const listItem = document.createElement('li');
        listItem.textContent = `Game: ${game.id}, Outcome: ${game.outcome}`;
        gameHistory.appendChild(listItem);
    });

    // Populate upcoming games
    data.upcomingGames.forEach(game => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `Game: ${game.id} <button onclick="askToJoin('${game.id}')">Ask to Join</button>`;
        upcomingGames.appendChild(listItem);
    });
}

export function checkTournamentStatus() {
    fetch(`/api/pong/tournament/${tournamentId}/status/`)
        .then(response => response.json())
        .then(data => {
            if (data.is_full) {
                // Redirect to the tournament page
                redirectToRoute(`/tournament/${tournamentId}/`);
            } else {
                // Check again after a delay
                setTimeout(() => {
                    if (window.location.pathname.startsWith('/waiting')) {
                        checkTournamentStatus();
                    }
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error checking tournament status:', error);
        });
}


