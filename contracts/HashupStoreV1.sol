// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./HashupLicense.sol";
import "hardhat/console.sol";

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
        bool sale;
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
    event Withdrawal(address license, uint256 amount);

    // Whitelist of addresses that are elgible to take marketplace fee
    mapping(address => bool) private _marketWhitelist;

    mapping(address => SaleInformation) private _licenseSales;

    uint256 constant MAX_HASHUP_FEE = 10;
    uint256 constant MAX_MARKETPLACE_FEE = 90;

    uint256 private _hashupFee;

    address private _paymentToken;

    function initialize() public initializer {
        _transferOwnership(msg.sender);
        _setHashupFee(10);
        _setPaymentToken(address(0));
    }

    function setHashupFee(uint256 newHashupFee) public onlyOwner {
        _setHashupFee(newHashupFee);
    }

    function _setHashupFee(uint256 newHashupFee) internal {
        require(
            newHashupFee <= MAX_HASHUP_FEE,
            "HashupStore: HashupFee exceeded max limit"
        );
        _hashupFee = newHashupFee;
    }

    function getHashupFee() external view returns (uint256) {
        return _hashupFee;
    }

    function getPaymentToken() external view returns (address) {
        return _paymentToken;
    }

    function setPaymentToken(address newPaymentToken) public onlyOwner {
        _setPaymentToken(newPaymentToken);
    }

    function _setPaymentToken(address newPaymentToken) internal {
        _paymentToken = newPaymentToken;
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
    function _checkWhitelisted(address marketplace) internal  {
        require(
            _marketWhitelist[marketplace] == true,
            "HashupStore: marketplace must be whitelisted."
        );
    }

    function isWhitelisted(address marketplace) public view returns (bool) {
        return _marketWhitelist[marketplace];
    }

    modifier onlyLicenseCreator(address License) {
        _checkLicenseCreator(License);
        _;
    }

    function _checkLicenseCreator(address license) internal view {
        require(
            msg.sender == HashupLicense(license).owner(),
            "HashupStore: must be License creator"
        );
    }

    function sendLicenseToStore(
        address license,
        uint256 price,
        uint256 amount,
        uint256 marketplaceFee
    ) public onlyLicenseCreator(license) whenNotPaused {
        require(
            _licenseSales[license].sale == false,
            "HashupStore: Can't set for sale second time"
        );
        require(marketplaceFee <= MMAX_MARKETPLACE_FEE, "HashupStore: Marketplace fee is too high");

        HashupLicense licenseToken = HashupLicense(license);
        licenseToken.transferFrom(msg.sender, address(this), amount);

        _licenseSales[license] = SaleInformation(price, marketplaceFee, true);

        emit NewSale(
            license,
            licenseToken.symbol(),
            licenseToken.name(),
            licenseToken.color(),
            price,
            licenseToken.metadataUrl(),
            licenseToken.totalSupply(),
            licenseToken.creatorFee(),
            marketplaceFee
        );
    }

    function withdrawLicenses(address license, uint256 amount)
        external
        onlyLicenseCreator(license)
        returns (uint256)
    {
        HashupLicense licenseToken = HashupLicense(license);
        uint256 availableAmount = licenseToken.balanceOf(address(this));

        if (availableAmount >= amount) {
            // Return all licenses
            licenseToken.transfer(msg.sender, amount);
            emit Withdrawal(license, amount);
            return amount;
        } else {
            // Return as much as possible
            licenseToken.transfer(msg.sender, availableAmount);
            emit Withdrawal(license, availableAmount);
            return availableAmount;
        }
    }

    function getLicensePrice(address license) public view returns (uint256) {
        return _licenseSales[license].price;
    }

    function getLicenseMarketplaceFee(address license)
        public
        view
        returns (uint256)
    {
        return _licenseSales[license].marketplaceFee;
    }

    function changeLicensePrice(address license, uint256 newPrice)
        public
        onlyLicenseCreator(license)
    {
        require(_licenseSales[license].sale == true, "HashupStore: License isn't listed in store");
        _licenseSales[license].price = newPrice;
        emit PriceChanged(license, newPrice);
    }

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
        // Split provided price between HashUp, marketplace and License creator
        uint256 hashupPart = (totalValue * hashupFee) / 100;
        uint256 marketplacePart = (totalValue * marketplaceFee) / 100;
        uint256 creatorPart = totalValue - hashupPart - marketplacePart;

        return (creatorPart, marketplacePart, hashupPart);
    }

    function buyLicense(
        address license,
        uint256 amount,
        address marketplace,
        address referrer
    ) public whenNotPaused onlyWhitelisted(marketplace) {
        IERC20 paymentToken = IERC20(_paymentToken);
        HashupLicense licenseToken = HashupLicense(license);

        uint256 totalPrice = getLicensePrice(license) * amount;

        (
            uint256 toCreator,
            uint256 toMarketplace,
            uint256 toHashup
        ) = distributePayment(
                totalPrice,
                _hashupFee,
                getLicenseMarketplaceFee(license)
            );

        // Send licenses from HashupStore to buyer
        licenseToken.transfer(msg.sender, amount);

        // Send payment token to creator
        paymentToken.transferFrom(msg.sender, licenseToken.owner(), toCreator);

        // Send payment token to marketplace
        paymentToken.transferFrom(msg.sender, marketplace, toMarketplace);

        // Send tokens to HashUp
        paymentToken.transferFrom(msg.sender, owner(), toHashup);

        emit Bought(license, totalPrice, amount, referrer);
    }
}
