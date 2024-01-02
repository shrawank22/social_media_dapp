// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./DataTypes.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract PostBase {
    mapping(uint256 => DataTypes.Post) public posts;

    // Counters
    using Counters for Counters.Counter;
    Counters.Counter public postCounter;
    Counters.Counter public commentCounter;
    Counters.Counter public reportCounter;
    
    // Any other shared functionalities related to posts can be added here
}

