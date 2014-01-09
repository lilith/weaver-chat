'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
    _ = require("underscore"),
    debug = true, 
    uuid = require('node-uuid');

module.exports = function(app, io, redisConnect) {

var store = redisConnect();

var get_messages = function(key, index, length, resultCallback, errorCallback){
    store.lrange([key, index, length], function (err,result){
        if (result) {
            result= _.map(result, function(e){return JSON.parse(e);});
            result = _.reject(result, function(e){ return !e;});
            resultCallback(result);
        }else{
            errorCallback("Failed to query current list of messages");
            redis.print(err,result);
        }
    });
};

io.sockets.on('connection', function(client) {

    if (debug)
        console.log("Connecting: ", client.id);

    var cl = {}; //client info

    client.on('auth', function(data){

    	data = JSON.parse(data);
    	ci.info = JSON.parse(data.authstring);
    	//TODO: Verify these are present
    	//ci.info.user_id, ci.info.profile_id, ci.info.profile_display_name, 
    	//ci.info.room_id
    	//ci.info.powers
    	//ci.info.mutes
    	//ci.info.readonly
    	//TODO: Verify ci.info.signed_on is within 24 hours.
    	//TODO: verify data.hmacsha256 matches secret | data.authstring

    	ci.info.messages_key = ci.info.room_id + ":messages";
    	initdata = {}
    	client.join(ci.info.room_id);

    	get_messages(ci.info.messages_key, 0,20, function(data){
			client.emit('authcomplete', JSON.stringify(data));
    	}, function (error){
    		client.emit('errormessage', {message: error}))
    	})
    	
    });

	client.on('delmessage', function(msg){
		//TODO!
		//Check if they have authorization (ci)
		//Do a linear search through redis looking for a matching 'id'. 
		//Find that exact string, and delete with LREM.
		client.broadcast.emit('delmessage', JSON.parse(msg).id);
	});

    client.on('sendmessage', function(msg) {
		var m = JSON.parse(msg)
        //Check for banned words
        //Check for mute
        //Check for sync
        //Check for dupe
        //Check for blank

        console.log("Message: " + msg);

        if (m.message.indexOf("snap") > -1){
        	client.emit("messagerejected", msg);
        	return; //we rejected the message, nothing left to do.
        }

        m.date = Date.now().toISOString();
        m.id = uuid.v1();
		
		//Tell the user it was ok.
		client.emit ('messageok', JSON.stringify(m));
		//We could delete send_id and send_date now, if we cared...

        msg = JSON.stringify(m);

        //Store message
        store.lpush(ci.info.messages_key,msg, redis.print); //Push latest message
        store.ltrim(ci.info.messages_key,0,499, redis.print); //Trim to 500 messages
        
        client.broadcast.emit('newmessage', msg)
    })

    client.on('disconnect', function() {

        console.log("Disconnected: ", client.id)
    })
});

}

