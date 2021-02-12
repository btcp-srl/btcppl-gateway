#!/bin/bash

sudo apt-get update

sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -

sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

cd docker
if [[ "$@" =~ "-rebuild" ]]
then
    echo "Rebuilding Docker Image"
    docker build --no-cache -t btcppl:mongo .
    docker run --restart=unless-stopped -d --name=btcppl_mongo -dit -p 27017:27017 btcppl:mongo
else
    docker ps | grep 'btcppl_mongo' &> /dev/null
    if [ $? == 0 ]; then
        echo "Database docker exists yet, running istance."
        docker start btcppl_mongo
    else
        echo "Running MongoDB Docker container."
        systemctl enable docker
        echo 'DOCKER_OPTS="--iptables=false"' >> /etc/default/docker
        systemctl restart docker
        docker build -t btcppl:mongo .
        docker run --restart=unless-stopped -d --name=btcppl_mongo -dit -p 27017:27017 btcppl:mongo
    fi
fi
