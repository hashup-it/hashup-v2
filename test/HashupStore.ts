import { HashupStoreV1 } from "./../typechain-types/contracts/HashupStoreV1";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { HashupStoreV1__factory } from "../typechain-types/factories/contracts/HashupStoreV1__factory";
import { TestToken__factory } from "../typechain-types/factories/contracts/TestToken__factory";
import { TestToken } from "../typechain-types/contracts/TestToken";
import { HashupCartridge__factory } from "../typechain-types/factories/contracts/HashupCartridge__factory";
import { HashupCartridge } from "../typechain-types/contracts/HashupCartridge";
import { connect } from "http2";

describe("HashupStore", async function () {
  let owner: SignerWithAddress,
    developer: SignerWithAddress,
    userOne: SignerWithAddress,
    userTwo: SignerWithAddress;

  let HashupStoreV1: HashupStoreV1__factory;
  let storeV1: HashupStoreV1;

  let TestToken: TestToken__factory;
  let testToken: TestToken;

  let HashupLicense: HashupCartridge__factory;
  let testLicense: HashupCartridge;

  before(async () => {
    HashupStoreV1 = (await ethers.getContractFactory(
      "HashupStoreV1"
    )) as HashupStoreV1__factory;

    TestToken = (await ethers.getContractFactory(
      "TestToken"
    )) as TestToken__factory;

    HashupLicense = (await ethers.getContractFactory(
      "HashupCartridge"
    )) as HashupCartridge__factory;

    [owner, developer, userOne, userTwo] = await ethers.getSigners();
  });

  beforeEach(async () => {
    storeV1 = (await upgrades.deployProxy(HashupStoreV1, [])) as HashupStoreV1;
    await storeV1.deployed();
    testToken = await TestToken.connect(owner).deploy();
    testLicense = await HashupLicense.connect(developer).deploy(
      "Name",
      "SYM",
      "https://hashup.it",
      1000000,
      200,
      storeV1.address
    );

    await testToken.deployed();
  });

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await storeV1.owner()).to.be.equal(owner.address);
    });

    it("Should start not paused", async () => {
      expect(await storeV1.paused()).to.be.equal(false);
    });
  });

  describe("togglePause()", () => {
    it("Should pause if unpaused", async () => {
      expect(await storeV1.paused()).to.be.equal(
        false,
        "Arrangement error: Paused at start"
      );
      await storeV1.togglePause();
      expect(await storeV1.paused()).to.be.equal(true);
    });

    it("Should unpause if paused", async () => {
      await storeV1.togglePause();
      expect(await storeV1.paused()).to.be.equal(
        true,
        "Arrangement error: Unpaused at start"
      );
      await storeV1.togglePause();
      expect(await storeV1.paused()).to.be.equal(false);
    });

    it("Should revert if not owner", async () => {
      await expect(storeV1.connect(userTwo).togglePause()).to.be.rejectedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("sendLicenseToStore()", () => {
    it("Should pause if unpaused", async () => {

      await testLicense
        .connect(developer)
        .approve(storeV1.address, 100);

      await storeV1
        .connect(developer)
        .sendLicenseToStore(testLicense.address, 5000, 100, 50);
    });
  });
});
