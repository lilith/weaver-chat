var express = require('express');
var app = module.exports = express();
var server = require('http').createServer(app)
var io = require("socket.io").listen(server);

app.configure(function() {
    app.locals.pretty = true;
    app.use(express.compress());
      app.use(express.bodyParser());
      app.use(express.methodOverride());
      app.use(express.static(__dirname + '/public'));
      app.use('/components', express.static(__dirname + '/bower_components'));
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
var INIT_MESSAGES = 500

io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);                    // reduce logging

// enable all transports (optional if you want flashsocket support, please note that some hosting
// providers do not allow you to create servers that listen on a port different than 80 or their
// default port)
io.set('transports', [
    'websocket'
  //, 'flashsocket'
  , 'htmlfile'
  , 'xhr-polling'
  , 'jsonp-polling'
]);

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

server.listen(process.env.PORT || 80)
