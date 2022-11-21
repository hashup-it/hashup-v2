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

### License

### Marketplace

### HashupStore


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

### Prerequisites

### Deploying a License

### License approval

### Listing License in HashupStore

## Buying a License

### Payment token approval

### Payment and 


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

### Constants

### Variables

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

#### withdraw

### Internal functions
