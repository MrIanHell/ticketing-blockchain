var Tx = require('ethereumjs-tx') // Used to sign transactions
const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')

const account1 = '0x3590aca93338b0721966a8d0c96ebf2c4c87c544'
const account2 = '0x8cc5a1a0802db41db826c2fcb72423744338dcb0'

// Send ether from account1 to account2 (they must be unlocked)
// web3.eth.sendTransaction({ from: account1, to: account2, value: web3.utils.toWei('1', 'ether')});

const privateKey1 = Buffer.from(process.env.PRIVATE_KEY_1, 'hex') // Converting to binary using a buffer
const privateKey2 = Buffer.from(process.env.PRIVATE_KEY_2, 'hex')

// Send ether from account1 to account2 and sign the tx
web3.eth.getTransactionCount(account1, (err, txCount) => {
	// 1. Build the transaction (txObject values all have to be hexadecimal)
	const txObject = {
		nonce: web3.utils.toHex(txCount), // The account's tx count (safeguard that prevents the double spend problem) - first tx is 0, second 1 etc.
		to: account2,
		value: web3.utils.toHex(web3.utils.toWei('3', 'ether')),
		gasLimit: web3.utils.toHex(21000), // Typical gasLimit value
		gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei'))
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