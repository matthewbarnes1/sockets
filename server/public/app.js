let chatPartnerId = null;

const socket = io("https://lionfish-app-tx9bi.ondigitalocean.app/", {
    secure: true,
    transports: ["websocket", "polling"]
});

document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message');
    const sendButton = document.getElementById('sendButton');

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        const message = messageInput.value.trim();
        if (chatPartnerId && message) {
            sendPrivateMessage(chatPartnerId, message);
            displayMessage('You', message);
            messageInput.value = '';
        }
    });

    socket.on('chat_partner', (partnerId) => {
        chatPartnerId = partnerId;
        console.log(`Connected to chat partner with ID: ${partnerId}`);
        const statusMessage = chatPartnerId ? `Connected to Stranger` : 'Waiting for a chat partner...';
        updateStatus(statusMessage);
    });

    socket.on('private_message', (senderId, message) => {
        displayMessage('Stranger', message);
    });

    socket.on('partner_disconnected', (disconnectedUserId) => {
        if (disconnectedUserId === chatPartnerId) {
            updateStatus('Your chat partner has disconnected. Waiting for a new chat partner...');
            chatPartnerId = null;
        }
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
