const express = require('express');
const cors = require('cors');
const {createChatEventHandler, notifyUser} = require('./ChatHandler');
const app = express();
app.use(cors());
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {cors: {origin: '*'}});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

let users = [];

const emitActiveUsers = () => {
    console.log("fist");
    io.to('list-active-users').emit('total-active-ueres', {totalActiveUsers: users.length, users});
    console.log("second");
}

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.join('list-active-users');
    createChatEventHandler(socket, users, io);
    
    socket.on('new user', (msg) => {
        users.push({
            ...msg,
            sid: socket.id,
           // socket: socket,
        });
        console.log("current user object" , users);
        emitActiveUsers();
    })
    socket.on('disconnect', () => {
        users = users.filter(item => item.sid != socket.id);
        console.log(`Socket ${socket.id} disconnected`);
        socket.leave("list-active-users")
        emitActiveUsers();
    });
   
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});