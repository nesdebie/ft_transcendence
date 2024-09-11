import { handleErrors } from './auth.js'
import { getCookie } from "./utils.js"
import { redirectToRoute } from "./router.js"

async function sendFriendRequest(username) {
	const formData = new FormData()
	formData.append('username', username);
	try {
		const response = await fetch('/users_api/send_friend_request/', {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCookie('csrftoken')
			},
			body:	formData
		});

		const data = await response.json()
		if (response.ok && data.status == 'succes') {
			redirectToRoute(window.location.pathname);
			const validation = document.getElementById('friend-request-validation');
			validation.textContent = 'Request send !'
		}
		else {
			handleErrors(data);
		}
	}
	catch (error) {
		console.error('Error during connection to server:', error);
	}
}

async function removeFriendRequest(username) {
	const formData = new FormData()
	formData.append('username', username);
	try {
		const response = await fetch('/users_api/remove_friend_request/', {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCookie('csrftoken')
			},
			body:	formData
		});

		const data = await response.json()
		if (response.ok && data.status == 'succes') {
			redirectToRoute(window.location.pathname);
			const validation = document.getElementById('friend-request-validation');
			validation.textContent = 'Request send !'
		}
		else {
			handleErrors(data);
		}
	}
	catch (error) {
		console.error('Error during connection to server:', error);
	}
}

async function acceptFriendRequest(id) {
	try {
		const response = await fetch('/users_api/accept_friend_request/' + id, {
			method: 'GET',
			headers: {
				'X-CSRFToken': getCookie('csrftoken')
			},
		});

		const data = await response.json()
		if (response.ok && data.status == 'succes') {
			redirectToRoute(window.location.pathname);
		}
		else {
			handleErrors(data);
		}
	}
	catch (error) {
		console.error('Error during connection to server:', error);
	}
}

async function denyFriendRequest(id) {
	try {
		const response = await fetch('/users_api/deny_friend_request/' + id, {
			method: 'GET',
			headers: {
				'X-CSRFToken': getCookie('csrftoken')
			},
		});

		const data = await response.json()
		if (response.ok && data.status == 'succes') {
			redirectToRoute(window.location.pathname);
		}
		else {
			handleErrors(data);
		}
	}
	catch (error) {
		console.error('Error during connection to server:', error);
	}
}

async function removeFriend(username) {
	const formData = new FormData()
	formData.append('username', username);
	try {
		const response = await fetch('/users_api/remove_friend/', {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCookie('csrftoken')
			},
			body:	formData
		});

		const data = await response.json()
		if (response.ok && data.status == 'succes') {
			alert('Friend removed');
			//redirectToRoute(window.location.pathname);
			redirectToRoute('/profile')
		}
		else {
			handleErrors(data);
		}
	}
	catch (error) {
		console.error('Error during connection to server:', error);
	}
}

async function         block_user(username) {
	const formData = new FormData()
	formData.append('username', username);
	try {
		const response = await fetch('/users_api/block_user/', {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: formData
		});

		const data = await response.json()
		if (response.ok && data.status == 'succes') {
			alert('User blocked !');
			//redirectToRoute(window.location.pathname);
			redirectToRoute('/profile')
		}
		else {
			handleErrors(data);
		}
	}
	catch (error) {
		console.error('Error during connection to server:', error);
	}
}

async function         unblock_user(username) {
	const formData = new FormData()
	formData.append('username', username);
	try {
		const response = await fetch('/users_api/unblock_user/', {
			method: 'POST',
			headers: {
				'X-CSRFToken': getCookie('csrftoken')
			},
			body: formData
		});

		const data = await response.json()
		if (response.ok && data.status == 'success') {
			alert('User unblocked !');
			redirectToRoute('/profile');
		}
		else {
			handleErrors(data);
		}
	}
	catch (error) {
		console.error('Error during connection to server:', error);
	}
}



export {sendFriendRequest, removeFriendRequest, acceptFriendRequest, denyFriendRequest, removeFriend, block_user, unblock_user };