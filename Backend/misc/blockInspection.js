const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')

// Get 10 latest block numbers
web3.eth.getBlockNumber().then((latest) => {
	for (let i = 0; i < 10; i++) {
		web3.eth.getBlock(latest - i).then((block) => {
			console.log(block.number)
		})
	}
})

web3.eth.getBlockTransactionCount('latest').then(console.log) // Get number of transactions from a particular block

web3.eth.getBlock('latest').then((b) => console.log(b.hash)) // Retrive the block hash from a particular block
const hash = '0x06eaa3f55a2c0fc23b1535c14c97c1d14e419ba5c1c634424be89a11adcff4b9'

web3.eth.getTransactionFromBlock(hash, 0).then(console.log) // Get a particular transaction's information from within a certain block