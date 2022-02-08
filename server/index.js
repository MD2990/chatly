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
  socket.on("bye", ({ room, user }) => {
    io.to(room).emit("get", { user, msg: "Left" });
    socket.leave(room);
    socket.disconnect();
  });

  socket.on("join", ({ room, user }) => {
    socket.join(room);
    io.to(room).emit("get", { user: user, msg: "joined" });
  });

  socket.on("message", (data) => {
    io.to(data.room).emit("get", data);
  });

  socket.on("disconnect", () => {
    console.log("des: ", socket.id);
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
