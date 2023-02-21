// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract myToken is Context, ERC20 {
    constructor () ERC20("SimpleToken", "SIMP") {
        _mint(msg.sender, 10000000 * (10 ** uint256(decimals())));
    }
}

/*
500
500000000000000000000

10
10000000000000000000

5000
5000000000000000000000

0.01
10000000000000000
*/