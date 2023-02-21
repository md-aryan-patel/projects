// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

error ICOStats(bytes message);

contract ICO {

    uint256 counter;
    uint256 decimals = (10**18);
    address Owner;

    constructor(
        address _token,
        address _owner,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _pricePerToken
    ) {
        Owner = msg.sender;
        counter++;
        require(/*_startTime >= block.timestamp && */ _endTime > _startTime && _pricePerToken != 0, "err:1");
        providers = tokenProviders(ERC20(_token), _owner, _startTime, _endTime, _pricePerToken);
    }

    struct tokenProviders {
        ERC20 token;
        address owner;
        uint256 startTime;
        uint256 endTime;
        uint256 pricePerToken;
    }

    tokenProviders providers;

    function addToken(uint256 _amount) public payable returns(uint256){
        require(msg.sender == providers.owner);
        providers.token.transferFrom(msg.sender, address(this), _amount);
        return providers.token.balanceOf(address(this));
    }

    function invest() public payable returns(uint256 tokenRequire){        
        // require(block.timestamp >= providers.startTime, "ICO not began yet");
        // require(block.timestamp <= providers.endTime, "ICO ended");
        uint256 currAmount = providers.token.balanceOf(address(this));
        require(currAmount > 0, "Insufficient Balance");
        tokenRequire = (msg.value / providers.pricePerToken) * decimals;
        
        if(tokenRequire > currAmount) {
            uint256 tokenAmounInEth = (providers.pricePerToken * currAmount) / decimals;
            uint256 transferAmount = msg.value - tokenAmounInEth;
            payable(providers.owner).transfer(transferAmount);
            providers.token.transfer(msg.sender, currAmount);
            payable(msg.sender).transfer(msg.value - transferAmount);
        } else {
            uint256 transferAmount = (providers.pricePerToken * tokenRequire ) / decimals;
            require(msg.value >= transferAmount, "Err:fee not paid");
            payable(providers.owner).transfer(msg.value);
            providers.token.transfer(msg.sender, tokenRequire);
        }
    }

    function withdrawFunds() public {
        require(msg.sender == providers.owner);
        require(providers.token.balanceOf(address(this)) > 0);
        // require(providers.startTime > block.timestamp || providers.endTime < block.timestamp, "ICO has started");
        providers.token.transfer(msg.sender, providers.token.balanceOf(address(this)));
    }
}