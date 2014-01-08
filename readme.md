#Weaver chat engine

Tech stack: Node.js + socket.io + redis

## Requirements

* Fully embeddable
* Chat persistence and history browsing
* Configurable talklines and emotes (overrides)
* Messages include (user uuid, user display name, message, timestamp)
* Interpret color codes & newlines client-side (no HTML permitted in the db)  
* User handles are clickable, and allow 'view profile', 'chat', 'mail', 'ignore', 'mute' links.
* Muting happens until a given date, and can only be performed by moderators. All users can ignore other users.
* Multi-room, room hierarchy
* Room access control (externally handled)
* Externally handled authorization. Expiring per-action or per-session signatures are provided and verified. 

## APIs

Sync protocol. 

Both chat server and host game should expose the following API (URL is configurable)

```
/weaverchat/rpc - GET/POST
Params: hmacsha256, message
```

message shall be a string containing valid JSON
hmacsha256 shall be the base64 encoding of the HMAC SHA256 hash digest of "secret|message"
message MUST always contain a 'signed_on' field, with an ISO 8601 datetime of the message's creation. This serves as both a salt and an expiry hint, and cannot be ommited.

```
POST
{
	action: 'setmute',
	mute_until: [date] | nil,
	room_prefix: string,
	profile_id: nil | string,
	user_id:  nil | string,
	room_id: nil | string,
	signed_on: "1997-07-16T19:20:30.45+01:00"
}
RESPONSE -> 200 OK, 500 ERROR, 403 invalid signature

POST
{
	action: 'setignore',
	ignore: true | false,
	profile_id: nil | string,
	user_id:  nil | string,
	room_prefix: string,
	room_id: nil | string,
	target_user_id: nil | string,
	target_profile_id: nil | string,
	signed_on: "1997-07-16T19:20:30.45+01:00"
}
RESPONSE -> 200 OK, 500 ERROR, 403 invalid signature

GET
{
	action: 'getchatinfo',
	user_id: string,
	room_prefix: string,
	signed_on: "1997-07-16T19:20:30.45+01:00"
}

RESPONSE -> 200 OK, 403 invalid signature

{
user_id:string,
mutes: 
[ 
{(profile_id), (room_id), (room_prefix), expiry_date},
{(profile_id), (room_id), (room_prefix), expiry_date}
],
ignores:
[
{(target_user_id), (target_profile_id), (room_prefix), (room_id), expiry_date},
{(target_user_id), (target_profile_id), (room_prefix), (room_id), expiry_date}
],
powers: 
[
{ room_id: string, room_prefix: string, authority_level: 0...3,},
]
}
```
Shared secrets are used to sign API requests in both directions.

In addition to the above API, the chat server only allows a client to connect to a room if the jquery plugin provides a similar JSON string and hash during connection:

```
{
room_id,
user_id,
profile_id,
display_name,
signed_on,
readonly: true|false,
powers: {} 
}
```

## Are there any potential use cases for

* ...  only muting a user in a given room?
* ...  only allowing a low-level moderator to mute a user within his/her room or room group or game?
* ...  only muting one of a user's profiles?
* ...  only ignoring a user's chats within a single room?
* ...  only ignoring a profile's chats (vs the user)?
* ...  Having expiring ignores?
* ...  only ignoring a user from within one of your own profiles, but not another?
* ...  Preventing moderators from being ignored by normal users?
* ...  Preventing moderators from muting moderators of the same/higher level?
* ...  Having moderators powers specific to a given room (or room group or game?)
* ...  Having multiple tiers of moderators? 
* ...  Allowing message deletion?

## Can we simplify by

* ... Doing ignoring on the client side, saving the list to the game server instead of the chat server? This means the HTML hosting the chat page will have to contain the list of ignored users every time, but much less server complexity. How long does this list max out at normally?

## Roadmap

### Milestone 0.1 - complete

* No persistence
* Primitive chat
* Runs on Heroku: http://weaver-chat.herokuapp.com/

### Milestone 0.2 - completed

* Add talklines
* Add emotes
* Add colors

### Milestone 0.3 - completed

* Add Redis backed storage 

### Milestone 0.4

* Add reconnect, message ordering, and message guid support (messages can be out-of-order and duplicated)
* Add multi-room support

### Milestone 0.5

* Add history browsing
* Add clickable handles with actions

### Milestone 0.6

* Add room access control
* Add user authorization
* Add moderator authorization
* Add ignore and mute support

### Milestone 0.7

* Add outbox and message failure handling/retry

