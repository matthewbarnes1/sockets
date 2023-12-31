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

    pairUsers();

    socket.on('private_message', (recipientId, message) => {
        socket.to(recipientId).emit('private_message', socket.id, message);
    });

    socket.on('disconnect', () => {
        console.log(`User ${socket.id} disconnected`);
        if (socket.partnerId) {
            io.to(socket.partnerId).emit('partner_disconnected');
            const partnerSocket = connectedUsers.find(user => user.id === socket.partnerId);
            if (partnerSocket) {
                partnerSocket.partnerId = null; // Reset the partner's partnerId
            }
        }
        connectedUsers = connectedUsers.filter(user => user.id !== socket.id);
        pairUsers();
    });
});

function pairUsers() {
    while (connectedUsers.length >= 2) {
        const user1 = connectedUsers.pop();
        const user2 = connectedUsers.pop();

        console.log(`Pairing users ${user1.id} and ${user2.id}`);
        user1.emit('chat_partner', user2.id);
        user2.emit('chat_partner', user1.id);

        // Store each user's partner ID for easy access on disconnection
        user1.partnerId = user2.id;
        user2.partnerId = user1.id;
    }
}
