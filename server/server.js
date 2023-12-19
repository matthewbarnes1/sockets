const socket = require('socket.io')(3000);

socket.on('connection', (socket) => {
    console.log(socket.id);
    });

