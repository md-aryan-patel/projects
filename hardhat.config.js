require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",

  defaultNetwork: "ganache",

  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      gas: "auto",
    },
    sepolia: {
      url: process.env.SEPOLIA_INFURA_ENDPOINT,
      accounts: [process.env.private_key],
    },
  },
};
