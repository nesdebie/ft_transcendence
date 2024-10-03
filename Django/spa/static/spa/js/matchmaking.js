import { redirectToRoute } from "./router.js";


function startMatchmaking(gameType) {
    const lobbyStatus = document.getElementById('lobby-status');
    const matchmakingBtn = document.getElementById('matchmaking-btn');
    
    console.log('gameType: ', gameType);
    
    fetch('/api/pong/matchmaking/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_type: gameType })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'waiting') {
            lobbyStatus.textContent = 'Waiting for an opponent...';
            matchmakingBtn.textContent = 'Quit Matchmaking'; // Change button text
            matchmakingBtn.setAttribute('data-matchmaking-id', data.matchmaking_id);
            pollForMatch(data.matchmaking_id);
        } else if (data.status === 'matched') {
            startGame(data.room_name, data.game_type);
        }
    });
}

function stopMatchmaking(matchmakingId) {
    const matchmakingBtn = document.getElementById('matchmaking-btn');
    fetch(`/api/pong/matchmaking/stop/${matchmakingId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Matchmaking stopped: ', data);
        const lobbyStatus = document.getElementById('lobby-status');
        lobbyStatus.textContent = 'Matchmaking stopped.';
        matchmakingBtn.textContent = 'Find a Match'; // Reset button text 
    });
}

function pollForMatch(matchmakingId) {
	fetch(`/api/pong/matchmaking/${matchmakingId}/`)
	.then(response => response.json())
	.then(data => {
		console.log('Matchmaking data: ',data);
		if (data.status === 'matched') {
			startGame(data.room_name, data.game_type);
		} else if (data.status == 'matchmaking_removed') {
			return;
		} else {
			setTimeout(() => {
				if ((data.game_type == 'pong' && window.location.pathname === '/pong_lobby') 
					|| (data.game_type == 'shifumi' && window.location.pathname === '/shifumi_lobby')) {
					pollForMatch(matchmakingId)
				} else {
					fetch(`/api/pong/matchmaking/stop/${matchmakingId}/`)
					.then(response => response.json())
					.then(data => {console.log('Matchmaking stoped: ', data)})
				}
			}, 2000);
				
		}
	});
}

function startGame(room_name, game_type) {
	console.log('Starting game room: ', room_name)
	console.log('Starting game type: ', game_type)
	if (game_type == 'pong')
		redirectToRoute(`/pong/${room_name}`);
	else 
		redirectToRoute(`/shifumi/${room_name}`)
}

export { startMatchmaking, stopMatchmaking };