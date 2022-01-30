// create a simple express server
const express = require("express");
const app = express();
const http = require("http");
const cores = require("cors");
const { Server } = require("socket.io");
app.use(cores());

const server = http.createServer(app);
const io = new Server(server, {
  cores: {
    origins: "*:*",
    methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("server is running on port 3001");
});
