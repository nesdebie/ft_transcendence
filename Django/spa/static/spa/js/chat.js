import { redirectToRoute } from "./router.js";

function generateRoomName(user1, user2) {
    // Sort the usernames alphabetically
    const sortedUsers = [user1, user2].sort();
    // Join the sorted usernames with an underscore
    return `chat_${sortedUsers[0]}_${sortedUsers[1]}`;
  }

function initChat() {
    const chatDataElement = document.getElementById('chat-data');
    const current_username = chatDataElement.getAttribute('data-current-username');
    const username_to_chat = chatDataElement.getAttribute('data-username_to_chat');
    if (username_to_chat == null) {
        console.log('username_to_chat = null')
        return;
    }
    const roomName = generateRoomName(current_username, username_to_chat);
    console.log(`Attempting to connect to room: ${roomName}`);
    const chatSocket = new WebSocket(
        'wss://' + window.location.host + '/ws/chat/' + roomName + '/'
    );

    chatSocket.onopen = function(e) {
        console.log('WebSocket connection established');
    };

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        if (data.type === 'game_invite') {
            handleGameInvite(data);
        } else if (data.type === 'game_invite_accepted') {
            handleGameInviteAccepted(data);
        } else {
            appendMessage(data, current_username);
        }
    };

    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };

    function sendMessage() {
        const messageInputDom = document.querySelector('#message_input');
        const message = messageInputDom.value.trim();
        if (message !== '') {
            chatSocket.send(JSON.stringify({
                'message': message,
                'sender': current_username,
                'receiver': username_to_chat
            }));
            messageInputDom.value = '';
        }
    }

    function sendGameInvite() {
        chatSocket.send(JSON.stringify({
            'type': 'game_invite',
            'sender': current_username,
            'receiver': username_to_chat
        }));
    }

    function handleGameInvite(data) {
        const inviteMessage = `You have invited ${data.receiver} to play Shifumi.`;
        appendMessage({ message: inviteMessage, sender: current_username }, current_username);
        
        if (data.sender !== current_username) {
            const acceptButton = `<button class="accept-invite" data-sender="${data.sender}">Accept</button>`;
            const receivedInviteMessage = `${data.sender} has invited you to play Shifumi. ${acceptButton}`;
            appendMessage({ message: receivedInviteMessage, sender: 'System' }, current_username);
            
            // Add event listener to the accept button
            document.querySelector('.accept-invite').addEventListener('click', function() {
                const sender = this.getAttribute('data-sender');
                chatSocket.send(JSON.stringify({
                    'type': 'game_invite_accepted',
                    'sender': current_username,
                    'receiver': sender
                }));
            });
        }
    }

    function handleGameInviteAccepted(data) {
        const gameRoomName = generateGameRoomName(data.sender, data.receiver);
        redirectToRoute(`/shifumi/${gameRoomName}`);
    }

    function generateGameRoomName(user1, user2) {
        return [user1, user2].sort().join('_');
    }

    // Event listeners
    document.querySelector('#send-message').addEventListener('click', sendMessage);
    document.querySelector('#send-game-invite').addEventListener('click', sendGameInvite);
    document.querySelector('#message_input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission
            sendMessage();
        }
    });
}

function appendMessage(data, current_username) {
    const localTime = moment.utc(data.timestamp).local().format('YYYY-MM-DD HH:mm');
    document.querySelector('#chat-body').innerHTML += (
        '<tr>' +
            `<td class="${data.sender === current_username ? 'sent-message' : 'received-message'}">` +
                `<p class="message">${data.message}</p>` +
                `<p class="timestamp">${localTime}</p>` +
            '</td>' +
        '</tr>'
    );
}

export { initChat };