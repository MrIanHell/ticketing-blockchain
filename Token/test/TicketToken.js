var TicketToken = artifacts.require("./TicketToken.sol")

contract('TicketToken', function(accounts) {
	var tokenInstance
	var account1 = web3.eth.accounts.create().address

	it('initialises the contract with the correct values', function(){
		return TicketToken.deployed().then(function(instance) {
			tokenInstance = instance
			return tokenInstance.name()
		}).then(function(name) {
			assert.equal(name, 'Ticket Token', 'has the correct name')
			return tokenInstance.symbol()
		}).then(function(symbol) {
			assert.equal(symbol, 'TCK', 'has the correct symbol')
			return tokenInstance.standard()
		}).then(function(standard) {
			assert.equal(standard, 'Ticket Token v1.0', 'has the correct standard')
		})
	})

	it('allocates the initial supply upon deployment', function() {
		return TicketToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply()
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000')
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account')
		})
	})

	it('transfers token ownership', function() {
		return TicketToken.deployed().then(function(instance) {
			tokenInstance = instance
			return tokenInstance.transfer.call(account1, 1000000000)
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('run Out of Gas') >= 0, 'error message must contain run out of gas')
			return tokenInstance.transfer.call(account1, 300000, { from: accounts[0] })
		}).then(function(success) {
			assert.equal(success, true, 'it returns true')
			return tokenInstance.transfer(account1, 300000, { from: accounts[0] })
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event')
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event')
			assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from')
			assert.equal(receipt.logs[0].args._to, account1, 'logs the account the tokens are transferred to')
			assert.equal(receipt.logs[0].args._value, 300000, 'logs the transfer amount')
			return tokenInstance.balanceOf(account1)
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 300000, 'adds the amount to the receiving account')
			return tokenInstance.balanceOf(accounts[0])
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 700000, 'deducts the amount from the sending account')
		})
	})
})