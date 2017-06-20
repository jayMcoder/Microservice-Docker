# Node v7 as the base image to support ES6
FROM node:7.2.0

# Create a new user to our new container and avoid the root user
RUN useradd --user-group --create-home --shell /bin/false moby && \
    apt-get clean

ENV HOME=/home/moby

COPY package.json yarn.lock $HOME/app/

COPY src/ $HOME/app/src

RUN chown -R moby:moby $HOME/* /usr/local/

WORKDIR $HOME/app
RUN npm install -g yarn --silent --production --progress=false
RUN yarn cache clean && \
    yarn install --silent --production

RUN chown -R moby:moby $HOME/*
USER moby

EXPOSE 3000

CMD ["npm", "start"]
