var TicketToken = artifacts.require("./TicketToken.sol");

module.exports = function(deployer) {
  deployer.deploy(TicketToken, 1000000);
};
