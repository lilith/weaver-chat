var express = require('express');
var app = module.exports = express();
var server = require('http').createServer(app)
var io = require("socket.io").listen(server);
var redis = require("redis");
var _ = require("underscore");

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


var DEBUG = true
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


var store = createRedisClient();


var chatkey = "chat";

var messagelistkey = "chat::messages"
function getmesssages(){
    redis.lrange([messagelistkey, 0,20], function (err,result){

    });
}

io.sockets.on('connection', function(client) {

    if (DEBUG)
        console.log("New Connection: ", client.id)

    store.lrange([messagelistkey, 0,20], function (err,result){
        if (result) {
            result= _.map(result, function(e){return JSON.parse(e);});
            result = _.reject(result, function(e){ return !e;});
            console.log(result);
            client.emit("init", JSON.stringify(result));
        }else{
            console.log("Failed to query current list of messages");
            redis.print(err,result);
        }
    });

    client.on('msg', function(msg) {

        //Check for banned words
        //Check for mute
        //Check for sync

        if (DEBUG)
            console.log("Message: " + msg)

        var message = JSON.parse(msg)
        //msg = JSON.stringify(message);

        store.lpush(messagelistkey,msg, redis.print); //Push latest message
        store.ltrim(messagelistkey,0,499, redis.print); //Trim to 500 messages

        client.broadcast.emit('msg', msg)
    })

    client.on('disconnect', function() {

        if (DEBUG)
            console.log("Disconnected: ", client.id)
    })
})

server.listen(process.env.PORT || 80)
