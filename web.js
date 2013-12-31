var express = require('express');
var app = module.exports = express();
var server = require('http').createServer(app)
var io = require("socket.io").listen(server);


app.configure(function() {
    app.locals.pretty = true;
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.static(__dirname + '/public'));
      app.use('/components', express.static(__dirname + '/components'));
      app.use('/js', express.static(__dirname + '/js'));
      app.use('/icons', express.static(__dirname + '/icons'));
      app.set('views', __dirname + '/views');
      app.engine('html', require('ejs').renderFile);
});

app.get('/', function(req, res) {
  res.render('index.html');
});


var DEBUG = true
var PORT = 3000
var INIT_MESSAGES = 5



io.set ('transports', ['xhr-polling', 'jsonp-polling'])

var messages = new Array()

Array.prototype.inject = function(element) {

    if (this.length >= INIT_MESSAGES) {
        this.shift()
    }
    this.push(element)
}

io.sockets.on('connection', function(client) {

    if (DEBUG)
        console.log("New Connection: ", client.id)

    client.emit("init", JSON.stringify(messages))

    client.on('msg', function(msg) {

        if (DEBUG)
            console.log("Message: " + msg)

        var message = JSON.parse(msg)
        messages.inject(message)

        client.broadcast.emit('msg', msg)
    })

    client.on('disconnect', function() {

        if (DEBUG)
            console.log("Disconnected: ", client.id)
    })
})

server.listen(80)
