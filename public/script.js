$(function () {
  var socket = io();
  $("form").submit(function (e) {
    e.preventDefault(); // prevents page reloading
    socket.emit("chat message", $("#m").val());
    $("#m").val("");
    return false;
  });

  socket.on("connected message", function (msg) {
    $("#messages").append(msg);
    manageScroll();
  });

  socket.on("chat message", function (msg) {
    $("#messages").append(msg);
    manageScroll();
  });

  socket.on("update user name", function (oldUsername, newUsername, userId) {
    var allNames = document.getElementsByClassName(oldUsername);
    var titleNames = document.getElementsByClassName(userId);
    console.log(titleNames);
    while (allNames.length) {
      allNames[0].innerHTML = allNames[0].innerHTML.replace(
        oldUsername,
        newUsername
      );
      allNames[0].classList.add(newUsername);
      allNames[0].classList.remove(oldUsername);
    }
    for (var i = 0; i < titleNames.length; i++) {
      console.log(titleNames[i].innerHTML.search(oldUsername));
      titleNames[i].innerHTML = titleNames[i].innerHTML.replace(
        oldUsername,
        newUsername
      );
    }
    // Update css style
    document.head.innerHTML = document.head.innerHTML.replace(
      oldUsername,
      newUsername
    );
  });

  socket.on("update user list", function (userList, socketID) {
    $("#users").empty();
    $("#userdrop").empty();
    // Add all users to list
    userList.forEach((user) => {
      if (user.isConnected) {
        var style = document.createElement("style");
        style.class;
        style.innerHTML = "." + user.name + " { color: " + user.color + "; }";
        document.head.appendChild(style);
        if (user.socketId === socketID) {
          const me =
            '<li class="' +
            user.name +
            " current" +
            '"><p>' +
            user.name +
            "</p></li>";
          $("#users").append(me);
          $("#userdrop").append(me);
        } else {
          const me =
            '<li class="' + user.name + '"><p>' + user.name + "</p></li>";
          $("#users").append(me);
          $("#userdrop").append(me);
        }
      }

      // Add style for each user
      var style = document.createElement("style");
      style.class;
      style.innerHTML = ".current" + " { background-color: " + "#f39797; }";
      document.head.appendChild(style);
    });

    // Add current user style
    var style = document.createElement("style");
    style.class;
    style.innerHTML = ".current" + " { background-color: " + "#f39797; }";
    document.head.appendChild(style);
  });

  socket.on("update color", function (user) {
    var style = document.createElement("style");
    style.class;
    style.innerHTML = "." + user.name + " { color: " + user.color + "; }";
    document.head.appendChild(style);
  });

  socket.on("update chatlog", function (log) {
    log.forEach((x) => $("#messages").append(x));
    manageScroll();
  });

  socket.on("update chat msg", function (user) {
    var elements = document.getElementsByClassName("chatmsg " + user.name);
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.add("currentmsg");
    }
    // Add current user style
    var style = document.createElement("style");
    style.class;
    style.innerHTML = ".currentmsg" + " { font-weight: " + "bold; }";
    document.head.appendChild(style);
  });
});

const out = document.getElementById("msg");

function manageScroll() {
  const isScrolledToBottom =
    out.scrollHeight - out.scrollTop <= out.clientHeight;
  // scroll to bottom if isScrolledToBottom is true
  if (!isScrolledToBottom) {
    out.scrollTop = out.scrollHeight + out.scrollTop;
  }
}

function openUser() {
  var element = document.getElementById("userdown");
  element.classList.toggle("show");
}
