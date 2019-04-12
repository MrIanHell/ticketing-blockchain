FROM ubuntu:xenial

RUN apt-get update \
     && apt-get install -y software-properties-common \
     && add-apt-repository -y ppa:ethereum/ethereum \
     && apt-get update \
     && apt-get install -y ethereum

WORKDIR "/opt"
ADD ./genesis.json ./genesis.json
ADD ./start.sh ./start.sh
RUN chmod +x ./start.sh
RUN geth init genesis.json

ARG password
ARG privatekey
RUN echo $password > ~/.accountpassword
RUN echo $privatekey > ~/.privatekey
RUN geth account import --password ~/.accountpassword  ~/.privatekey

ENV address=""
ENV bootnodeId=""
ENV bootnodeIp=""

EXPOSE 8545
EXPOSE 30303

ENTRYPOINT ./start.sh