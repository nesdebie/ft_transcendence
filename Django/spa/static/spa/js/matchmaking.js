import { redirectToRoute } from "./router.js";


function startMatchmaking() {
	const lobbyStatus = document.getElementById('lobby-status');
	fetch('/api/pong/matchmaking/', { method: 'POST' })
	.then(response => response.json())
	.then(data => {
		if (data.status === 'waiting') {
				lobbyStatus.textContent = 'Waiting for an opponent...';
				pollForMatch(data.matchmaking_id);
			} else if (data.status === 'matched') {
				startGame(data.room_name);
			}
		});
	}
	
	function pollForMatch(matchmakingId) {
		fetch(`/api/pong/matchmaking/${matchmakingId}/`)
		.then(response => response.json())
		.then(data => {
			console.log('Matchmaking data: ',data);
			if (data.status === 'matched') {
				startGame(data.room_name);
			} else {
				setTimeout(() => pollForMatch(matchmakingId), 2000);
			}
		});
	}
	
	function startGame(room_name) {
		const lobbyStatus = document.getElementById('lobby-status');
		const matchStatus = document.getElementById('match-status');
		const matchmakingBtn = document.getElementById('matchmaking-btn');
		if (lobbyStatus) {
			lobbyStatus.style.display = 'none';
		}
		if (matchmakingBtn) {
			matchmakingBtn.style.display = 'none';
		}
		if (matchStatus) {
			matchStatus.textContent = 'Match found! Starting game...';
			matchStatus.style.display = 'block';
		}
		redirectToRoute(`/pong/${room_name}`);
}

export { startMatchmaking };