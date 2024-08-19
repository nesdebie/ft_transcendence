let currentWebSocket = null;

function setWebSocket(socket) {
    currentWebSocket = socket;
}

function getWebSocket() {
    return currentWebSocket;
}

function closeWebSocket() {
    if (currentWebSocket) {
        currentWebSocket.close();
        currentWebSocket = null;
    }
}

export { setWebSocket, getWebSocket, closeWebSocket };