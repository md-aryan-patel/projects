// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error ICOStats(bytes message);

contract ICO {
    uint256 counter;

    struct tokenProviders {
        IERC20 token;
        address owner;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        uint256 pricePerToken;
    }

    mapping (uint256 => tokenProviders) providers;
    mapping (address => uint256) toProvider;
    mapping (address => mapping(uint256 => uint256)) public investorsAmount;
    mapping (address => mapping(address => uint256)) public providersAmount;
    
    function createIco(
        address _token,
        uint256 _amount,
        uint256 _startTime,
        uint256 _endTime, 
        uint256 _pricePerToken
    ) public {
        counter++;
        require(_amount <= IERC20(_token).balanceOf(msg.sender) && _startTime > 0 && _endTime > _startTime && _pricePerToken != 0);
        providers[counter] = tokenProviders(IERC20(_token), msg.sender, _amount, _startTime, _endTime, _pricePerToken);
        IERC20(_token).approve(address(this), _amount);
        toProvider[msg.sender] = counter;
    }

    function invest(uint256 icoNum, uint256 _tokenAmount) public {
        if(block.timestamp < providers[icoNum].startTime) {
            revert ICOStats({
                message: "ICO not yet began"
            });
        }

        if(block.timestamp > providers[icoNum].endTime) {
            revert ICOStats({
                message: "ICO has ended"
            });
        }
        require(_tokenAmount > 0, "error: Purchase amount should be greater then 0");
        require(providers[icoNum].owner != address(0), "error: ICO dosent exist");
        require(providers[icoNum].amount != 0, "error: Tokens are sold");

        uint256 transferAmount = providers[icoNum].pricePerToken * _tokenAmount;
        
        providersAmount[providers[icoNum].owner][msg.sender] += transferAmount;
        investorsAmount[msg.sender][icoNum] += _tokenAmount;
        providers[icoNum].amount -= _tokenAmount;
    }

    function withdraw(uint256 icoNum) public payable {
        tokenProviders memory current = providers[icoNum];
        
        require(block.timestamp < current.startTime || block.timestamp > current.endTime, "Your ICO has began");
        require(current.token.allowance(msg.sender, address(this)) <= investorsAmount[msg.sender][icoNum], "Withdrawal amount is too high");
        require(investorsAmount[msg.sender][icoNum] > 0, "No tokens to withdraw");

        current.token.transferFrom(current.owner, msg.sender, investorsAmount[msg.sender][icoNum]);
        current.owner.call{value: providersAmount[current.owner][msg.sender]};
        investorsAmount[msg.sender][icoNum] = 0;
        providersAmount[current.owner][msg.sender] = 0;
    }

    function getTimestamp() public view returns(uint256) {
        return block.timestamp + 120;
    }

    function getTimestamp2() public view returns(uint256) {
        return block.timestamp + 240;
    }

}