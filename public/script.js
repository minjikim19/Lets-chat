$(function () {
  var socket = io();
  $("form").submit(function (e) {
    e.preventDefault(); // prevents page reloading
    socket.emit("chat message", $("#m").val());
    $("#m").val("");
    return false;
  });

  socket.on("connected message", function (username) {
    const _msg =
      '<li class="conmsg"><h3><u><b>' +
      "Hi, " +
      username +
      "</b></u></h3></li>";
    $("#messages").append(_msg);
    manageScroll();
  });

  socket.on("disconnected message", function (username) {
    const _msg =
      '<li class="conmsg"><h3><u><b>' +
      "Bye, " +
      username +
      "</b></u></h3></li>";
    $("#messages").append(_msg);
    manageScroll();
  });

  socket.on("chat message", function (msg) {
    $("#messages").append(msg);
    manageScroll();
  });

  socket.on("update user name", function (oldUsername, newUsername) {
    var allNames = document.getElementsByClassName(oldUsername);
    while (allNames.length) {
      allNames[0].innerHTML = allNames[0].innerHTML.replace(
        oldUsername,
        newUsername
      );
      allNames[0].classList.add(newUsername);
      allNames[0].classList.remove(oldUsername);
    }
    // Update css style
    document.head.innerHTML = document.head.innerHTML.replace(
      oldUsername,
      newUsername
    );
  });

  socket.on("update user list", function (userList) {
    $("#users").empty();
    userList.forEach((user) => {
      const _user =
        '<li class="' +
        user.name +
        '" id="' +
        user.name +
        '"><p>' +
        user.name +
        "</p></li>";
      var style = document.createElement("style");
      style.class;
      style.innerHTML = "." + user.name + " { color: " + user.color + "; }";
      document.head.appendChild(style);
      $("#users").append(_user);
    });
  });

  socket.on("update color", function (user) {
    var style = document.createElement("style");
    style.class;
    style.innerHTML = "." + user.name + " { color: " + user.color + "; }";
    document.head.appendChild(style);
  });
});

const out = document.getElementById("msg");

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
