import { redirectToRoute } from "./router.js";
import { setWebSocket, getWebSocket, closeWebSocket } from "./websocketManager.js";

export function initChat() {
    const chatDataElement = document.getElementById('chat-data');
    const current_username = chatDataElement.getAttribute('data-current-username');
    const username_to_chat = chatDataElement.getAttribute('data-username_to_chat');

    if (username_to_chat == null) {
        console.log('username_to_chat = null');
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
            if (data.type === 'game_invite') {
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

    function sendGameInvite() {
        if (getWebSocket() && getWebSocket().readyState === WebSocket.OPEN) {
            getWebSocket().send(JSON.stringify({
                'type': 'game_invite',
                'sender': current_username,
                'receiver': username_to_chat
            }));
        }
    }

    function handleGameInvite(data) {
        if (data.sender === current_username) {
            const inviteMessage = `You have invited ${data.receiver} to play Shifumi.`;
            appendMessage({ message: inviteMessage, sender: current_username }, current_username);
        } else {
            const acceptButton = document.createElement('button');
            acceptButton.textContent = 'Accept';
            acceptButton.className = 'accept-invite';
            acceptButton.setAttribute('data-sender', data.sender);

            const receivedInviteMessage = `${data.sender} has invited you to play Shifumi. `;
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
        console.log('Redirecting to game room:', gameRoomName);
        redirectToRoute(`/shifumi/${gameRoomName}`);
    }

    function addAcceptButtonListeners() {
        document.querySelectorAll('.accept-invite').forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                console.log('Accept button clicked');
                const sender = this.getAttribute('data-sender');
                console.log('Sender:', sender);
                if (getWebSocket() && getWebSocket().readyState === WebSocket.OPEN) {
                    console.log('Sending game invite accepted message');
                    getWebSocket().send(JSON.stringify({
                        'type': 'game_invite_accepted',
                        'sender': current_username,
                        'receiver': sender
                    }));
                } else {
                    console.error('WebSocket is not open');
                    connectWebSocket();
                }
            });
        });
    }

    // Event listeners
    document.querySelector('#send-message').addEventListener('click', sendMessage);
    document.querySelector('#send-game-invite').addEventListener('click', sendGameInvite);
    document.querySelector('#message_input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

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
            <p class="message">${data.message}</p>
            <p class="timestamp">${localTime}</p>
        </td>
    `;
    
    if (data.button) {
        messageElement.querySelector('.message').appendChild(data.button);
    }
    
    document.querySelector('#chat-body').appendChild(messageElement);
}