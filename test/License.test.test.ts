import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { HashupLicense__factory } from "../typechain-types/factories/contracts/HashupLicense__factory";
import { HashupLicense } from "../typechain-types/contracts/HashupLicense";
import { ethers } from "hardhat";
import { deployLicenseFixture } from "./test-helpers/fixtures";

describe("HashupLicense", async () => {
  describe("deployment", async () => {
    it("should revert if incorrect fee", async () => {
    
      )) as HashupLicense__factory;
      const HashupLicense = await expect(
        HashupLicenseFactory.deploy(
          "Game",
          "GME",
          "url",
          "10000000",
          100000,
          ethers.constants.AddressZero
        )
      ).to.be.revertedWith("HashupLicense: Incorrect fee");
    });
    it("should set name properly", async () => {
      const { license } = await deployLicenseFixture();

      const setName = await license.name();
      expect(setName).to.be.equal("Game");
    });
    it("should set symbol properly", async () => {
      const { license } = await deployLicenseFixture();

      const setSymbol = await license.symbol();
      expect(setSymbol).to.be.equal("GME");
    });
    it("should set color properly", async () => {
	  const { license } = await deployLicenseFixture();

      const HashupLicenseGray = await HashupLicenseFactory.deploy(
        "Game",
        "GME",
        "url",
        "1000000000",
        TEST_FEE,
        ethers.constants.AddressZero
      );
      await HashupLicenseGray.deployed();
      expect(await HashupLicenseGray.color()).to.be.equal("gray");

      const HashupLicenseCustom = await HashupLicenseFactory.deploy(
        "Game",
        "GME",
        "url",
        "1000000000000",
        TEST_FEE,
        ethers.constants.AddressZero
      );
      await HashupLicenseCustom.deployed();
      expect(await HashupLicenseCustom.color()).to.be.equal("gray");
    });
    it("should set supply properly and give it to creator", async () => {
      const setSupply = await HashupLicense.totalSupply();
      const creatorBalance = await HashupLicense.balanceOf(owner.address);
      expect(setSupply).to.be.equal(10000000);
      expect(creatorBalance).to.be.equal(10000000);
    });
    it("should set creator properly", async () => {
      const setCreator = await HashupLicense.owner();
      expect(setCreator).to.be.equal(owner.address);
    });
    it("should set metadata url properly", async () => {
      const setMetadata = await HashupLicense.metadataUrl();
      expect(setMetadata).to.be.equal("url");
    });
    it("should set decimals to 2", async () => {
      const setDecimals = await HashupLicense.decimals();
      expect(setDecimals).to.be.equal(2);
    });
    it("should set fee correctly", async () => {
      const setFeeForCreator = await HashupLicense.creatorFee();
      expect(setFeeForCreator).to.be.equal(100);
    });
  });
  describe("approve()", async () => {
    it("should set allowance correctly", async () => {
      await HashupLicense.connect(owner).approve(userOne.address, 100);
      const allowance = await HashupLicense.allowance(
        owner.address,
        userOne.address
      );
      expect(allowance).to.be.equal(100);
    });
  });
  describe("switchSale()", async () => {
    it("it should set sale to true", async () => {
      await HashupLicense.connect(owner).switchSale();
      expect(await HashupLicense.isOpen()).to.be.equal(true);
    });
    it("it revert if not admin", async () => {
      await expect(
        HashupLicense.connect(userTwo).switchSale()
      ).to.be.revertedWith("HashupLicense: only admin can enable transferFrom");
    });
    it("it should still be true after second time", async () => {
      await HashupLicense.connect(owner).switchSale();
      await HashupLicense.connect(owner).switchSale();
      expect(await HashupLicense.isOpen()).to.be.equal(true);
    });
  });
  describe("feeCounter()", async () => {
    it("should return 0 at start", async () => {
      expect(await HashupLicense.feeCounter()).to.be.equal(0);
    });
    it("should increase fee counter after transfer", async () => {
      await HashupLicense.connect(owner).transfer(userOne.address, 1000);
      await HashupLicense.connect(userOne).transfer(userOne.address, 1000);

      expect(await HashupLicense.feeCounter()).to.be.equal(
        1000 * (TEST_FEE / 1000)
      );
    });
  });
  describe("feeDecimals()", async () => {
    it("should return 1", async () => {
      expect(await HashupLicense.feeDecimals()).to.be.equal(1);
    });
  });
  describe("transferFrom()", async () => {
    it("should revert for normal users at start", async () => {
      await HashupLicense.connect(owner).transfer(userTwo.address, 1000);
      await HashupLicense.connect(userTwo).approve(userOne.address, 1000);
      await expect(
        HashupLicense.connect(userOne).transferFrom(
          userTwo.address,
          userOne.address,
          1000
        )
      ).to.be.revertedWith("HashupLicense: transferFrom is closed");
    });
    it("should not revert for normal users after unblocking it", async () => {
      await HashupLicense.connect(owner).switchSale();

      await HashupLicense.connect(owner).transfer(userTwo.address, 1000);
      await HashupLicense.connect(userTwo).approve(userOne.address, 1000);
      await HashupLicense.connect(userOne).transferFrom(
        userTwo.address,
        userOne.address,
        1000
      );
      expect(await HashupLicense.balanceOf(userOne.address)).to.be.equal(900);
    });
    it("should let user spend allowed licenses and decrease allowance", async () => {
      const balanceBefore = await HashupLicense.balanceOf(owner.address);
      await HashupLicense.connect(owner).approve(userOne.address, 1000);
      const allowanceBefore = await HashupLicense.allowance(
        owner.address,
        userOne.address
      );

      await HashupLicense.connect(userOne).transferFrom(
        owner.address,
        userTwo.address,
        100
      );
      const balanceAfter = await HashupLicense.balanceOf(owner.address);
      const allowanceAfter = await HashupLicense.allowance(
        owner.address,
        userOne.address
      );

      expect(balanceAfter).to.be.equal(Number(balanceBefore) - 100);
      expect(allowanceAfter).to.be.equal(Number(allowanceBefore) - 100);
    });
    it("should revert if from zero address", async () => {
      await HashupLicense.connect(owner).approve(userOne.address, 1000);
      await expect(
        HashupLicense.connect(userOne).transferFrom(
          ethers.constants.AddressZero,
          userTwo.address,
          100
        )
      ).to.be.revertedWith("HashupLicense: transfer from the zero address");
    });

    it("should not reduce allowance if its MAX_UINT256", async () => {
      await HashupLicense.connect(owner).approve(
        userOne.address,
        ethers.constants.MaxUint256
      );
      const allowanceBefore = await HashupLicense.allowance(
        owner.address,
        userOne.address
      );

      await HashupLicense.connect(userOne).transferFrom(
        owner.address,
        userTwo.address,
        100
      );
      const allowanceAfter = await HashupLicense.allowance(
        owner.address,
        userOne.address
      );

      expect(allowanceAfter).to.be.equal(allowanceBefore);
    });
    it("should not pay fees if sender is creator", async () => {
      await HashupLicense.transfer(userOne.address, 100);
      expect(await HashupLicense.balanceOf(userOne.address)).to.be.equal(100);
    });
    it("should revert if allowance is too low", async () => {
      await HashupLicense.connect(owner).approve(userOne.address, 1000);
      await expect(
        HashupLicense.connect(userOne).transferFrom(
          owner.address,
          userTwo.address,
          10000
        )
      ).to.be.revertedWith("HashupLicense: insufficient allowance");
    });
    it("should revert if balance is too low", async () => {
      await HashupLicense.connect(owner).approve(
        userOne.address,
        "10000000000000000"
      );
      await expect(
        HashupLicense.connect(userOne).transferFrom(
          owner.address,
          userTwo.address,
          "10000000000000"
        )
      ).to.be.revertedWith("HashupLicense: insufficient token balance");
    });
  });
  describe("setStore()", async () => {
    it("should revert if not owner", async () => {
      await expect(
        HashupLicense.connect(userOne).setStore(userTwo.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("should set store properly", async () => {
      await HashupLicense.connect(owner).setStore(userTwo.address);
      expect(await HashupLicense.store()).to.be.equal(userTwo.address);
    });
  });
  describe("setMetadata()", async () => {
    it("should set metadata", async () => {
      await HashupLicense.setMetadata("new");
      expect(await HashupLicense.metadataUrl()).to.be.equal("new");
    });
    it("should revert if not creator", async () => {
      await expect(
        HashupLicense.connect(userTwo).setMetadata("new")
      ).to.be.revertedWith("");
    });
  });
  describe("transfer()", async () => {
    it("should revert if recipient is zero address", async () => {
      await expect(HashupLicense.transfer(ethers.constants.AddressZero, 100)).to
        .be.reverted;
    });
    it("should pay fees properly", async () => {
      await HashupLicense.connect(owner).transfer(userOne.address, 100);
      expect(await HashupLicense.balanceOf(userOne.address)).to.be.equal(100);

      const recipientBefore = await HashupLicense.balanceOf(userTwo.address);
      const ownerBefore = await HashupLicense.balanceOf(owner.address);

      await HashupLicense.connect(userOne).transfer(userTwo.address, 100);
      const recipientAfter = await HashupLicense.balanceOf(userTwo.address);
      const ownerAfter = await HashupLicense.balanceOf(owner.address);

      expect(recipientAfter).to.be.equal(
        Number(recipientBefore) + (100 * (1000 - TEST_FEE)) / 1000
      );
      expect(ownerAfter).to.be.equal(
        Number(ownerBefore) + (100 * TEST_FEE) / 1000
      );
    });
    it("should not pay fees if sender is creator", async () => {});
  });
});
