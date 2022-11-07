import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("Lock", async function () {
  describe("Deployment", () => {
    it("soemthing", async () => {
		console.log('Starting...')
      const Box1 = await ethers.getContractFactory("BoxV1");
      const box1 = await upgrades.deployProxy(Box1, [42]);
      await box1.deployed();

	  await box1.increase();
	  console.log(await box1.x())
	  console.log(await box1.y())


      console.log("Box deployed to:", box1.address);
      const BoxV2 = await ethers.getContractFactory("BoxV2");
      const boxv2 = await upgrades.upgradeProxy(box1.address, BoxV2);
      console.log("Box upgraded");

	  console.log(await boxv2.x())
	  await boxv2.increase();
	  console.log(await boxv2.x())
	  console.log(await boxv2.y())
    });
  });
});
