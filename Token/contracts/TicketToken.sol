pragma solidity ^0.4.2;

contract TicketToken{
	// state variables (variables accessible to the entire contract and written to disk on the blockchain)
	string public name; 
	string public symbol = 'TCK';
	string public standard = 'Ticket Token v1.0';
	uint256 public totalSupply;
	uint256 public faceValue; // Price in pennies as Solidity doesn't support floating point numbers
	mapping(address => uint256) public balanceOf;
	mapping(address => mapping(address => uint256)) public allowance;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);
	event Approval(address indexed _owner, address indexed _spender, uint256 _value);

	constructor(string _eventName, uint256 _initialSupply, uint256 _faceValue) public {
		name = _eventName;
		balanceOf[msg.sender] = _initialSupply;
		totalSupply = _initialSupply;
		faceValue = _faceValue;
	}


	function transfer(address _to, uint256 _value) public returns(bool success) {
		require(balanceOf[msg.sender] >= _value); // Raise exception if account doesn't have sufficient funds

		// Transfer balance
		balanceOf[msg.sender] -= _value;
		balanceOf[_to] += _value;

		emit Transfer(msg.sender, _to, _value);

		return true;
	}


	function approve(address _spender, uint256 _value) public returns(bool success) {
		allowance[msg.sender][_spender] = _value; // Update the allowance _spender has from owner

		emit Approval(msg.sender, _spender, _value);

		return true;
	}


	function transferFrom(address _from, address _to, uint256 _value) public returns(bool success) {
		require(balanceOf[_from] >= _value);
		require(allowance[_from][msg.sender] >= _value);

		// Update the balances
		balanceOf[_from] -= _value;
		balanceOf[_to] += _value;

		allowance[_from][msg.sender] -= _value; // Deducts the sender allowance from value transferred

		emit Transfer(_from, _to, _value);

		return true;
	}
}