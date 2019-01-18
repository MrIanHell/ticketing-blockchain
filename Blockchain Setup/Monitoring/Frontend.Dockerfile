FROM ubuntu:xenial

RUN apt-get update \
      && apt-get install -y wget nodejs npm ntp git\
      && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/bin/nodejs /usr/bin/node

WORKDIR "/opt"

RUN git clone https://github.com/cubedro/eth-netstats.git

WORKDIR "/opt/eth-netstats"
RUN npm install
RUN npm install -g grunt-cli
RUN grunt

CMD WS_SECRET=test npm start