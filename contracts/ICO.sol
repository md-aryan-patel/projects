// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error ICOStats(bytes message);

contract ICO {

    uint256 counter;
    uint256 decimals = 18;

    struct tokenProviders {
        ERC20 token;
        address owner;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 pricePerToken;
    }

    mapping (uint256 => tokenProviders) public providers;

    function createIco(
        address _token,
        uint256 _amount,
        uint256 _startTime,
        uint256 _endTime, 
        uint256 _pricePerToken
    ) public returns(uint256){
        counter++;
        require(/*_startTime >= block.timestamp && */ _endTime > _startTime && _pricePerToken != 0, "err:1");
        providers[counter] = tokenProviders(ERC20(_token), msg.sender, _amount, _startTime, _endTime, _pricePerToken);
        ERC20(_token).transferFrom(msg.sender,address(this), _amount);
        return counter;
    }

    function invest(uint256 icoNum) public payable returns(uint256){
        tokenProviders memory current = providers[icoNum]; 
        
        require(block.timestamp >= current.startTime, "ICO not began yet");
        require(block.timestamp <= current.endTime, "ICO ended");
        uint256 tokenRequire = (msg.value / current.pricePerToken) * (10**18);
        
        if(tokenRequire > current.amount) {
            uint256 tokenAmounInEth = (providers[icoNum].pricePerToken * current.amount) / (10**18);
            uint256 transferAmount = msg.value - tokenAmounInEth;
            payable(current.owner).transfer(transferAmount);
            current.token.transfer(msg.sender, current.amount);
            payable(msg.sender).transfer(msg.value - transferAmount);
            current.amount = 0;
        } else {
            uint256 transferAmount = (providers[icoNum].pricePerToken * tokenRequire ) / (10**18);
            require(msg.value >= transferAmount, "Err:fee not paid");
            payable(providers[icoNum].owner).transfer(msg.value);
            providers[icoNum].token.transfer(msg.sender, tokenRequire);
            current.amount = current.amount - tokenRequire;
        }
        return current.amount;
    }
}