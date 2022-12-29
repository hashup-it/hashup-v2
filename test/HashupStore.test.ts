import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { deployNeededContractsFixture } from "./test-helpers/fixtures";
import { REVERT_MESSAGES } from "./test-helpers/reverts";

describe("HashupStore", async function () {
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
        REVERT_MESSAGES.NOT_OWNER
      );
    });
  });

  describe("setHashupFee()", () => {
    it("Should revert if not owner", async () => {
      const { storeV1, userTwo } = await loadFixture(
        deployNeededContractsFixture
      );
      await expect(storeV1.connect(userTwo).setHashupFee(5)).to.be.revertedWith(
        REVERT_MESSAGES.NOT_OWNER
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

    it("Should revert for too high fee", async () => {
      const { storeV1 } = await loadFixture(deployNeededContractsFixture);

      const newFee = 11;

      await expect(storeV1.setHashupFee(newFee)).to.be.revertedWith(
        REVERT_MESSAGES.HASHUP_FEE_LIMIT
      );
    });
  });

  describe("setting new payment token fee", () => {
    it("Should revert if not owner", async () => {
      const { storeV1, userTwo, license } = await loadFixture(
        deployNeededContractsFixture
      );
      await expect(
        storeV1.connect(userTwo).setPaymentToken(license.address)
      ).to.be.revertedWith(REVERT_MESSAGES.NOT_OWNER);
    });
    it("should change token", async () => {
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
      ).to.be.revertedWith(REVERT_MESSAGES.NOT_LICENSE_CREATOR);
    });
  });
  describe("Adding to whitelist", () => {
    it("should toggle value", async () => {
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
      ).to.be.revertedWith(REVERT_MESSAGES.NOT_OWNER);
    });
  });
  describe("Buying licenses", () => {
    it("should revert if not enough payment token", async() => {

    })
    it("should revert if game not listed", async() => {

    })
    it("should revert if payment token not approved", async() => {

    })
    it("should revert if marketplace not whitelisted", async() => {
      
    })
  })
});
