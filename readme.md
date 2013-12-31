#Weaver chat engine

Tech stack: Node.js + socket.io + redis

## Requirements

* Fully embeddable
* Chat persistence and history browsing
* Configurable talklines and emotes (overrides)
* Force sync before submit
* Messages include (user uuid, user display name, message, timestamp)
* Interpret color codes & newlines client-side (no HTML permitted in the db)  
* User handles are clickable, and allow 'view profile', 'chat', 'mail', 'ignore', 'mute' links.
* Muting happens until a given date, and can only be performed by moderators. All users can ignore other users.

* Multi-room
* Room access control (externally handled)
* Externally handled authorization. Per-session keys are provided and verified. 


## Roadmap

### Milestone 0.1 - complete

* No persistence
* Primitive chat
* Runs on Heroku: http://weaver-chat.herokuapp.com/

### Milestone 0.2

* Add talklines
* Add emotes
* Add colors

### Milestone 0.3

* Add Redis backed storage

### Milestone 0.4

* Add history browsing

### Milestone 0.5

* Add clickable handles with actions
* Add ignore and mute support

### Milestone 0.6

* Add room access control
* Add user authorization
* Add moderator authorization


