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

* Multi-room
* Room access control (externally handled)
* Externally handled authorization. Per-session keys are provided and verified. 

## APIs

Shared secrets are used to sign API requests.

Display room  (room id, user id, profile id, display_name, token_created_date, readonly)
Set Mute (mute,[user_id], [profile_id], [room_id], token_created_date)
Set Ignore (ignore,[user_id], [profile_id], [room_id],[target_user_id], [target_profile_id], token_created_date)

Callbacks are APIs the host app must implement.

Get user info (returns list of ignored users, and the mute state for the user)

Set Mute (mute,[user_id], [profile_id], [room_id], token_created_date)
Set Ignore (ignore,[user_id], [profile_id], [room_id],[target_user_id], [target_profile_id], token_created_date)




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

