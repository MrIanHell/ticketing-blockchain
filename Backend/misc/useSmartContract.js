var Tx = require('ethereumjs-tx')
const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')

const account1 = '0x3590aca93338b0721966a8d0c96ebf2c4c87c544'
const account2 = '0x8cc5a1a0802db41db826c2fcb72423744338dcb0'

const privateKey1 = Buffer.from(process.env.PRIVATE_KEY_1, 'hex')
const privateKey2 = Buffer.from(process.env.PRIVATE_KEY_2, 'hex')

const contractAddress = '0x66d4fc015cfebed88e1104c182bb976bcd15e2ec'
const contractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"standard","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]
const contract = new web3.eth.Contract(contractABI, contractAddress)


web3.eth.getTransactionCount(account1, (err, txCount) => {
	// 1. Build the transaction (txObject values all have to be hexadecimal)
	const txObject = {
		nonce: web3.utils.toHex(txCount),
		gasLimit: web3.utils.toHex(800000), //Raise the limit as sending data takes a lot more gas
		gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
		to: contractAddress,
		data: contract.methods.transfer(account2, 1000).encodeABI()
	}

	// 2. Sign the transaction with the private key
	const tx = new Tx(txObject) // transaction object
	tx.sign(privateKey1)
	const serializedTransaction = tx.serialize()
	const raw = '0x' + serializedTransaction.toString('hex')

	// 3. Broadcast the transaction
	web3.eth.sendSignedTransaction(raw, (err, txHash) => {
		console.log('Transaction Hash:', txHash)
		console.log(err)
	})
})

// Checking the new balances
contract.methods.totalSupply().call((err, result) => {console.log('Total supply: ', result)})
contract.methods.balanceOf(account1).call((err, result) => {console.log('Account 1 balance: ', result)})
contract.methods.balanceOf(account2).call((err, result) => {console.log('Account 2 balance: ', result)})