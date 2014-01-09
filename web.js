'use strict';

var express = require('express');
var app = module.exports = express();
var server = require('http').createServer(app)
var io = require("socket.io").listen(server);
var redis = require("redis");


function createRedisClient(){
    var client = null;
    if (process.env.REDISTOGO_URL) {
        var rtg   = require("url").parse(process.env.REDISTOGO_URL);
        client = redis.createClient(rtg.port, rtg.hostname);

        client.auth(rtg.auth.split(":")[1]);
    } else {
        client = redis.createClient();
    }
    return client;
}


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


require('chat')(app, io, creatRedisClient);

server.listen(process.env.PORT || 80)
