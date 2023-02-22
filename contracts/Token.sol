// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Tokens is ERC20 {
    uint256 public cap;
    address Owner;
    uint256 taxPercentage;
    uint256 mintAmount;

    
    constructor(uint256 _amount) ERC20("test", "TST") {
        cap = _amount;
        Owner = msg.sender;
        taxPercentage = 10; 
    }

    modifier onlyOwner {
        require(msg.sender == Owner, "Access to only Owner");
        _;
    }

    mapping(address => bool) exemptedAccounts;
    mapping(address => uint256) spent;

    function setExemptedAccount(address acc) public onlyOwner {
        exemptedAccounts[acc] = true;
    }

    function mint() public payable  {
        // require(msg.value > 0.1 ether, "Investment amount is low");
        // require(msg.value <= 2 ether, "Investement amount is too high"); 
        
        mintAmount = (msg.value * 10000000);
        
        require((totalSupply() + mintAmount) <= cap, "error: 1");
        require(spent[msg.sender] + msg.value <= 2 ether, "error: 2");

        _mint(msg.sender, mintAmount);
        spent[msg.sender] += msg.value;
    }

    function transfer(address _to, uint256 _amount) public override returns(bool)  {
        uint256 taxAmount;
        if(exemptedAccounts[msg.sender] == false) {
            taxAmount = (taxPercentage * _amount)/100;
            _amount -= taxAmount;
        }
        _transfer(msg.sender, _to, _amount);
        if(taxAmount > 0)
            _burn(msg.sender, taxAmount);
        return true;
    }

    function burn(uint256 _amount) public {
        uint256 transferAmount = _amount / 10000000;
        payable(msg.sender).transfer(transferAmount);
        _burn(msg.sender, _amount);
    }
}