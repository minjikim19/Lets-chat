var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  // Find user in local storage
  // Else, create random username and add it to local storage
  // Add user to online users list
  var username = "user" + Math.floor(Math.random() * 10000000);
  console.log(username + " connected");
  io.emit("connected message", "Hi, " + username + "!", username);
  socket.on("disconnect", () => {
    console.log(username + "disconnected");
    io.emit("disconnected message", "Bye, " + username + "!", username);
  });

  socket.on("chat message", (msg) => {
    if (msg.length > 0) {
      const date = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      console.log("message: " + msg);
      io.emit("chat message", username, msg, date);
    }
  });
});

io.emit("some event", {
  someProperty: "some value",
  otherProperty: "other value",
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
