// create a simple express server
const express = require("express");
const app = express();
const http = require("http");
const cores = require("cors");
const { Server } = require("socket.io");
app.use(cores());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET, POST, PUT, DELETE, PATCH, OPTIONS"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", ({ room, id, user }) => {
    socket.join(room);

    // socket.to(room).emit("message", { name:'Majid', msg: 'joined' });
    io.to(room).emit("message", { user: user, msg: "joined" });
  });

  socket.on("message", ({ user, msg, room }) => {
    socket.to(room).emit("message", { user, msg, room });
  });

  socket.on("disconnect", () => {
    console.log(socket.id);
  });

  /*   socket.on("update item", (arg1, arg2, callback) => {
    console.log(arg1); // 1
    console.log(arg2); // { name: "updated" }
    callback({
      status: "ok",
    });
  }); */
});

server.listen(3001, () => {
  console.log("server is running on port 3001");
});
