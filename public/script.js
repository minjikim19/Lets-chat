$(function () {
  var socket = io();
  $("form").submit(function (e) {
    e.preventDefault(); // prevents page reloading
    socket.emit("chat message", $("#m").val());
    $("#m").val("");
    return false;
  });
  socket.on("connection message", function (msg) {
    const _msg = '<li class="conmsg"><h3><u><b>' + msg + "</b></u></h3></li>";
    $("#messages").append(_msg);
    manageScroll();
  });
  socket.on("chat message", function (username, msg, time) {
    isCommand(msg);
    const _msg =
      '<li class="chatmsg"><p>' +
      username +
      "</p><span> [" +
      time +
      "] </span><span><b>" +
      mapEmoji(msg) +
      "</b></span></li>";
    $("#messages").append(_msg);
    manageScroll();
  });
});
const out = document.getElementById("msg");

function isCommand(msg) {
  
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
  console.log("scrolltop is: " + out.scrollTop);
  console.log("clientheight is: " + out.clientHeight);
  console.log("scrollheight is: " + out.scrollHeight);
  // scroll to bottom if isScrolledToBottom is true
  if (!isScrolledToBottom) {
    out.scrollTop = out.scrollHeight + out.scrollTop;
    console.log("new scrolltop is: " + out.scrollTop);
  }
}

function openUser() {
  console.log(document.getElementById("userdown"));
  var element = document.getElementById("userdown");
  element.classList.toggle("show");
  console.log(document.getElementById("userdown"));
}

window.onclick = function (event) {
  //   if (!event.target.matches(".userholderdrop")) {
  //     var element = document.getElementById("userdown");
  //     if (element.classList.contains("show")) {
  //       element.classList.remove("show");
  //     }
  //     console.log(document.getElementById("userdown"));
  //   }
  //   if (event.target.matches(".dropbtn")) {
  //     var element = document.getElementById("userdown");
  //     element.classList.add("show");
  //     console.log("added it");
  //   }
};
