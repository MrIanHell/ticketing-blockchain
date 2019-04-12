#!/bin/bash
set -e
geth --bootnodes "enode://$bootnodeId@$bootnodeIp:30301" --networkid="500" --verbosity=4 --rpc --rpcaddr "0.0.0.0" --rpccorsdomain "*" --syncmode=full --mine --gasprice "0" --etherbase $address --unlock $address --password ~/.accountpassword >> gethLogs.log &
sleep 10
(echo "miner.start()" && cat) | geth attach
sleep 3
tail -f gethLogs.log