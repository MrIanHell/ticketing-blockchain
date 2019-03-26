const Web3 = require('web3')
const Tx = require('ethereumjs-tx')
const path = require('path')
const fs = require('fs')

const web3 = new Web3('http://localhost:8545')

/**
 * Deploys a given contract to the blockchain.
 * 
 * Arguments:
 * 	adminAccount -- Account used to deploy the contract
 *  privateKey -- Private key of the account being used to deploy the contract
 *  abi -- The contract ABI (Application Binary Interface)
 *  contractData -- The contract bytecode that is to be deployed
 *  arguments -- Arguments (in an array) to be passed to the constructor of the contract
 *
 * Returns: The deployed contract as a web3 contract object
 */
async function deployContract(account, privateKey, abi, contractData, arguments) {
	const txCount = await web3.eth.getTransactionCount(account)

	const myContract = new web3.eth.Contract(abi)

	// Construct the bytecode for the contract data
	const deployment = myContract.deploy({
		data: contractData,
		arguments: arguments
	})
	const byteCode = deployment.encodeABI()
	const gasEstimation = await deployment.estimateGas() + 10000

	// Build transaction object
	const txObject = {
		nonce: txCount,
		gasLimit: web3.utils.toHex(gasEstimation),
		gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
		data: byteCode
	}

	// Sign the object
	const tx = new Tx(txObject)
	tx.sign(privateKey)
	const serialisedTx = tx.serialize()
	const raw = '0x' + serialisedTx.toString('hex')

	// Broadcast the transaction and return the deployed contract as an object
	const receipt = await web3.eth.sendSignedTransaction(raw)
	return new web3.eth.Contract(abi, receipt.contractAddress)
}


/**
 * Transfers ticket tokens from one ethereum account to another, authorising
 * the transaction the source account by signing it with their private key.
 * 
 * Arguments:
 *  sourceAcc -- Address of the source account
 *  destAcc -- Address of the destination account
 * 	sourcePrivKey -- Private key of the source account
 *  quantity -- Number of tickets to be transferred
 * 	price -- price the ticket is being bought at
 *  contractObject -- Web3 contract object of the token contract in use
 *
 * Returns: Receipt of the transfer transaction broadcast to the blockchain
 */
async function transferTickets(sourceAcc, destAcc, sourcePrivKey, quantity, price, contractObject) {
	const txCount = await web3.eth.getTransactionCount(sourceAcc)

	// Build transaction object
	const txObject = {
		nonce: web3.utils.toHex(txCount),
		gasLimit: web3.utils.toHex(800000),
		gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
		to: contractObject.options.address,
		data: contractObject.methods.transfer(destAcc, quantity, price).encodeABI()
	}

	// Sign the object
	const tx = new Tx(txObject) // transaction object
	tx.sign(sourcePrivKey)
	const serialisedTx = tx.serialize()
	const raw = '0x' + serialisedTx.toString('hex')

	// Broadcast the transaction and return its receipt
	return web3.eth.sendSignedTransaction(raw)
}


// Testing and debugging
const adminAccount = '0x3590aca93338b0721966a8d0c96ebf2c4c87c544'
const destAccount = '0x8cc5a1a0802db41db826c2fcb72423744338dcb0'
const privateKey = Buffer.from(process.env.PRIVATE_KEY_1, 'hex')
const jsonFilePath = path.join(__dirname, '..', 'Token', 'build', 'contracts', 'TicketToken.json')
const contractJsonContent = fs.readFileSync(jsonFilePath, 'utf8')
const jsonOutput = JSON.parse(contractJsonContent)
const contractAbi = jsonOutput['abi']
const data = jsonOutput['bytecode']

const run = async () => {
	console.log('Deploying smart contract...')
	const contract = await deployContract(adminAccount, privateKey, contractAbi, data, ["Test Event", 40, 1250])
	const contractAddress = contract.options.address
	console.log('Contract Address:', contractAddress)

	await contract.methods.totalSupply().call().then(val => console.log('Total Supply of tickets:', val))
	await contract.methods.faceValue().call().then(val => console.log('Ticket face value: £' + val / 100))
	await contract.methods.balanceOf(adminAccount).call().then(bal => console.log('Admin ticket balance:', bal))
	await contract.methods.balanceOf(destAccount).call().then(bal => console.log('Second account ticket balance:', bal))

	console.log('\nTransferring tickets...')
	const receipt = await transferTickets(adminAccount, destAccount, privateKey, 1, 1250, contract).then(tx => {
		console.log(tx)
	}).catch(error => {
		console.log('-----TRANSACTION ERROR-----')
		console.log(error)
	})
	console.log('Transfer complete!\n')
	await contract.methods.balanceOf(adminAccount).call().then(bal => console.log('Admin ticket balance:', bal))
	await contract.methods.balanceOf(destAccount).call().then(bal => console.log('Second account ticket balance:', bal))
}

// run()

module.exports.deployContract = deployContract
module.exports.transferTickets = transferTickets