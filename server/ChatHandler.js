const conversation = require('./Conversation');


const createChatEventHandler = (socket, users, io) => {
    socket.on('onMessage', (payload) => {
        console.log("onMessage-----> ", payload);
        conversation.addMessage(payload);
        notifyUser(users, payload.to, payload, io);
    });
}

const notifyUser = (users, to, latestMessage, io) => {
    const foundUser = users.find((user) => user.name === to);
    if(foundUser) {
        io.to(foundUser.sid).emit('latest-message', latestMessage);
    }else {
        console.log('not found', name);
    }
}

module.exports = {
    createChatEventHandler,
    notifyUser
}