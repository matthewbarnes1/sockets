import { Server } from 'socket.io';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3500;
const app = express();
const expressServer = app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
app.use(express.static(path.join(__dirname, "public")));

const io = new Server(expressServer, {
    cors: {
        origin: '*',
    }
});

let connectedUsers = [];

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`);
    connectedUsers.push(socket);

    // Pair the user immediately if possible
    pairUsers();

    socket.on('private_message', (recipientId, message) => {
        socket.to(recipientId).emit('private_message', socket.id, message);
    });

    socket.on('disconnect', () => {
        // Notify the chat partner about the disconnection
        notifyPartnerOfDisconnection(socket.id);

        // Remove the disconnected user from connectedUsers
        connectedUsers = connectedUsers.filter(user => user.id !== socket.id);
        console.log(`User ${socket.id} disconnected`);

        // Try to pair remaining users again
        pairUsers();
    });
});

function pairUsers() {
    while (connectedUsers.length >= 2) {
        const user1 = connectedUsers.pop();
        const user2 = connectedUsers.pop();

        user1.emit('chat_partner', user2.id);
        user2.emit('chat_partner', user1.id);
    }
}

function notifyPartnerOfDisconnection(disconnectedUserId) {
    connectedUsers.forEach(user => {
        user.emit('partner_disconnected', disconnectedUserId);
    });
}
