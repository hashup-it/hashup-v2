// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BoxV2 is Initializable {
    uint256 public x;
    uint256 public y;
    uint256[18] __gap;

    function initialize() public initializer {}

    function performUpgradeForY(uint256 _y) public initializer {
        y = _y;
    }

    function increase() public {
        x = x + 1;
    }
}
