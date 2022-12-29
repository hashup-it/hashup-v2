import { ethers } from "hardhat";
import { deployLicense, deployStoreV1, deployTestToken } from "./deploys";


export const deployLicenseFixture = async () => {
    const [owner, developer, userOne] = await ethers.getSigners()

    const storeV1 = await deployStoreV1();
    const license = await deployLicense(developer, storeV1.address);

    return {owner, developer, userOne, storeV1, license}
}

export const deployNeededContractsFixture = async () => {
    const [owner, developer, userOne, userTwo, marketplace] =
      await ethers.getSigners();

    const storeV1 = await deployStoreV1();
    const testToken = await deployTestToken();
    const license = await deployLicense(developer, storeV1.address);

    return {
      owner,
      developer,
      userOne,
      userTwo,
      storeV1,
      testToken,
      license,
      marketplace,
    };
  };

  export const deployNeededContractsAndSaleFixture = async () => {
    const [owner, developer, userOne, userTwo, marketplace] =
      await ethers.getSigners();

    const storeV1 = await deployStoreV1();
    const testToken = await deployTestToken();
    const license = await deployLicense(developer, storeV1.address);

    const price = 100;
    const amount = 100;
    const marketplaceFee = 50;

    await license.approve(storeV1.address, ethers.constants.MaxUint256);
    await storeV1
      .connect(developer)
      .sendLicenseToStore(license.address, price, amount, marketplaceFee);

    return {
      owner,
      developer,
      userOne,
      userTwo,
      storeV1,
      testToken,
      license,
      price,
      amount,
      marketplaceFee,
      marketplace,
    };
  };