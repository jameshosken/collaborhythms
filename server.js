/**
 * @Author: James Hosken
 * @Date:   2017-06-25
 * @Email:  james.hosken@nyu.edu
 * @Filename: server.js
 * @Last modified by:   James Hosken
 * @Last modified time: 2017-06-26
 */

var express = require("express");
var app = express();
app.use(express.static("public"));
var http = require("http").Server(app);

var io = require("socket.io")(http)

var persistentData = {"matrix": []};

http.listen(process.env.PORT || 3000, function(){
  console.log("Listening on port *3000");
})

app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");

})

io.on('connection', function(socket){
  socket.emit("firstUpdate", persistentData);


  socket.on("clientMessage", function(data){
    console.log("Change!");
    persistentData = data;
    io.emit("update", data);
  });

});
