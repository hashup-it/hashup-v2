# HashupProtocolV2
This is documentation for HashupLicense and HashupStoreV2 smart contracts. 


## Documentation
* [What is HashUp Protocol](#what-is-hashupprotocol)
  - [Deployment addresses](#deployment-addresses)
* [Publishing a license](#publishing-a-license)
	- [Prerequisites](#prerequisites)
	- [Deploying License](#deploying-a-license)
* [Buying a license](#buying-a-license)
* [Code overview](#code-overview)

## What is HashupProtocol
-------------------------------------

### License
-------------------------------------

### Marketplace
-------------------------------------

### HashupStore
-------------------------------------

### Whitelist
This is list of all Marketplaces accepted by HashUp in our Store contract. If you want your own marketplace contact us.

| Name     | Network | Address                                      | Status      |
|:---------|:--------|:---------------------------------------------|:------------|
| Hashup   | Polygon | insert   | OK          |
| Partner2 | Polygon | insert   | OK          |

### Deployment addresses
| Newtork | ChainID | Address                                      |
|:--------|:--------|:---------------------------------------------|
| Polygon | 137     | insert   |
| Mumbai  | 80001   | insert   |

## Publishing a License

At first game publisher must deploy `HashupLicense.sol` contract, then approve our store to use it and evoke [sendLicenseToStore()](#sendlicensetostore) function. To ensure that process is correct we encourage to use [https://gamecontract.io/](https://gamecontract.io/) - our license deployment and management platform. 

## Buying a License

To buy games via our protocol you need sufficient amount of paymentToken - you can check its address by using [getPaymentToken()](#getpaymenttoken) function. Currently it's USDC on Polygon, but it may change later. Then you need to approve 



## Code overview
```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.17
```
### Dependencies

Initializers instead of constructors are used in upgradeable contracts, so we need this:
```solidity 
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
```

Pausing the contract:
```solidity 
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
```

Ownership mechanism:
```solidity 
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
```

To interact with IERC20 :
```solidity 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
```

To interact with HashupLicense:
```solidity 
import "./HashupLicense.sol";
```

### Events

#### NewSale
This event is emitted after every sale through [sendLicenseToStore(address, uint256, uint256, uint256)](#withdraw) function.  It contains useful data about listed License, so you we can only listen for this event and get all data we need. 
```solidity
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
```

#### Bought
This event is emitted after every sale through [buyLicense(address, uint256, address, address)](#withdraw) function.
```solidity
 event Bought(
    address license,
    uint256 price,
    uint256 amount,
    address referrer
);
```

#### PriceChanged
Emitted after every change of price using [changeLicensePrice(address license, uint256 newPrice)](#withdraw) function
```solidity
event PriceChanged(
    address license,
    uint256 newPrice
) 
```

#### Withdrawal
Emitted after every withdrawal using [withdrawLicenses(address license, uint256 amount)](#withdraw) function
```solidity
event Withdrawal(
    address license,
    uint256 amount
) 
```

### Mappings

Maps address of license contract to information about its sale. License must be here to be sold in protocol.
```solidity
mapping(address => SaleInformation) private _licenseSales;
```

Indicates whether address is whitelisted and elgible to take marketplace fee in ```buyLicense``` function
```solidity
mapping(address => bool) private _marketWhitelist;
```

### Constants
Maximum value that can go to marketplace, used to calculate revenue ratio of creator and marketplace
```solidity
uint256 constant MAX_MARKETPLACE_FEE = 90;
```

Maximum value that HashUp can operate on, in future will be used to calculate how much goes to buyback&burn and HashUp
```solidity
uint256 constant MAX_HASHUP_FEE = 10;
```
### Variables
Stores how much % of sale will go to the HashUp, ```_hashupFee``` - ```HASHUP_MAX_FEE``` will go to buyback&burn in future
```solidity
uint256 private _hashupFee;
```
Stores ERC20 contract address that is used to pay for Licenses in store
```solidity
address private _paymentToken;
```
### Structs
#### SaleInformation
This struct stores all information about specific License sale
```solidity 
struct SaleInformation {
    uint256 price; // Price of unit per paymentToken 
    uint256 marketplaceFee; // Percent of sale that goes to the Marketplace 
    bool sale; // Whether game has already been put on sale or not 
}
```

### Public functions

#### sendLicenseToStore
```solidity
function sendLicenseToStore(
    address license,
    uint256 price,
    uint256 amount,
    uint256 marketplaceFee
) public onlyLicenseCreator(license) whenNotPaused
```
Function lists license for sale with provided data. It emits [New Sale](#newsale) event.

Requirements:
- Must be license creator
- Contract must not be paused
- You must have at least `amount` of licenses and approve store to use it
- `marketplaceFee` must be lower or equal to `MAX_MARKETPLACE_FEE`
- License must have not been listed before

#### buyLicense
```solidity
function buyLicense(
    address license,
    uint256 amount,
    address marketplace,
    address referrer
) public whenNotPaused onlyWhitelisted(marketplace)
```
Fuction that exchanges your payment token for licenses. If you want to buy 1.00 license you must provide amount with number 100. Marketplace should be address of wallet of front-end provider of store, it must be approved by HashUp first. If you want to buy game by interacting smart contract by yourself just provide it with any address from [whitelist](#whitelist). It emits [Bought](#bought) event.

Requirements:
- Marketplace must be on whitelist
- Contract must not be paused
- You must have at least `amount` * `(price of license unit)`  of payment token and approve store to use it 
- License must be listed in store

#### changeLicensePrice

```solidity 
function changeLicensePrice(address license, uint256 newPrice)
    public
    onlyLicenseCreator(license)
```
Changes price of License. Its price for 1 unit of license so you are basically providing price per 0.01 license. If you want to set price for 1 license 
you must multiply your newPrice argument by 100. It emits [PriceChanged](#pricechanged) event.

Requirements:
- Must be license creator
- License must be already listed in store via `sendLicenseToStore()` function

#### withdrawLicenses

```solidity 
function withdrawLicenses(address license, uint256 amount)
    external
    onlyLicenseCreator(license)
    returns (uint256)
```
This function transfers specific licenses from store to sender. If amount provided is bigger that contract balance it will transfer all remaining licenses. It emits [Withdrawal](#withdrawal) event.

Requirements:
- Must be license creator

#### toggleWhitelisted

```solidity 
function toggleWhitelisted(address marketplace) public onlyOwner
```
It toggles marketplace whitelist on or off. If marketplace is not whitelisted it will whitelist it.

Requirements:
- Must be contract owner

#### setPaymentToken

```solidity 
function setPaymentToken(address newPaymentToken) public onlyOwner
```
It changes address of token that is used for license payments in this contract. Make sure its `ERC20` compatible.

Requirements:
- Must be contract owner

#### setHashupFee

```solidity 
function setHashupFee(uint256 newHashupFee) public onlyOwner
```
It changes address of token that is used for license payments in this contract. Make sure its `ERC20` compatible.

Requirements:
- Must be contract owner
- `newHashupFee` must be lower or equal to `MAX_HASHUP_FEE`

#### togglePause

```solidity 
function togglePause() public onlyOwner
```
Toggles whether contract is paused on and off

Requirements:
- Must be contract owner

#### getLicensePrice
```solidity
function getLicensePrice(address license) public view returns (uint256)
```
Returns price of specific license.


#### getPaymentToken
```solidity
function getPaymentToken() external view returns (address)
```
Returns current payment token address


#### getLicenseMarketplaceFee
```solidity
function getLicenseMarketplaceFee(address license) public view returns (uint256)
```
Returns marketplace fee of specific license.


#### isWhitelisted
```solidity 
function isWhitelisted(address marketplace) public view returns (bool)
```
Returns whether address is whitelisted to be marketplace
