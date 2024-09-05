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
			tournamentList.appendChild(listItem);
		});
	});
}
