$(function () {
  var socket = io();
  $("form").submit(function (e) {
    e.preventDefault(); // prevents page reloading
    socket.emit("chat message", $("#m").val());
    $("#m").val("");
    return false;
  });
  socket.on("connected message", function (msg, username) {
    const _msg = '<li class="conmsg"><h3><u><b>' + msg + "</b></u></h3></li>";
    const _user = '<li id="' + username + '"><p>' + username + "</p></li>";
    $("#messages").append(_msg);
    $("#users").append(_user);
    store(username);
    manageScroll();
  });
  socket.on("disconnected message", function (msg, username) {
    const _msg = '<li class="conmsg"><h3><u><b>' + msg + "</b></u></h3></li>";
    $("#messages").append(_msg);
    $("#" + username).empty();
    store(username);
    manageScroll();
  });
  socket.on("chat message", function (username, msg, time) {
    var command = isCommand(msg, username);
    if (command === "help") {
      const _msg =
        '<li class = "cmdmsg"><p>To change your color, type "/color RRGGBB".</p><p>To change your name, type "/name newname".</p></li>';
      $("#messages").append(_msg);
    } else if (command === "color") {
      const _msg = '<li class = "cmdmsg"><p>Changed your color!</p></li>';
      $("#messages").append(_msg);
    } else if (command === "name") {
      const _msg = '<li class = "cmdmsg"><p>Changed your username!</p></li>';
      $("#messages").append(_msg);
    } else if (command === "colerr") {
      const _msg =
        '<li class = "cmdmsg"><p>ERROR: Please type valid color hex value</p></li>';
      $("#messages").append(_msg);
    } else if (command === "err") {
      const _msg =
        '<li class = "cmdmsg"><p>ERROR: Please type valid command!</p><p>To see the available commands, type "/help"</p></li>';
      $("#messages").append(_msg);
    } else {
      const _msg =
        '<li class="chatmsg ' +
        username +
        '"><p>' +
        username +
        "</p><span> [" +
        time +
        "] </span><span><b>" +
        mapEmoji(msg) +
        "</b></span></li>";
      $("#messages").append(_msg);
    }
    store(username);
    manageScroll();
  });
});
const out = document.getElementById("msg");

function isHex(str) {
  return /^[A-F0-9]+$/i.test(str);
}

function changeColor(username, col) {
  var allNames = document.getElementsByClassName(username);
  console.log(allNames);
  for (i = 0; i < allNames.length; i++) {
    allNames[i].style.color = "#" + col;
  }
}

function changeName(username, newName) {
  // change the classname, things in html, the username itself
  // var allNames = document.getElementsByClassName(username);
  // console.log(allNames);
  // for (i = 0; i < allNames.length; i++) {
  //   allNames[i].className = newName;
  //   var str = document.innerHTML;
  //   var res = str.replace(username, newName);
  //   document.innerHTML = res;
  // }
  console.log(username);
  console.log(document.body.innerHTML);
  document.body.innerHTML = document.body.innerHTML.replace(username, newName);
  username = newName;
  console.log(username);
}

function isCommand(msg, username) {
  if (msg.startsWith("/")) {
    if (msg.startsWith("help", 1)) {
      return "help";
    } else if (msg.startsWith("color", 1)) {
      var col = msg.slice(7);
      console.log(col);
      if (col.length === 6 && isHex(col)) {
        changeColor(username, col);
        return "color";
      } else {
        return "colerr";
      }
    } else if (msg.startsWith("name", 1)) {
      var newName = msg.slice(6);
      //check if the username is unique
      changeName(username, newName);
      return "name";
    } else {
      return "err";
    }
  }
  return false;
}

const mapping = {
  ":)": "&#x1f642",
  ":(": "&#x1f641",
  ":0": "&#x1f62e",
};

function mapEmoji(msg) {
  var newMsg = msg;
  for (const [key, value] of Object.entries(mapping)) {
    if (msg.includes(key)) {
      newMsg = msg.replace(key, value);
    }
  }
  return newMsg;
}

function manageScroll() {
  console.log(out);
  const isScrolledToBottom =
    out.scrollHeight - out.scrollTop <= out.clientHeight;
  console.log(isScrolledToBottom);
  //console.log("scrolltop is: " + out.scrollTop);
  //console.log("clientheight is: " + out.clientHeight);
  //console.log("scrollheight is: " + out.scrollHeight);
  // scroll to bottom if isScrolledToBottom is true
  if (!isScrolledToBottom) {
    out.scrollTop = out.scrollHeight + out.scrollTop;
    console.log("new scrolltop is: " + out.scrollTop);
  }
}

function openUser() {
  //console.log(document.getElementById("userdown"));
  var element = document.getElementById("userdown");
  element.classList.toggle("show");
  //console.log(document.getElementById("userdown"));
}

function store(username) {
  var storage = localStorage["user"];
  if (!storage) {
    storage = username;
    localStorage["user"] = storage;
  }

  var divName = document.getElementById("user");
  divName.innerHTML = localStorage["user"];
}
