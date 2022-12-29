import { Contract } from "ethers";
import { ethers, upgrades } from "hardhat";
import { HashupStoreV1, HashupStoreV1__factory } from "../typechain-types";
import abi from "../abi/contracts/HashupStoreV1.sol/HashupStoreV1.json";

const STORE_ADDRESS = "0xB1d734e63e4462161C5d98BD2d296E5cBdd12Bf7";
const MARKETPLACE_TO_WHITELIST = "0xf55c1D51326f8FfFc025F35BC85dF4b49fc7dE37";
const PAYMENT_TOKEN_ADDRESS = "0xf4A8Cd66edc3C5A8327bF19Ad23d4E547C2D5E72";

const addWhitelisted = async () => {
  const [owner] = await ethers.getSigners();

  const storeV1 = new Contract(STORE_ADDRESS, abi, owner) as HashupStoreV1;
  const result = await storeV1.isWhitelisted(MARKETPLACE_TO_WHITELIST);

  const paymentTokenTx = await storeV1.setPaymentToken(PAYMENT_TOKEN_ADDRESS);
  await paymentTokenTx.wait();

  const paymentToken = await storeV1.getPaymentToken();

  console.log(paymentToken)

  if (result) {
    console.log(`Marketplace whitelisted - ${MARKETPLACE_TO_WHITELIST}`);
    console.log(`Payment token is ${paymentToken}`);
  } else {
    const whitelistTx = await storeV1.toggleWhitelisted(
      MARKETPLACE_TO_WHITELIST
    );
    await whitelistTx.wait();
  }

  return result;
};

addWhitelisted();
