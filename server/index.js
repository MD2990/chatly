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
    users.push({ user: data.username, room: data.room, id: socket.id });

    socket.join(data.room);
    socket.to(data.room).emit("login", { user: data.username });
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });
  socket.on("getOnline", (data) => {
    const countUsers = users.filter((user) => user.room === data.room);
    const allUsers = countUsers.map((user) => user.user);

    console.log("im getonline: ", allUsers);

    io.to(data.room).emit("online", {
      users: countUsers.length - 1,
      username: allUsers,
    });
  });

  socket.on("disconnect", () => {
    const room = users.find((user) => user.id === socket.id);
    users = users.filter((user) => user.id !== socket.id);

    console.log(room?.room || "no room");

    room?.room &&
      socket.to(room.room).emit("online", { users: users.length - 1 });
    room?.room && socket.to(room.room).emit("logout", { user: room.user });
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
