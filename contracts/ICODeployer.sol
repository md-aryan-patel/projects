// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ICO.sol";

contract ICODeployer {

    uint256 counter;
    mapping(uint256 => address) icoAddress;
    
    event CreateICO(
        address icoAddress, 
        uint256 icoNumber
    );

    function deploy_ico( 
        address _token,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _pricePerToken
    ) public {
        counter++;
        ICO ico = new ICO(_token, msg.sender, _startTime, _endTime, _pricePerToken);
        icoAddress[counter] = address(ico);
        emit CreateICO(address(ico), counter);
    }

    function getCounter() public view returns(uint256) {
        return counter;
    }
}