FROM ubuntu:xenial

RUN apt-get update \
     && apt-get install -y software-properties-common \
     && add-apt-repository -y ppa:ethereum/ethereum \
     && apt-get update \
     && apt-get install -y ethereum

EXPOSE 30301/udp
EXPOSE 30303/udp

ENV nodekeyhex=""
CMD exec bootnode -nodekeyhex $nodekeyhex