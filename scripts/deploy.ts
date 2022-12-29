import { ethers, upgrades } from "hardhat";
import { HashupStoreV1, HashupStoreV1__factory } from "../typechain-types";

const deployStore = async () => {
	
	const HashupStoreV1 = (await ethers.getContractFactory(
		"HashupStoreV1"
	  )) as HashupStoreV1__factory;
	
	  const storeV1 = (await upgrades.deployProxy(
		HashupStoreV1,
		[]
	  )) as HashupStoreV1;
	 
	  console.log(storeV1.address);
	  await storeV1.deployed();
	  // initialize contract
	  await storeV1.initialize();
	
	
}


deployStore()