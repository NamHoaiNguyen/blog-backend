#!/bin/bash

# !!! Please run this file in root project folder
# This file is a shortcut for `docker-compose run`
# USAGE:
# Change `docker-app-demo` to your service name
# $ script/compose_run.sh <your command>
# EG:
# $ script/compose_run.sh yarn add lodash

# namnh2: Just use to remember some commands
# docker-compose run --rm docker-backend
# sudo lsof -i:9000
# docker-compose -p blog-backend up --build
# docker-compose down -v
# npx prisma migrate dev --name init
# docker exec -it "container_id" redis-cli

docker build --no-cache . && docker-compose up
