var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

class User {
  constructor(name, color) {
    this.name = name;
    this.color = color;
  }
}

var userList = [];
var chatlog = [];

io.on("connection", (socket) => {
  // Find user in local storage
  // Else, create random username and add it to local storage
  var username = "user" + Math.floor(Math.random() * 10000000);
  while (userExists(username)) {
    username = "user" + Math.floor(Math.random() * 10000000);
  }
  var color = "#000000";
  var user = new User(username, color);

  // Add user to online users list
  userList.push(user);
  console.log(socket.id);
  console.log(user.name + " connected");
  console.log(userList);
  io.to(socket.id).emit("update chatlog", chatlog);
  //io.emit("update chatlog", chatlog);

  var welcome =
    '<li class="conmsg"><h3><u><b>' + "Hi, " + user.name + "</b></u></h3></li>";
  chatlog = manageLogSize(chatlog);
  chatlog.push(welcome);
  console.log(chatlog);

  io.emit("connected message", welcome);
  io.emit("update user list", userList);

  socket.on("disconnect", () => {
    userList = userList.filter((x) => x.name != user.name);
    console.log(user.name + "disconnected");
    const _msg =
      '<li class="conmsg"><h3><u><b>' +
      "Bye, " +
      username +
      "</b></u></h3></li>";
    chatlog = manageLogSize(chatlog);
    chatlog.push(_msg);
    io.emit("connected message", _msg);
    io.emit("update user list", userList);
  });

  socket.on("chat message", (msg) => {
    if (msg.length > 0) {
      var command = isCommand(msg, user);
      var _msg = msg;
      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      if (command === "help") {
        _msg =
          '<li class = "cmdmsg"><p>To change your color, type "/color RRGGBB".</p><p>To change your name, type "/name newname".</p></li>';
        io.to(socket.id).emit("chat message", _msg);
      } else if (command === "color") {
        _msg = '<li class = "cmdmsg"><p>Changed your color!</p></li>';
        io.to(socket.id).emit("chat message", _msg);
      } else if (command === "name") {
        _msg = '<li class = "cmdmsg"><p>Changed your username!</p></li>';
        io.to(socket.id).emit("chat message", _msg);
      } else if (command === "colerr") {
        _msg =
          '<li class = "cmdmsg"><p>ERROR: Please type valid color hex value!</p></li>';
        io.to(socket.id).emit("chat message", _msg);
      } else if (command === "namerr") {
        _msg =
          '<li class = "cmdmsg"><p>ERROR: The chosen name is taken. Please try with new name!</p></li>';
        io.to(socket.id).emit("chat message", _msg);
      } else if (command === "err") {
        _msg =
          '<li class = "cmdmsg"><p>ERROR: Please type valid command!</p><p>To see the available commands, type "/help"</p></li>';
        io.to(socket.id).emit("chat message", _msg);
      } else {
        _msg =
          '<li class="chatmsg ' +
          user.name +
          '"><p>' +
          user.name +
          "</p><span> [" +
          time +
          "] </span><span><b>" +
          mapEmoji(msg) +
          "</b></span></li>";
        chatlog = manageLogSize(chatlog);
        chatlog.push(_msg);
        console.log(chatlog);
        io.emit("chat message", _msg);
      }
      //console.log(userList);
      io.emit("update user list", userList);
    }
  });

  // Functions
  const mapping = {
    ":)": "&#x1f642",
    ":(": "&#x1f641",
    ":0": "&#x1f62e",
  };

  function manageLogSize(log) {
    if (log.length > 200) {
      log.shift();
    }
    return log;
  }

  function mapEmoji(msg) {
    var newMsg = msg;
    for (const [key, value] of Object.entries(mapping)) {
      if (msg.includes(key)) {
        newMsg = msg.replace(key, value);
      }
    }
    return newMsg;
  }

  function changeName(oldUsername, newUsername) {
    user.name = newUsername;
    //console.log(userList);
    // userList.splice(userList.indexOf(oldUsername), 1, newUsername);
    io.emit("update user name", oldUsername, newUsername);
  }

  function changeColor(col) {
    user.color = "#" + col;
    //console.log(userList);
    io.emit("update color", user);
  }

  function isHex(str) {
    return /^[A-F0-9]+$/i.test(str);
  }

  function userExists(newName) {
    //console.log("im here");
    return userList.some(function (el) {
      return el.name === newName;
    });
  }

  function isCommand(msg, user) {
    if (msg.startsWith("/")) {
      if (msg.startsWith("help", 1)) {
        return "help";
      } else if (msg.startsWith("color", 1)) {
        var col = msg.slice(7);
        if (col.length === 6 && isHex(col)) {
          changeColor(col);
          return "color";
        } else {
          return "colerr";
        }
      } else if (msg.startsWith("name", 1)) {
        var newName = msg.slice(6);
        if (userExists(newName)) {
          //console.log("returned true");
          return "namerr";
        }
        //console.log("returned false");
        changeName(user.name, newName);
        return "name";
      } else {
        return "err";
      }
    }
    return false;
  }
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
