var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.get("/", function(req, res) {
  res.sendFile("/app/public/index.html");
});

//Whenever someone connects this gets executed
io.on("connection", function(socket) {
  
  function updateViewers() {    
    var values = socket.rooms.values();
    values.next();
    let room = values.next().value;

    var viewers = [];

    //this is an ES6 Set of all client ids in the room
    var clients = io.sockets.adapter.rooms.get(room);

    //to get the number of clients in this room
    var numClients = clients ? clients.size : 0;
    
    try {

    for (var clientId of clients) {
      //this is the socket of each client in the room.
      var clientSocket = io.sockets.sockets.get(clientId);

      viewers.push(clientSocket.name);
    }

    io.to(room).emit("updateViewers", viewers);
    } catch (error) {
      console.log(error);
    }
  }

  socket.on("room", function(room) {
    socket.join(room);
  });

  socket.on("username", function(name) {
    var values = socket.rooms.values();

    values.next();

    var room = values.next();

    if (room === undefined) return;

    room = room.value;

    socket.name = name;

    updateViewers();
    
    console.log(socket.name + " connected to " + room);
  });

  socket.on("message", function(data) {
    if (socket.name === undefined) return;

    var values = socket.rooms.values();
    values.next();
    let room = values.next().value;

    io.to(room).emit("message", socket.name + ": " + data);
  });

  //Whenever someone disconnects this piece of code executed
  socket.on("disconnect", function() {
    io.sockets.emit("requestViewerUpdate");

    console.log(socket.name + " disconnected...");
  });
});
http.listen(3000, function() {
  console.log("listening on *:3000");
});
