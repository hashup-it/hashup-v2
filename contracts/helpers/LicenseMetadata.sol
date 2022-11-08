// SPDX-License-Identifier: MIT
// HashUp Contracts V1
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @dev HashUp implementation of ERC20 Metadata that suits Hashuplicense.
 */
contract LicenseMetadata is Ownable {
	// License name
	string private _name;

	// License symbol
	string private _symbol;

	// License color
	string private _color;

	// Other Metadata URL
	string private _metadataUrl;

	/**
	 * @dev Initializes the License Contract and sets
	 * correct color for provided supply and metadata.
	 */
	constructor(
		string memory name_,
		string memory symbol_,
		string memory metadataUrl_,
		uint256 totalSupply_
	) {
		_name = name_;
		_symbol = symbol_;
		_metadataUrl = metadataUrl_;
		_color = _getColorForSupply(totalSupply_);
	}

	/**
	 * @dev Updates current URL to metadata object that stores configuration of visuals,
	 * descriptions etc. that will appear while browsing on HashUp ecosystem.
	 *
	 * NOTE: We use IPFS by default in HashUp.
	 *
	 * Requirements:
	 * - the caller must be creator
	 */
	function setMetadata(string memory newMetadata) public onlyOwner {
		_metadataUrl = newMetadata;
	}

	/**
	 * NOTE: ERC20 Tokens usually use 18 decimal places but our
	 * CEO said it's stupid and we should use 2 decimals
	 */
	function decimals() public pure returns (uint8) {
		return 2;
	}

	/**
	 * @dev Returns the color of license. See {_getColorForSupply}
	 * function for details
	 */
	function color() public view returns (string memory) {
		return _color;
	}

	/**
	 * @dev Returns the name of the license.
	 */
	function name() public view returns (string memory) {
		return _name;
	}

	/**
	 * @dev Returns the symbol of the license.
	 */
	function symbol() public view returns (string memory) {
		return _symbol;
	}

	/**
	 * @dev Returns the URL of other license metadata
	 */
	function metadataUrl() public view returns (string memory) {
		return _metadataUrl;
	}

	/**
	 * @dev Returns License color for specified supply. There are three types
	 * of licenses based on a totalSupply (numbers without including decimals)
	 * 0 - 133.700 => Gold License
	 * 133.701 - 100 000 000 => Gray License
	 * 100 000 001+ => Custom License
	 *
	 * NOTE: Color doesn't affect License Token logic, it's used for display
	 * purposes so we can simplify token economics visually.
	 */
	function _getColorForSupply(uint256 supply)
		private
		pure
		returns (string memory color)
	{
		if (supply <= 133_700 * 10**decimals()) {
			return "gold";
		} else if (supply <= 100_000_000 * 10**decimals()) {
			return "gray";
		}
		return "custom";
	}
}