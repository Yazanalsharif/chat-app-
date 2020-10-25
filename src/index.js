const path = require('path');
const http = require('http');
const {addUser, removeUser, getUsersInRoom, getUser} = require('./utils/users');
const express = require('express');
const {sendMessage} = require('./utils/messages');
const Filter = require('bad-words');



const app = express();
const server = http.createServer(app);
//start socket to make full-duplix commincation 
const io = require('socket.io')(server);



//get port from env variable
const port = process.env.PORT;

//create the path from index.js file
const pathFolderPublic = path.join(__dirname, '../public');

//serve public folder by using express.static(path);
app.use(express.static(pathFolderPublic));
// Create a full-duplix communication by web socket
io.on('connection', (socket) => {
    
    //socket.broadcast.emit('connectUser', sendMessage('the user is connecting now'));


    socket.on('join', ({username, room}, callback) => {
        const  {error, user} = addUser({id:socket.id, userName:username, room});
        socket.join(room);
        if(error) {
            return callback(error);
        }
        socket.emit('sendFromServer', sendMessage('Welcome mr ' + user.userName +' in our Chat'));
        socket.broadcast.to(user.room).emit('sendFromServer', sendMessage(user.userName + ' is Connecting now '));
        console.log(user);
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback();
    })
  
    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        if(filter.isProfane(msg)) {
            return callback('Not Delivered becouse the message has bad word')
        }

        io.to(user.room).emit('sendToAll', {msg:sendMessage(msg), userName : user.userName});
        callback()
    })

    socket.on('shareLocation', (latlon, callback) => {
        const user = getUser(socket.id);

        const location = `https://google.com/maps?q=${latlon.lat},${latlon.long}`
        io.to(user.room).emit('sendLocation', sendMessage(location), user);
        callback();
        
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user) {
            io.to(user.room).emit('sendFromServer', sendMessage(`${user.userName} has left`));
            
            io.to(user.room).emit('roomData', {
                room:user.room,
                users:getUsersInRoom(user.room),
            })
        }
    })
})
//start the server listening on port 3000
server.listen(port, () => {
    console.log('the server listen on port', port);
})
