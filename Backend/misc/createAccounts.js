var Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')

var accounts = []
var account1 = web3.eth.accounts.create()
var account2 = web3.eth.accounts.create()
var account1Obj = web3.eth.accounts.create()

accounts.push(account1.address)
accounts.push(account2.address)
console.log(accounts)

console.log('Account address:', account1Obj.address)
console.log('Account privateKey',  account1Obj.privateKey)