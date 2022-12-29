import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers, upgrades } from "hardhat";
import { HashupLicense__factory } from "../../typechain-types/factories/contracts/HashupLicense__factory";
import { TestToken__factory } from "../../typechain-types/factories/contracts/TestToken__factory";
import { HashupStoreV1 } from "../../typechain-types/contracts/HashupStoreV1";
import { HashupStoreV1__factory } from "../../typechain-types/factories/contracts/HashupStoreV1__factory";
import { TestToken } from "../../typechain-types/contracts/TestToken";

export const deployStoreV1 = async () => {
  const HashupStoreV1 = (await ethers.getContractFactory(
    "HashupStoreV1"
  )) as HashupStoreV1__factory;

  const storeV1 = (await upgrades.deployProxy(
    HashupStoreV1,
    []
  )) as HashupStoreV1;
  await storeV1.deployed();

  return storeV1;
};

export const deployTestToken = async () => {
  const TestToken = (await ethers.getContractFactory(
    "TestToken"
  )) as TestToken__factory;

  const testToken = (await TestToken.deploy()) as TestToken;
  await testToken.deployed();

  return testToken;
};

export const deployLicense = async (
  deployer: SignerWithAddress,
  storeAddress: string
) => {
  const HashupLicense = (await ethers.getContractFactory(
    "HashupLicense"
  )) as HashupLicense__factory;

  const testLicense = await HashupLicense.connect(deployer).deploy(
    "Name",
    "SYM",
    "https://hashup.it",
    ethers.constants.MaxUint256,
    200,
    storeAddress
  );

  await testLicense.deployed();

  return testLicense;
};
