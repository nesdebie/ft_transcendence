import { redirectToRoute } from "./router.js";
import { setWebSocket, getWebSocket, closeWebSocket } from "./websocketManager.js";

export function initChat() {
    const chatDataElement = document.getElementById('chat-data');
    const current_username = chatDataElement.getAttribute('data-current-username');
    const username_to_chat = chatDataElement.getAttribute('data-username_to_chat');
    const is_blocked = chatDataElement.getAttribute('data-is-blocked') === 'true';  // Assume this data attribute is set based on backend logic

    if (username_to_chat == null || is_blocked) {
        console.log('Cannot initiate chat due to block or missing username');
        return;
    }

    const roomName = generateRoomName(current_username, username_to_chat);
    console.log(`Attempting to connect to room: ${roomName}`);

    function connectWebSocket() {
        const websocket = new WebSocket(
            'wss://' + window.location.host + '/ws/chat/' + roomName + '/'
        );

        websocket.onopen = function(e) {
            console.log('WebSocket connection established');
            setWebSocket(websocket);
            addAcceptButtonListeners();
        };

        websocket.onmessage = function(e) {
            const data = JSON.parse(e.data);
            console.log("Received message with data:", data);  // Log the entire data object
            if (data.type === 'game_invite') {
                console.log("Handling game invite with game type:", data.game_type);  // Detailed log for game type
                handleGameInvite(data);
            } else if (data.type === 'game_invite_accepted') {
                handleGameInviteAccepted(data);
            } else {
                appendMessage(data, current_username);
            }
        };

        websocket.onclose = function(e) {
            console.log('Chat socket closed');
        };
    }

    function sendMessage() {
        const messageInputDom = document.querySelector('#message_input');
        const message = messageInputDom.value.trim();
        if (message !== '' && getWebSocket() && getWebSocket().readyState === WebSocket.OPEN) {
            getWebSocket().send(JSON.stringify({
                'message': message,
                'sender': current_username,
                'receiver': username_to_chat
            }));
            messageInputDom.value = '';
        }
    }

    function sendGameInvite(gameType) {
        console.log("Sending game invite for:", gameType);  // This will show which game type is being sent
        if (getWebSocket() && getWebSocket().readyState === WebSocket.OPEN) {
            getWebSocket().send(JSON.stringify({
                'type': 'game_invite',
                'sender': current_username,
                'receiver': username_to_chat,
                'game_type': gameType
            }));
        }
    }

    function handleGameInvite(data) {
        const gameTypeMessage = data.game_type === 'shifumi' ? 'Shifumi' : 'Pong';
        console.log("Handle game invite for:", gameTypeMessage);
        if (data.sender === current_username) {
            const inviteMessage = `You have invited ${data.receiver} to play ${gameTypeMessage}.`;
            appendMessage({ message: inviteMessage, sender: current_username }, current_username);
        } else {
            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Accept';
            acceptButton.className = 'accept-invite';
            acceptButton.setAttribute('data-sender', data.sender);
            acceptButton.setAttribute('data-game-type', data.game_type);  // Store game type in button

            const receivedInviteMessage = `${data.sender} has invited you to play ${gameTypeMessage}. `;
            appendMessage({ 
                message: receivedInviteMessage, 
                sender: 'System',
                button: acceptButton
            }, current_username);
            addAcceptButtonListeners();
        }
    }

    function handleGameInviteAccepted(data) {
        console.log('Game invite accepted:', data);
        const gameRoomName = generateGameRoomName(data.sender, data.receiver);
        const route = data.game_type === 'shifumi' ? `/shifumi/${gameRoomName}` : `/pong/${gameRoomName}`;
        console.log('Redirecting to game room:', route);
        redirectToRoute(route);
    }

    function addAcceptButtonListeners() {
        document.querySelectorAll('.accept-invite').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const sender = this.getAttribute('data-sender');
                const gameType = this.getAttribute('data-game-type');  // Retrieve game type
                if (getWebSocket() && getWebSocket().readyState === WebSocket.OPEN) {
                    getWebSocket().send(JSON.stringify({
                        'type': 'game_invite_accepted',
                        'sender': current_username,
                        'receiver': sender,
                        'game_type': gameType  // Include game type in the message
                    }));
                } else {
                    console.error('WebSocket is not open');
                    connectWebSocket();
                }
            });
        });
    }

    // Event listeners
    const sendMessageButton = document.querySelector('#send-message');
    if (sendMessageButton) {
        sendMessageButton.addEventListener('click', sendMessage);
    } else {
        console.error('Send message button not found');
    }

    const sendGameInviteButton = document.querySelector('#send-shifumi-game-invite');
    if (sendGameInviteButton) {
        sendGameInviteButton.addEventListener('click', () => sendGameInvite('shifumi'));
    }

    const sendPongGameInviteButton = document.querySelector('#send-pong-game-invite');
    if (sendPongGameInviteButton) {
        sendPongGameInviteButton.addEventListener('click', () => sendGameInvite('pong'));
    }

    const messageInput = document.querySelector('#message_input');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
    } else {
        console.error('Message input not found');
    }

    // Initialize the WebSocket connection
    connectWebSocket();
}

function generateRoomName(user1, user2) {
    return `chat_${[user1, user2].sort().join('_')}`;
}

function generateGameRoomName(user1, user2) {
    return [user1, user2].sort().join('_');
}

function appendMessage(data, current_username) {
    const localTime = moment.utc(data.timestamp).local().format('YYYY-MM-DD HH:mm');
    const messageElement = document.createElement('tr');
    messageElement.innerHTML = `
        <td class="${data.sender === current_username ? 'sent-message' : 'received-message'}">
            <p class="message" style="color: black;">${data.message}</p>
            <p class="timestamp">${localTime}</p>
        </td>
    `;
    
    if (data.button) {
        messageElement.querySelector('.message').appendChild(data.button);
    }
    
    document.querySelector('#chat-body').appendChild(messageElement);
    
    // Scroll to the bottom of the message area when a new message is appended
    const messageArea = document.getElementById('message-area');
    messageArea.scrollTop = messageArea.scrollHeight; // Ensure new messages are visible
}

function find_user_on_click(username) {
    redirectToRoute('/profile/' + username);
}

window.find_user_on_click = find_user_on_click;  // Make it accessible globally if necessary