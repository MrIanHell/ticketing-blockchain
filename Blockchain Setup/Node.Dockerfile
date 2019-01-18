FROM ubuntu:xenial

RUN apt-get update \
     && apt-get install -y software-properties-common \
     && add-apt-repository -y ppa:ethereum/ethereum \
     && apt-get update \
     && apt-get install -y ethereum

WORKDIR "/opt"
ADD ./genesis.json ./genesis.json
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

CMD exec geth --bootnodes "enode://$bootnodeId@$bootnodeIp:30301" --networkid="500" --verbosity=4 --rpc --rpcaddr "0.0.0.0" --rpccorsdomain "*" --syncmode=full --mine --gasprice "0" --etherbase $address --unlock $address --password ~/.accountpassword