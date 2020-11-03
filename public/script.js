$(function () {
  var socket = io();
  $("form").submit(function (e) {
    e.preventDefault(); // prevents page reloading
    socket.emit("chat message", $("#m").val());
    $("#m").val("");
    manageScroll();
    return false;
  });
  socket.on("chat message", function (msg) {
    $("#messages").append($("<li>").text(msg));
  });
});

const out = document.getElementById("msg");

function manageScroll() {
  console.log(out);
  const isScrolledToBottom =
    out.scrollHeight - out.scrollTop <= out.clientHeight;
  console.log(isScrolledToBottom);
  console.log("scrolltop is: " + out.scrollTop);
  console.log("clientheight is: " + out.clientHeight);
  console.log("scrollheight is: " + out.scrollHeight);
  // scroll to bottom if isScrolledToBottom is true
  if (isScrolledToBottom) {
    out.scrollTop = out.scrollHeight - out.clientHeight;
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
