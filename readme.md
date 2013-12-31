#Weaver chat engine

Tech stack: Node.js + socket.io + redis

## Requirements

* Fully embeddable
* Chat persistence and history browsing
* Configurable talklines and emotes (overrides)
* Force sync before submit
* Messages include (user uuid, user display name, message, timestamp)
* Interpret color codes & newlines client-side (no HTML permitted in the db)  
* User handles are clickable, and allow 'view profile', 'chat', 'mail', 'ignore', 'mute' actions.
* Muting happens until a given date, and can only be performed by moderators. All users can ignore other users.

* Multi-room
* Room access control (externally handled)
* Externally handled authorization. Per-session keys are provided and verified. 
* Users can chat with each other
