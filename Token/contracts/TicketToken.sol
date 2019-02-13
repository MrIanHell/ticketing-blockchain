pragma solidity ^0.4.2;

contract TicketToken{
	// state variables (variables accessible to the entire contract and written to disk on the blockchain)
	string public name = 'Ticket Token'; 
	string public symbol = 'TCK';
	string public standard = 'Ticket Token v1.0';
	uint256 public totalSupply;
	
	mapping(address => uint256) public balanceOf;

	event Transfer( address indexed _from, address indexed _to, uint256 _value);

	constructor(uint256 _initialSupply) public { // convention to use underscores for local variables
		balanceOf[msg.sender] = _initialSupply;
		totalSupply = _initialSupply;
	}


	function transfer(address _to, uint256 _value) public returns(bool success) {
		// Raise exception if account doesn't have sufficient funds
		require(balanceOf[msg.sender] >= _value); 

		// Transfer balance
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;

		// Triggers the Transfer Event
		emit Transfer(msg.sender, _to, _value);

		// Returns a true boolean if all of the code above executes successfully
		return true;
	}
}