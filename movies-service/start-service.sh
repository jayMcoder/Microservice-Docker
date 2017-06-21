#!/usr/bin/env bash

# Temporary movies-service start script
# Will be replaced by docker swarm
docker run --name movies-service -p 3000:3000 -e DB_SERVERS="192.168.64.5:27017 192.168.64.6:27017 192.168.64.7:27017" --add-host master1:192.168.64.5 --add-host worker11:192.168.64.6 --add-host worker12:192.168.64.7 -d movies-service
