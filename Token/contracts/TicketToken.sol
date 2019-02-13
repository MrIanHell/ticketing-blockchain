pragma solidity ^0.4.2;

contract TicketToken{
	// Basics for smart contract:
	// Constructor
	// Set the total number of tokens
	// Read the total number of tokens

	uint256 public totalSupply; // state variable (variable accessible to the entire contract and written to disk on the blockchain)

	function TicketToken() public {
		totalSupply = 1000000;
	}
}