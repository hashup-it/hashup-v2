import { HashupStoreV1 } from "./../typechain-types/contracts/HashupStoreV1";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HashupStoreV1__factory } from "../typechain-types/factories/contracts/HashupStoreV1__factory";
import { TestToken__factory } from "../typechain-types/factories/contracts/TestToken__factory";
import { TestToken } from "../typechain-types/contracts/TestToken";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { HashupLicense__factory } from "../typechain-types";

enum ERRORS {
  NOT_OWNER = "Ownable: caller is not the owner",
  HASHUP_FEE_LIMIT = "HashupStore: HashupFee exceeded max limit",
  NOT_LICENSE_CREATOR = "HashupStore: must be License creator",
  SALE_SECOND_TIME = "HashupStore: Can't set for sale second time",
}

describe("HashupStore", async function () {
  const deployStoreV1 = async () => {
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

  const deployTestToken = async () => {
    const TestToken = (await ethers.getContractFactory(
      "TestToken"
    )) as TestToken__factory;

    const testToken = (await TestToken.deploy()) as TestToken;
    await testToken.deployed();

    return testToken;
  };

  const deployLicense = async (
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

  const deployNeededContractsFixture = async () => {
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

  const deployNeededContractsAndSaleFixture = async () => {
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

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      const { owner, storeV1 } = await loadFixture(
        deployNeededContractsFixture
      );
      expect(await storeV1.owner()).to.be.equal(owner.address);
    });
    it("Should start not paused", async () => {
      const { storeV1 } = await loadFixture(deployNeededContractsFixture);
      expect(await storeV1.paused()).to.be.equal(false);
    });
    it("Should set correct payment token", async () => {
      const { storeV1 } = await loadFixture(deployNeededContractsFixture);
      expect(await storeV1.getPaymentToken()).to.be.equal(
        ethers.constants.AddressZero
      );
    });
    it("Should set correct default HashupFee", async () => {
      const { storeV1 } = await loadFixture(deployNeededContractsFixture);
      expect(await storeV1.getHashupFee()).to.be.equal(10);
    });
  });

  describe("togglePause()", () => {
    it("Should pause if unpaused", async () => {
      const { storeV1 } = await loadFixture(deployNeededContractsFixture);

      expect(await storeV1.paused()).to.be.equal(
        false,
        "Arrangement error: Paused at start"
      );
      await storeV1.togglePause();
      expect(await storeV1.paused()).to.be.equal(true);
    });

    it("Should unpause if paused", async () => {
      const { storeV1 } = await loadFixture(deployNeededContractsFixture);

      await storeV1.togglePause();
      expect(await storeV1.paused()).to.be.equal(
        true,
        "Arrangement error: Unpaused at start"
      );
      await storeV1.togglePause();
      expect(await storeV1.paused()).to.be.equal(false);
    });

    it("Should revert if not owner", async () => {
      const { storeV1, userTwo } = await loadFixture(
        deployNeededContractsFixture
      );

      await expect(storeV1.connect(userTwo).togglePause()).to.be.rejectedWith(
        ERRORS.NOT_OWNER
      );
    });
  });

  describe("setHashupFee()", () => {
    it("Should revert if not owner", async () => {
      const { storeV1, userTwo } = await loadFixture(
        deployNeededContractsFixture
      );
      await expect(storeV1.connect(userTwo).setHashupFee(5)).to.be.revertedWith(
        ERRORS.NOT_OWNER
      );
    });
    it("Should set fee for correct data", async () => {
      const { storeV1, userTwo } = await loadFixture(
        deployNeededContractsFixture
      );

      const newFee = 5;
      await storeV1.setHashupFee(newFee);

      expect(await storeV1.getHashupFee()).to.be.equal(newFee);
    });

    it("Should revert for incorrect data", async () => {
      const { storeV1 } = await loadFixture(deployNeededContractsFixture);

      const newFee = 11;

      await expect(storeV1.setHashupFee(newFee)).to.be.revertedWith(
        ERRORS.HASHUP_FEE_LIMIT
      );
    });
  });

  describe("setHashupFee()", () => {
    it("Should revert if not owner", async () => {
      const { storeV1, userTwo, license } = await loadFixture(
        deployNeededContractsFixture
      );
      await expect(
        storeV1.connect(userTwo).setPaymentToken(license.address)
      ).to.be.revertedWith(ERRORS.NOT_OWNER);
    });
    it("Should set fee for correct data", async () => {
      const { storeV1, license } = await loadFixture(
        deployNeededContractsFixture
      );

      await storeV1.setPaymentToken(license.address);

      expect(await storeV1.getPaymentToken()).to.be.equal(license.address);
    });
  });
  describe("sendLicenseToStore()", () => {
    it("Should set price and marketplaceFee and transfer tokens to contract", async () => {
      const { storeV1, developer, license } = await loadFixture(
        deployNeededContractsFixture
      );

      const price = 100;
      const amount = 100;
      const marketplaceFee = 10;

      await license.connect(developer).approve(storeV1.address, amount);
      await storeV1
        .connect(developer)
        .sendLicenseToStore(license.address, price, amount, marketplaceFee);

      expect(await storeV1.getLicensePrice(license.address)).to.be.equal(price);
      expect(
        await storeV1.getLicenseMarketplaceFee(license.address)
      ).to.be.equal(marketplaceFee);
      expect(await license.balanceOf(storeV1.address)).to.be.equal(amount);
    });
    it("Should set price and marketplaceFee and transfer tokens to contract", async () => {
      const { storeV1, developer, license, userTwo } = await loadFixture(
        deployNeededContractsFixture
      );

      const price = 100;
      const amount = 100;
      const marketplaceFee = 10;

      await license.connect(developer).transfer(userTwo.address, amount);
      await license.connect(userTwo).approve(storeV1.address, amount);
      await expect(
        storeV1
          .connect(userTwo)
          .sendLicenseToStore(license.address, price, amount, marketplaceFee)
      ).to.be.revertedWith(ERRORS.NOT_LICENSE_CREATOR);
    });
  });
  describe("isWhitelisted()", () => {
    it("returns correct value", async () => {
      const { storeV1, marketplace } = await loadFixture(
        deployNeededContractsFixture
      );
      const isWhitelisted = await storeV1.isWhitelisted(marketplace.address);

      expect(isWhitelisted).to.be.equal(false);
    });
  });
  describe("toggleWhitelisted()", () => {
    it("toggles whitelist value", async () => {
      const { storeV1, marketplace } = await loadFixture(
        deployNeededContractsFixture
      );

      const before = await storeV1.isWhitelisted(marketplace.address);
      await storeV1.toggleWhitelisted(marketplace.address);
      const after = await storeV1.isWhitelisted(marketplace.address);

      expect(before).to.be.not.equal(after);
    });
    it("should be reverted if not owner", async () => {
      const { storeV1, userTwo, marketplace } = await loadFixture(
        deployNeededContractsFixture
      );
      await expect(
        storeV1.connect(userTwo).toggleWhitelisted(marketplace.address)
      ).to.be.revertedWith(ERRORS.NOT_OWNER);
    });
  });
});
