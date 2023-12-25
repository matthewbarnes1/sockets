let chatPartnerId = null;

const socket = io("https://shark-app-5msr4.ondigitalocean.app/", {
  transports: [ "websocket", "polling"] 
});

document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('sendButton');

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (chatPartnerId && message) {
            sendPrivateMessage(chatPartnerId, message);
            displayMessage('You', message); // Display your own message
            messageInput.value = '';
        }
    });

    socket.on('chat_partner', (partnerId) => {
        chatPartnerId = partnerId;
        const statusMessage = chatPartnerId ? `Connected to Stranger` : 'Waiting for a chat partner...';
        updateStatus(statusMessage);
    });

    socket.on('private_message', (senderId, message) => {
        displayMessage('Stranger', message); // Display received message
    });
});

function sendPrivateMessage(recipientId, message) {
    socket.emit('private_message', recipientId, message);
}

function displayMessage(sender, message) {
    const messagesList = document.getElementById('messages');
    const messageElement = document.createElement('li');
    messageElement.textContent = `${sender}: ${message}`;
    messagesList.appendChild(messageElement);
}

function updateStatus(message) {
    const statusElement = document.getElementById('status');
    statusElement.textContent = message;
}
