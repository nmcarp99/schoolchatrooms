var controlWindowOpen = false;
var room;
var name;
var backgroundIsRed = true;

setInterval(() => {
  document.getElementById("warning").style.backgroundColor = backgroundIsRed
    ? "black"
    : "red";

  backgroundIsRed = !backgroundIsRed;
}, 250);

function controlWindow() {
  let url = prompt(
    "What url would you like the control window to open to?\n(Leave blank for Google Classroom)"
  );

  if (url == "") {
    url = "https://classroom.google.com/h";
  } else if (!url.startsWith("http")) {
    url = "http://" + url;
  }

  controlWindowOpen = true;

  window.open(url, "Classes");
}

room = prompt("Room Code (Existing or New):");

name = prompt("Name:");

if (room == "" || room == undefined || room == null) {
  room = "General";
}

if (name == "" || name == undefined || name == null) {
  name = "Guest";
}

var socket = io();

socket.emit("room", room);

socket.emit("username", name);

window.addEventListener("blur", () => {
  document.getElementById("warning").style.display = "";
});

window.addEventListener("focus", () => {
  if (controlWindowOpen) {
    document.getElementById("warning").style.display = "block";
  }
});

window.addEventListener("message", event => {
  document.getElementById("messageLine").focus();

  document.activeElement.value = document.activeElement.value.substr(
    0,
    document.activeElement.value.length - 1
  );

  if (event.data.startsWith("Key")) {
    console.log(event.data.substr(3, 1).toLowerCase());
    document.activeElement.value =
      document.activeElement.value + event.data.substr(3, 1).toLowerCase();
  } else if (event.data.startsWith("Digit")) {
    document.activeElement.value =
      document.activeElement.value + event.data.substr(5, 1).toLowerCase();
  } else if (event.data == "Space") {
    document.activeElement.value = document.activeElement.value + " ";
  } else if (event.data == "Backspace") {
    document.activeElement.value = document.activeElement.value.substr(
      0,
      document.activeElement.value.length - 1
    );
  } else if (event.data == "Enter") {
    socket.emit("message", document.activeElement.value);
    document.activeElement.value = "";
  }

  document.activeElement.value = document.activeElement.value + "|";
});

document.addEventListener("keydown", e => {
  if (
    e.code == "Enter" &&
    document.activeElement == document.getElementById("messageLine")
  ) {
    socket.emit("message", document.activeElement.value);
    document.activeElement.value = "";
  }
});

socket.on("disconnect", function() {
  window.addEventListener("focus", document.location.reload);
});

socket.on("requestViewerUpdate", function() {
  socket.emit("username", name);
});

socket.on("message", function(data) {
  document.getElementById("output").innerHTML =
    "<br>" +
    "<p>" +
    data +
    "</p>" +
    document.getElementById("output").innerHTML;
});

socket.on("updateViewers", function(viewers) {
  let viewersString = "<h1>" + room + "</h1>";

  for (var i = 0; i < viewers.length; i++) {
    viewersString =
      viewersString + "<p style='margin-left: 50px;'>" + viewers[i] + "</p>";
  }

  document.getElementById("viewers").innerHTML = viewersString;

  document.getElementById("messageLine").focus();
});
