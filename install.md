# Deploying weaver-chat

Start a Dokku droplet on Digital Ocean, or follow the Dokku installation instructions. Use a SSH key, not a password for authentication if possible.

Add a wildcard and regular A-record for the server IP (*.dokku and dokku.weaverengine.com). Visit the IP and enter the hostname (dokku.weaverengine.com) (enable virtual hostnames)

Clone this project.
Add a git remote to this project in the form dokku@dokku.weaverengine.com:chat and push.

Connect to the Dokku server

ssh root@dokku.weaverengine.com

#Install the redis plugin, then create an instance that will auto-link to the `chat` app on the next push
cd /var/lib/dokku/plugins
git clone https://github.com/luxifer/dokku-redis-plugin redis
dokku plugins-install

dokku redis:create chat

