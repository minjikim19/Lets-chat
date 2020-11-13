var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var cookieParser = require("cookie-parser");
var userId;

app.use(cookieParser());

app.use(function (req, res, next) {
  var cookie = req.cookies.cookieName;
  if (cookie === undefined) {
    var randomNumber = Math.random().toString();
    randomNumber = randomNumber.substring(2, randomNumber.length);
    res.cookie("cookieName", randomNumber, { maxAge: 900000, httpOnly: true });
    console.log("cookie created successfully");
    userId = randomNumber;
  } else {
    console.log("cookie exists", cookie);
    userId = cookie;
  }
  next();
});

app.use(express.static("public"));

class User {
  constructor(socketId, userId, isConnected, name, color) {
    this.socketId = socketId;
    this.userId = userId;
    this.isConnected = isConnected;
    this.name = name;
    this.color = color;
  }
}

var userList = [];
var chatlog = [];

io.on("connection", (socket) => {
  // Find user in local storage
  // Else, create random username and add it to local storage
  var found = false;
  var index;
  console.log("before userlist: ", userList);
  console.log(chatlog);
  for (var i = 0; i < userList.length; i++) {
    if (userList[i].userId === userId) {
      console.log(userList[i]);
      found = true;
      index = i;
      break;
    }
  }

  if (found) {
    var username = userList[index].name;
    var color = userList[index].color;
    var user = new User(socket.id, userId, true, username, color);
    userList[index] = user;
  } else {
    var username = "user" + Math.floor(Math.random() * 10000000);
    while (userExists(username)) {
      username = "user" + Math.floor(Math.random() * 10000000);
    }
    var color = "#000000";
    var user = new User(socket.id, userId, true, username, color);
    userList.push(user);
  }

  console.log(user.name + " connected");
  io.to(socket.id).emit("update chatlog", chatlog);
  io.to(socket.id).emit("update chat msg", user);
  var welcome =
    '<li class="conmsg ' + user.userId + '"><h3><u><b>' + "Hi, " + user.name + "</b></u></h3></li>";
  chatlog = manageLogSize(chatlog);
  chatlog.push(welcome);

  io.emit("connected message", welcome);
  for (const socketID in io.sockets.sockets) {
    io.emit("update color", user);
    io.to(socketID).emit("update user list", userList, socketID);
  }
  socket.on("disconnect", () => {
    console.log(user.name + " disconnected");
    const _msg =
      '<li class="conmsg ' + user.userId + '"><h3><u><b>' +
      "Bye, " +
      user.name +
      "</b></u></h3></li>";
    chatlog = manageLogSize(chatlog);
    chatlog.push(_msg);
    io.emit("connected message", _msg);
    console.log(
      "User: " + userList.findIndex((element) => element.socketId === socket.id)
    );
    console.log(
      userList[userList.findIndex((element) => element.socketId === socket.id)]
        .isConnected
    );
    userList[userList.findIndex(element => element.socketId === socket.id)].isConnected = false;
    for (const socketID in io.sockets.sockets) {
      io.to(socketID).emit("update user list", userList, socketID);
    }
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
          "] </span><span>" +
          mapEmoji(msg) +
          "</span></li>";
        chatlog = manageLogSize(chatlog);
        chatlog.push(_msg);
        console.log(chatlog);
        io.emit("chat message", _msg);
        for (const socketID in io.sockets.sockets) {
          io.to(socketID).emit(
            "update chat msg",
            userList.find((element) => element.socketId === socketID)
          );
        }
      }
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
    userList.forEach((x) => {
      if (x.name === oldUsername) {
        x.name = newUsername;
      }
    });
    chatlog.forEach((x, i) => {
      // find oldUsername => update it to newUsername
      chatlog[i] = x.split(oldUsername).join(newUsername);
    });
    console.log("updated chatlog is: ", chatlog);
    user.name = newUsername;
    console.log("changed name: ", userList);
    // userList.splice(userList.indexOf(oldUsername), 1, newUsername);
    io.emit("update user name", oldUsername, newUsername, user.userId);
    io.emit("update color", user);
  }

  function changeColor(col) {
    userList.forEach((x) => {
      if (x.name === user.name) {
        x.color = "#" + col;
      }
    });
    user.color = "#" + col;
    console.log("changed color: ", userList);
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
