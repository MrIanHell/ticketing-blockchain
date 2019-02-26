const Web3 = require('web3')
const Tx = require('ethereumjs-tx')

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
async function deployContract(account, privateKey, abi, contractData, arguments){
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
 *  contractObject -- Web3 contract object of the token contract in use
 *
 * Returns: Receipt of the transfer transaction broadcast to the blockchain
 */
async function transferTickets(sourceAcc, destAcc, sourcePrivKey, quantity, contractObject){
	const txCount = await web3.eth.getTransactionCount(sourceAcc)

	// Build transaction object
	const txObject = {
		nonce: web3.utils.toHex(txCount),
		gasLimit: web3.utils.toHex(800000),
		gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
		to: contractObject.options.address,
		data: contractObject.methods.transfer(destAcc, quantity).encodeABI()
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
const data = '0x60806040526040805190810160405280600c81526020017f5469636b657420546f6b656e00000000000000000000000000000000000000008152506000908051906020019061004f92919061017a565b506040805190810160405280600381526020017f54434b00000000000000000000000000000000000000000000000000000000008152506001908051906020019061009b92919061017a565b506040805190810160405280601181526020017f5469636b657420546f6b656e2076312e30000000000000000000000000000000815250600290805190602001906100e792919061017a565b503480156100f457600080fd5b50604051604080610e03833981018060405281019080805190602001909291908051906020019092919050505081600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508160038190555080600481905550505061021f565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106101bb57805160ff19168380011785556101e9565b828001600101855582156101e9579182015b828111156101e85782518255916020019190600101906101cd565b5b5090506101f691906101fa565b5090565b61021c91905b80821115610218576000816000905550600101610200565b5090565b90565b610bd58061022e6000396000f3006080604052600436106100a4576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806306fdde03146100a9578063095ea7b31461013957806318160ddd1461019e57806323b872dd146101c957806344fd9caa1461024e5780635a3b7e421461027957806370a082311461030957806395d89b4114610360578063a9059cbb146103f0578063dd62ed3e14610455575b600080fd5b3480156100b557600080fd5b506100be6104cc565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156100fe5780820151818401526020810190506100e3565b50505050905090810190601f16801561012b5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561014557600080fd5b50610184600480360381019080803573ffffffffffffffffffffffffffffffffffffffff1690602001909291908035906020019092919050505061056a565b604051808215151515815260200191505060405180910390f35b3480156101aa57600080fd5b506101b361065c565b6040518082815260200191505060405180910390f35b3480156101d557600080fd5b50610234600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610662565b604051808215151515815260200191505060405180910390f35b34801561025a57600080fd5b506102636108d1565b6040518082815260200191505060405180910390f35b34801561028557600080fd5b5061028e6108d7565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156102ce5780820151818401526020810190506102b3565b50505050905090810190601f1680156102fb5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561031557600080fd5b5061034a600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610975565b6040518082815260200191505060405180910390f35b34801561036c57600080fd5b5061037561098d565b6040518080602001828103825283818151815260200191508051906020019080838360005b838110156103b557808201518184015260208101905061039a565b50505050905090810190601f1680156103e25780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b3480156103fc57600080fd5b5061043b600480360381019080803573ffffffffffffffffffffffffffffffffffffffff16906020019092919080359060200190929190505050610a2b565b604051808215151515815260200191505060405180910390f35b34801561046157600080fd5b506104b6600480360381019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff169060200190929190505050610b84565b6040518082815260200191505060405180910390f35b60008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156105625780601f1061053757610100808354040283529160200191610562565b820191906000526020600020905b81548152906001019060200180831161054557829003601f168201915b505050505081565b600081600660003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925846040518082815260200191505060405180910390a36001905092915050565b60035481565b600081600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054101515156106b257600080fd5b81600660008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020541015151561073d57600080fd5b81600560008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555081600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254019250508190555081600660008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825403925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a3600190509392505050565b60045481565b60028054600181600116156101000203166002900480601f01602080910402602001604051908101604052809291908181526020018280546001816001161561010002031660029004801561096d5780601f106109425761010080835404028352916020019161096d565b820191906000526020600020905b81548152906001019060200180831161095057829003601f168201915b505050505081565b60056020528060005260406000206000915090505481565b60018054600181600116156101000203166002900480601f016020809104026020016040519081016040528092919081815260200182805460018160011615610100020316600290048015610a235780601f106109f857610100808354040283529160200191610a23565b820191906000526020600020905b815481529060010190602001808311610a0657829003601f168201915b505050505081565b600081600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000205410151515610a7b57600080fd5b81600560003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828254039250508190555081600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a36001905092915050565b60066020528160005260406000206020528060005260406000206000915091505054815600a165627a7a72305820f43cdd01636345dcc7138c1fed5c94107d38e811649382405bd3a073cb14ac820029'
const contractAbi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"faceValue","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"standard","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_initialSupply","type":"uint256"},{"name":"_faceValue","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approval","type":"event"}]

const run = async () => {
	const contract = await deployContract(adminAccount, privateKey, contractAbi, data, [1000000, 40])
	const contractAddress = contract.options.address
	console.log('Contract Address:', contractAddress)

	await contract.methods.totalSupply().call().then(val => console.log('Total Supply of tickets:', val))
	await contract.methods.faceValue().call().then(val => console.log('Tiket face value: £' + val))
	await contract.methods.balanceOf(adminAccount).call().then(bal => console.log('Admin ticket balance:', bal))
	await contract.methods.balanceOf(destAccount).call().then(bal => console.log('Second account ticket balance:', bal))
	
	console.log('\nTransferring tickets...')
	const receipt = await transferTickets(adminAccount, destAccount, privateKey, 900, contract)
	console.log('Transfer complete!\n')
	await contract.methods.balanceOf(adminAccount).call().then(bal => console.log('Admin ticket balance:', bal))
	await contract.methods.balanceOf(destAccount).call().then(bal => console.log('Second account ticket balance:', bal))
}

run()
