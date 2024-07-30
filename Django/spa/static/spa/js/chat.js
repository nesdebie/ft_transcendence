

function initChat() {

    const chatDataElement = document.getElementById('chat-data');
    const currentUser = chatDataElement.getAttribute('data-current-user');
    const user_to_chat = chatDataElement.getAttribute('data-user_to_chat');

    const chatSocket = new WebSocket(
        'ws://' + window.location.host + '/ws/chat/' + currentUser + '/' + user_to_chat + '/'
    );

    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        document.querySelector('#chat-body').innerHTML += (
            '<tr>' +
                '<td><p class="message ' + (data.sender === currentUser ? 'sent' : 'received') + '">' + data.message + '</p></td>' +
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