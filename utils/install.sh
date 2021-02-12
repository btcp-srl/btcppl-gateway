#!/bin/bash

#INSTALL DEPENDENCIES
sudo apt-get install -y build-essential

#INSTALL NODEJS
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install pm2 -g

#DOWNLOADING NODE MODULES
npm install
npm run build

#UPDATING NPM
npm install -g npm
npm install -g pm2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:rotateInterval '0 * * * *'
pm2 startup

#SETTING UP FIREWALL
ufw allow 22
ufw deny 42223
ufw deny 27017
ufw allow 42222
ufw enable -y

#SETTING UP NGINX
sudo apt update
sudo apt install nginx -y
sudo ufw allow 'Nginx Full'

#INSTALL CERTBOT
sudo add-apt-repository ppa:certbot/certbot -y
sudo apt update
sudo apt install python-certbot-nginx -y
