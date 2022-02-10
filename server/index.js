const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
let users = [];
io.on("connection", (socket) => {
  socket.on("join_room", (data) => {
    const checkUserName = users.findIndex(
      (u) => u.user.toLowerCase().trim() === data.username.toLowerCase().trim()
    );

    if (checkUserName === -1) {
      users.push({ user: data.username, room: data.room, id: socket.id });

      socket.join(data.room);
      io.to(data.room).emit("login", { user: data.username });
      //io.to(data.room).emit("u", { user: data.username });
    } else {
      socket.emit("error", { message: "Username already taken" });
    }
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });
  socket.on("exit", (room) => {
    socket.leave(room);
    socket.disconnect();
  });
  socket.on("online", (data) => {
    const countUsers = users.filter((user) => user.room === data.room);
    const allUsers = countUsers.map((user) => user.user);

    io.to(data.room).emit("online", {
      users: countUsers.length - 1,
      username: allUsers,
    });
  });

  socket.on("disconnect", () => {
    const room = users.find((user) => user.id === socket.id);
    users = users.filter((user) => user.id !== socket.id);
    /* 
    room?.room &&
      socket.to(room.room).emit("online", { users: users.length - 1, username: users.user }); */
    room?.room && socket.to(room.room).emit("logout", { user: room.user });
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
