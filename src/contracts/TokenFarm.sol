// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm {
  // state variables (stored on-chain)
  string public name = "Dapp Token Farm"; // contract name
  DappToken public dappToken; // Fictional token name
  DaiToken public daiToken;   // Fictional staking token name - test environment only
  address public owner;       // Get owner (investor/user)  
  address[] public stakers;   // Create array to keep track of all addresses that have staked

  // mapping is a key/value pair
  mapping(address => uint) public stakingBalance; // Check if investor has staked tokens balance  
  mapping(address => bool) public hasStaked;      // Tell app investor has staked
  mapping(address => bool) public isStaking;      // Determine current staking status

  // function arguments passed into constructor function
  constructor(DappToken _dappToken, DaiToken _daiToken) public {
    dappToken = _dappToken;
    daiToken = _daiToken;
    owner = msg.sender;
  }

  // Stake Tokens (deposit)
  // Transfer tokens from wallet to farm contract
  function stakeTokens(uint _amount) public {
    // Require amount greater than 0
    require(_amount > 0, "amount cannot be 0");

    // Transfer Mock Dai tokens to this contract for staking
    daiToken.transferFrom(msg.sender, address(this), _amount);

    // Update staking balance for user
    stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

    // Add user to sakers array *only* if they have not staked already
    if(!hasStaked[msg.sender]) {
      stakers.push(msg.sender);
    }

    // Update staking status
    isStaking[msg.sender] = true;
    hasStaked[msg.sender] = true;
  }

  // Unstake Tokens (withdraw)
  function unstakeTokens() public {
    // Fetch staking balance
    uint balance = stakingBalance[msg.sender];

    // Require amount greater than 0
    require(balance > 0, "staking balance cannot be 0");

    // Transfer Mock Dai tokens to this contract for staking
    daiToken.transfer(msg.sender, balance);

    // Reset the staking balance
    stakingBalance[msg.sender] = 0;

    // Update staking status
    isStaking[msg.sender] = false;
  }

  // Issue Tokens (find out how many tokens are staked and issue an equal number of farm tokens)
  function issueTokens() public {
    // Only owner can call this function
    require(msg.sender == owner, "caller must be the owner");

    // Loop thru staker array and issue tokens to all stakers
    for(uint i=0; i<stakers.length; i++) {
      address recipient = stakers[i];
      uint balance = stakingBalance[recipient];
      if(balance > 0) {
        dappToken.transfer(recipient, balance);
      }
    }
  }

}
