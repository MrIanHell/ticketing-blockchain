var TicketToken = artifacts.require("./TicketToken.sol")

contract('TicketToken', function(accounts) {
	var tokenInstance
	var account1 = web3.eth.accounts.create().address
	var account2 = web3.eth.accounts.create().address

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

	it('approves tokens for delegated transfer', function() {
		return TicketToken.deployed().then(function(instance) {
			tokenInstance = instance
			return tokenInstance.approve.call(account1, 100)
		}).then(function(success) {
			assert.equal(success, true, 'it returns true')
			return tokenInstance.approve(account1, 100, { from: accounts[0] })
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event')
			assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event')
			assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorised by')
			assert.equal(receipt.logs[0].args._spender, account1, 'logs the account the tokens are authorised to')
			assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount')
			return tokenInstance.allowance(accounts[0], account1)
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer')
		})
	})

	it('handles delegated token ownership transfer', function() {
		return TicketToken.deployed().then(function(instance) {
			tokenInstance = instance
			return tokenInstance.approve(accounts[0], 10, { from: accounts[0] })
		}).then(function(receipt) {
			return tokenInstance.transferFrom(accounts[0], account2, 10000000, { from: accounts[0] })
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >=0, 'cannot transfer value larger than balance')
      		return tokenInstance.transferFrom(accounts[0], account2, 20, { from: accounts[0] })
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >=0, 'cannot transfer value larger than approved amount')
			return tokenInstance.transferFrom.call(accounts[0], account2, 10, { from: accounts[0] })
		}).then(function(success) {
			assert.equal(success, true)
			return tokenInstance.transferFrom(accounts[0], account2, 10, { from: accounts[0] })
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, 'triggers one event')
			assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event')
			assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from')
			assert.equal(receipt.logs[0].args._to, account2, 'logs the account the tokens are transferred to')
			assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount')
			return tokenInstance.balanceOf(accounts[0])
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 699990, 'deducts the amount from the sending account')
			return tokenInstance.balanceOf(account2)
		}).then(function(balance) {
			assert.equal(balance.toNumber(), 10, 'adds the amount from the receiving account')
			return tokenInstance.allowance(accounts[0], accounts[0])
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 0, 'deducts the amount from the allowance')
		})
	})
})