const Web3 = require('web3')
const web3 = new Web3('https://mainnet.infura.io/v3/6a92f78aa9dc420e9d1c348e3f03c4d0');
// const web3 = new Web3('http://localhost:8545')

 // Get current average gas price in ETH from the last few blocks
web3.eth.getGasPrice().then((result) => {
	console.log(web3.utils.fromWei(result, 'ether'))
})

// Hashing functions
console.log(web3.utils.sha3('Ian Hell'))
console.log(web3.utils.sha3('124')) // must wrap numbers (and other raw data types) in a string
console.log(web3.utils.keccak256('Ian Hell')) // same as sha3
console.log(web3.utils.soliditySha3('Ian Hell')) // solidity's version of sha3

// Randomness functions
console.log(web3.utils.randomHex(1)) // get a random hex of a specified length

// Use web3's version of the underscoreJS library (has lots of nice functions we can use)
const _ = web3.utils._
console.log(_.each({ key1: 'value1', key2: 'value2'}, (value, key) => { // easy way to iterate over key objects
	console.log(key)
}))