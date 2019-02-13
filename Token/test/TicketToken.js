var TicketToken = artifacts.require("./TicketToken.sol")

contract('TicketToken', function(accounts) {
	var tokenInstance

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
})