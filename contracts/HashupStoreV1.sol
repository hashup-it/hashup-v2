// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "./HashupCartridge.sol";

import "hardhat/console.log";

/// @title Hashup Multimarketplace Store
/// @author The name of the author
/// @notice Explain to an end user what this does
/// @dev Explain to a developer any extra details
contract HashupStoreV1 is
    Initializable,
    PausableUpgradeable,
    OwnableUpgradeable
{
    // Sale consists of price in ERC20 token and percent of sale that goes to marketplace
    struct SaleInformation {
        uint256 price;
        uint256 marketplaceFee;
    }

    event Bought(
        address license,
        uint256 price,
        uint256 amount,
        address referrer
    );

    event NewSale(
        address license,
        string symbol,
        string name,
        string color,
        uint256 price,
        string metadata,
        uint256 totalSupply,
        uint256 transferFee,
        uint256 marketplaceFee
    );

    event PriceChanged(address license, uint256 newPrice);

    // Whitelist of addresses that are elgible to take marketplace fee
    mapping(address => bool) private _marketWhitelist;

    //
    mapping(address => SaleInformation) private _licenseSales;

    uint256 hashupFee = 5;

    function initialize() public initializer {
        _transferOwnership(msg.sender);
    }

    // Used to toggle state of Pausable contract
    function togglePause() public onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }

    // NOTE: We need to discuss whether we have right to disable whitelist
    function toggleWhitelisted(address marketplace) public onlyOwner {
        _marketWhitelist[marketplace] = !_marketWhitelist[marketplace];
    }

    modifier onlyWhitelisted(address marketplace) {
        _checkWhitelisted(marketplace);
        _;
    }

    // Returns whether address is whitelisted marketplace
    function _checkWhitelisted(address marketplace) public view returns (bool) {
        require(
            _marketWhitelist[marketplace] == true,
            "HashupStore: marketplace must be whitelisted."
        );
    }

    modifier onlyCartridgeCreator(address cartridge) {
        _checkCartridgeCreator(cartridge);
        _;
    }

    function _checkCartridgeCreator(address license) internal view {
        require(
            msg.sender == HashupCartridge(license).owner(),
            "HashupStore: must be Cartridge creator."
        );
    }

    function sendLicenseToStore(
        address cartridge,
        uint256 price,
        uint256 amount,
        uint256 marketplaceFee
    ) public onlyCartridgeCreator(cartridge) whenNotPaused {

		console.log(cartridgePrices[cartridgeAddress]);

		require(
			_licenseSales[cartridgeAddress] == true,
			"HashupStore: Can't set for sale second time"
		);
	}

    function withdrawCartridges(address license, uint256 _amount)
        external
        onlyCartridgeCreator(license)
    {}

    function getCartridgePrice(address license) public view returns (uint256) {
        return _licenseSales[license].price;
    }

    function getCartridgeMarketplaceFee(address license)
        public
        view
        returns (uint256)
    {
        return _licenseSales[license].marketplaceFee;
    }

    function changeCartridgePrice(address license, uint256 newPrice)
        public
        onlyCartridgeCreator(license)
    {}

    function distributePayment(
        uint256 totalValue,
        uint256 hashupFee,
        uint256 marketplaceFee
    )
        internal
        pure
        returns (
            uint256 toCreator,
            uint256 toMarketplace,
            uint256 toHashup
        )
    {
        
        // Split provided price between HashUp, marketplace and Cartridge creator
        uint256 hashupPart = (totalValue * hashupFee) / 100;
        uint256 marketplacePart = (totalValue * marketplaceFee) / 100;
        uint256 creatorPart = totalValue - hashupPart - marketplacePart;

        return (creatorPart, marketplacePart, hashupPart);
    }

    function buyCartridge(
        address cartridge,
        uint256 amount,
        address marketplace,
        address referrer
    ) public whenNotPaused onlyWhitelisted(marketplace) {

	}
}
