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

let waitingUser = null;

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`);

    if (waitingUser) {
        // Pair the two users
        socket.emit('chat_partner', waitingUser.id);
        io.to(waitingUser.id).emit('chat_partner', socket.id);

        // Clear the waiting user
        waitingUser = null;
    } else {
        // Wait for a partner
        waitingUser = socket;
    }

    socket.on('private_message', (recipientId, message) => {
        socket.to(recipientId).emit('private_message', socket.id, message);
    });

    socket.on('disconnect', () => {
        if (waitingUser && waitingUser.id === socket.id) {
            waitingUser = null;
        }
        console.log(`User ${socket.id} disconnected`);
    });
});