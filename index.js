const express = require("express");
const app = express();
const http = require("http");
const { IPv4 } = require("ipaddr.js");
const { includes } = require("lodash");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { location } = require("url-parse");
const io = new Server(server);

app.use("/static", express.static("./static/"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

var globalUserList = [];
io.on("connection", (socket) => {

  socket.on("log out", function (uname) {
    io.emit("log out", uname);
  });

  socket.on("chat message", function (msg) {
    io.emit("chat message", msg);
  });

  socket.on("register username", function (username) {
    io.emit("register username", username);
  });
});

server.listen(process.env.PORT || 5500, () => {
  console.log("listening on 5500");
});

