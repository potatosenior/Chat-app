const path = require('path');
const http = require("http");
const express = require('express');
const socketio = require("socket.io");
const { generateLocationMessage, generateMessage } = require("./utils/messages");
const { addUser, removeUser, getUser, getUserInRoom } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const public_dir = path.join(__dirname, '../public');

app.use(express.static(public_dir));

io.on("connection", socket => {
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    if (!user) {
      return callback("Nenhum usuário com este nome!");
    }

    io.to(user.room).emit("message", generateMessage(user.username, message));
    callback("delivered");
  });

  socket.on("join", ({username, room}, callback ) => {
    const { error, user } = addUser({id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.broadcast.to(user.room).emit("message", generateMessage("", `${user.username} acabou de entrar!`));
    socket.emit("message", generateMessage("", `Bem vindo ${user.username}!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUserInRoom(user.room)
    });

    callback();
  })
  
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id);

    if (!user) {
      return callback("Nenhum usuário com este nome!");
    }

    io.to(user.room).emit("locationMessage", generateLocationMessage(user.username, `https://google.com/maps?q=${coords.lat},${coords.long}`));
    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", generateMessage("", user.username + " has left!"));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUserInRoom(user.room)
      });
    }
  });
});


server.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});