import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

import {PRIVATE_KEY} from "./secrets.json";


const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    mumbai: {
      url: `https://polygon-rpc.com/`,
      accounts: [PRIVATE_KEY]
    }
  }

};

export default config;
