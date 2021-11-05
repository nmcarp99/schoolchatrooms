var app = require("express")();
var http = require("http").Server(app);
var fs = require("fs");
var io = require("socket.io")(http);

app.get("/*", function(req, res) {
  let filePath = '/app/public/' + req.url.substr(1, req.url.length - 1);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(400).send('File not found at \"localhost' + req.url + '\" on port 80');
  }
});

//Whenever someone connects this gets executed
io.on("connection", function(socket) {
    
  function updateViewers() {    

    var viewers = [];

    //this is an ES6 Set of all client ids in the room
    var clients = io.sockets.adapter.rooms.get(socket.room);

    //to get the number of clients in this room
    var numClients = clients ? clients.size : 0;
    
    try {

    for (var clientId of clients) {
      //this is the socket of each client in the room.
      var clientSocket = io.sockets.sockets.get(clientId);

      viewers.push(clientSocket.name);
    }

    io.to(socket.room).emit("updateViewers", viewers);
    } catch (error) {
      console.log(error);
    }
  }

  socket.on("room", function(room) {
    socket.room = room;
    socket.join(room);
  });

  socket.on("username", function(name) {
    if (socket.name === undefined) io.to(socket.room).emit("message", "<span style='float:right;'>\"" + name + "\" Connected</span>");
    
    socket.name = name;

    updateViewers();
        
    console.log(socket.name + " connected to " + socket.room);
  });

  socket.on("message", function(data) {
    if (socket.name === undefined || data == "") return;

    io.to(socket.room).emit("message", socket.name + ": " + data);
  });

  //Whenever someone disconnects this piece of code executed
  socket.on("disconnect", function() {
    io.sockets.emit("requestViewerUpdate");
    
    io.to(socket.room).emit("message", "<span style='float:right;'>\"" + socket.name + "\" Disconnected</span>");

    console.log(socket.name + " disconnected from " + socket.room);
  });
});
http.listen(3000, function() {
  console.log("listening on *:3000");
});
