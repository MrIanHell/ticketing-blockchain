var Tx = require('ethereumjs-tx')
const Web3 = require('web3')
const path = require('path')
const fs = require('fs')
const web3 = new Web3('http://localhost:8545')


const account1 = '0x3590aca93338b0721966a8d0c96ebf2c4c87c544'
const account2 = '0x8cc5a1a0802db41db826c2fcb72423744338dcb0'

const privateKey1 = Buffer.from(process.env.PRIVATE_KEY_1, 'hex')
// const privateKey2 = Buffer.from(process.env.PRIVATE_KEY_2, 'hex')

const contractAddress = '0x9630177b5bf53133c71c5900dee31356642be7bf'
const jsonFilePath = path.join(__dirname, '..', '..', 'Token', 'build', 'contracts', 'TicketToken.json')
const contractJsonContent = fs.readFileSync(jsonFilePath, 'utf8')
const jsonOutput = JSON.parse(contractJsonContent)
const contractABI = jsonOutput['abi']
const contract = new web3.eth.Contract(contractABI, contractAddress)


web3.eth.getTransactionCount(account1, (err, txCount) => {
	// 1. Build the transaction (txObject values all have to be hexadecimal)
	const txObject = {
		nonce: web3.utils.toHex(txCount),
		gasLimit: web3.utils.toHex(800000), //Raise the limit as sending data takes a lot more gas
		gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
		to: contractAddress,
		data: contract.methods.transfer(account2, 1, 1251).encodeABI()
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
// contract.methods.totalSupply().call((err, result) => {console.log('Total supply: ', result)})
contract.methods.totalSupply().call().then(val => console.log('Total Supply of tickets:', val))
contract.methods.faceValue().call().then(val => console.log('Ticket face value: £' + val / 100))
contract.methods.balanceOf(account1).call().then(bal => console.log('Account 1 ticket balance:', bal))
contract.methods.balanceOf(account2).call().then(bal => console.log('Account 2 ticket balance:', bal))
// contract.methods.balanceOf(account1).call((err, result) => {console.log('Account 1 balance: ', result)})
// contract.methods.balanceOf(account2).call((err, result) => {console.log('Account 2 balance: ', result)})