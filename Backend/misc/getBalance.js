var Web3 = require('web3');
const url = 'http://localhost:8545';
var web3 = new Web3(url);

const account1 = '0x3590aca93338b0721966a8d0c96ebf2c4c87c544'
const account2 = '0x8cc5a1a0802db41db826c2fcb72423744338dcb0'

web3.eth.getBalance(account1, (err, bal) => {
	console.log('Account 1 balance:', web3.utils.fromWei(bal, 'ether'), 'ETH')
});

web3.eth.getBalance(account2, (err, bal) => {
	console.log('Account 2 balance:', web3.utils.fromWei(bal, 'ether'), 'ETH')
});