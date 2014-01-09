'use strict';

/**
 * Module dependencies.
 */
var express = require('express'),
  _ = require('underscore'),
  debug = true,
  uuid = require('node-uuid');

module.exports = function(app, io, redisConnect, redis) {

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


    client.on('auth', function(data){

    if (debug)
      
      data = JSON.parse(data);
      client.info = JSON.parse(data.authstring);

      console.log("Authenticating: ", client.id, "as", client.info.user_id, ", ", client.info.profile_display_name);

      //TODO: Verify these are present
      //client.info.user_id, client.info.profile_id, client.info.profile_display_name, 
      //client.info.room_id
      //client.info.powers
      //client.info.mutes
      //client.info.readonly
      //TODO: Verify client.info.signed_on is within 24 hours.
      //TODO: verify data.hmacsha256 matches secret | data.authstring

      client.info.messages_key = client.info.room_id + ":messages";
      
      client.join(client.info.room_id);

      get_messages(client.info.messages_key, 0,20, function(data){
        client.emit('authcomplete', JSON.stringify(data));
        console.log("Authenticated: ", client.info.profile_display_name );

      }, function (error){
        client.emit('errormessage', JSON.stringify({message: error}));
      });
      
    });

    client.on('delmessage', function(msg){
      if (!client.info){
        //TODO: tell to reauth
        return;
      }
      //TODO!
      //Check if they have authorization (ci)
      //Do a linear search through redis looking for a matching 'id'. 
      //Find that exact string, and delete with LREM.
      client.broadcast.emit('delmessage', JSON.parse(msg).id);
    });

    client.on('sendmessage', function(msg) {
      if (!client.info){
        //TODO: tell to reauth
        return;
      }
      var m = JSON.parse(msg);
      //Check for banned words
      //Check for mute
      //Check for sync
      //Check for dupe
      //Check for blank

      console.log("Message: " + msg);

      if (m.message.indexOf("snap") > -1){
        console.log("Rejected message: " + msg);
        client.emit("messagerejected", msg);
        return; //we rejected the message, nothing left to do.
      }

      m.date = (new Date()).toISOString();
      m.id = uuid.v1();
      
      client.emit('newmessage', JSON.stringify(m));
      //Tell the user it was ok.
      client.emit('messageok', JSON.stringify(m));
      //We could delete send_id and send_date now, if we cared...

      msg = JSON.stringify(m);

      //Store message
      store.lpush(client.info.messages_key,msg, redis.print); //Push latest message
      store.ltrim(client.info.messages_key,0,499, redis.print); //Trim to 500 messages
      
      client.broadcast.emit('newmessage', msg);

    });

    client.on('disconnect', function() {
      console.log("Disconnected: ", client.id);
    });
  });

};

