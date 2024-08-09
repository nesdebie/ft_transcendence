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
        appendMessage(data, current_username);
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

    document.querySelector('#chat-message-submit').onclick = sendMessage;

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