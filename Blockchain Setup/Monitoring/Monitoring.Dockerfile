FROM ubuntu:xenial

RUN apt-get update \
      && apt-get install -y wget nodejs npm ntp git\
      && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/nodejs /usr/bin/node

WORKDIR "/opt"
ADD ./app.json ./app.json

RUN git clone https://github.com/cubedro/eth-netstats.git
RUN git clone https://github.com/cubedro/eth-net-intelligence-api.git

WORKDIR "/opt/eth-netstats"
RUN npm install
RUN npm install -g pm2
RUN npm install -g grunt-cli
RUN grunt

WORKDIR "/opt/eth-net-intelligence-api"
RUN npm install

WORKDIR "/opt"

EXPOSE 3000

CMD pm2-docker start app.json