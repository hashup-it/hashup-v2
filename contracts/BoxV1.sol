// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BoxV1 is Initializable {
    uint256 public x;
	uint256[19] __gap;

    function initialize(uint256 _x) public initializer {
        x = _x;
    }

    function increase() public {
        x = x + 1;
    }
}