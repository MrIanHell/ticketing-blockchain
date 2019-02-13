pragma solidity ^0.4.2;

contract TicketToken{

	// state variables (variables accessible to the entire contract and written to disk on the blockchain)
	string public name = 'Ticket Token'; 
	string public symbol = 'TCK';
	string public standard = 'Ticket Token v1.0';
	uint256 public totalSupply; 

	mapping(address => uint256) public balanceOf;

	constructor(uint256 _initialSupply) public { // convention to use underscores for local variables
		balanceOf[msg.sender] = _initialSupply;
		totalSupply = _initialSupply;
	}
}