// scripts/upgrade-box.js
import { ethers, upgrades } from "hardhat";

const BOX_ADDRESS = "0x80Fa57dBB7C7a89CCe4E120d959fC6B1ae991E9c";

async function main() {
  console.log("Box upgraded");
  const BoxV2 = await ethers.getContractFactory("BoxV2");
  console.log("box")
  const box = await upgrades.upgradeProxy(BOX_ADDRESS, BoxV2);
  console.log("Box upgraded");
}

main();
