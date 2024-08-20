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
				startGame(data.game_id);
			}
		});
	}
	
	function pollForMatch(matchmakingId) {
		fetch(`/api/pong/matchmaking/${matchmakingId}/`)
		.then(response => response.json())
		.then(data => {
			if (data.status === 'matched') {
				startGame(data.game_id);
			} else {
				setTimeout(() => pollForMatch(matchmakingId), 2000);
			}
		});
	}
	
	function startGame(gameId) {
		const lobbyStatus = document.getElementById('lobby-status');
		const matchStatus = document.getElementById('match-status');
		const matchmakingBtn = document.getElementById('matchmaking-btn');
		lobbyStatus.style.display = 'none';
		matchmakingBtn.style.display = 'none';
		matchStatus.textContent = 'Match found! Starting game...';
		matchStatus.style.display = 'block';
		redirectToRoute(`/pong/${gameId}`);
}

export { startMatchmaking };