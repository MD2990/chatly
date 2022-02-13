const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);
const PORT = process.env.PORT;

const io = new Server(server, {
  cors: {
    origin: "https://chatly-three.vercel.app/",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
    maxAge: 3600,
    preflightContinue: false,
    optionsSuccessStatus: 204,
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
  socket.on("stoppedTyping", (data) => {
    socket.to(data.room).emit("stoppedTyping", data);
  });
  socket.on("exit", (room) => {
    socket.leave(room);
    socket.disconnect();
  });
  socket.on("typing", ({ username, room }) => {
    io.to(room).emit("typing", { user: username });
  });
  socket.on("online", (data) => {
    const countUsers = users.filter((user) => user.room === data.room);

    io.to(data.room).emit("online", {
      users: countUsers,
    });
  });

  socket.on("disconnect", () => {
    const loggedOutUser = users.find((user) => user.id === socket.id);
    users = users.filter((user) => user.id !== socket.id);
    /* 
    room?.room &&
      socket.to(room.room).emit("online", { users: users.length - 1, username: users.user }); */
    loggedOutUser?.room &&
      socket.to(loggedOutUser.room).emit("logout", loggedOutUser);
    console.log("User Disconnected", socket.id);
  });
});
app.get("/", (req, res) => {
  res.send("Chatly Server ...");
});
server.listen(PORT, () => {
  console.log("SERVER RUNNING");
});
