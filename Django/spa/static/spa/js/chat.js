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
    const chatSocket = new WebSocket(
        'wss://' + window.location.host + '/ws/chat/' + generateRoomName(current_username, username_to_chat) + '/'
    );

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        document.querySelector('#chat-body').innerHTML += (
            '<tr>' +
                '<td><p class="message ' + (data.sender === current_username ? 'sent' : 'received') + '">' + data.message + '</p></td>' +
                '<td><p class="timestamp">' + data.timestamp + '</p></td>' +
            '</tr>'
        );
    };

    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };

    document.querySelector('#chat-message-submit').onclick = function(e) {
        const messageInputDom = document.querySelector('#message_input');
        const message = messageInputDom.value;
        chatSocket.send(JSON.stringify({
            'message': message
        }));
        messageInputDom.value = '';
    };

}

export { initChat };