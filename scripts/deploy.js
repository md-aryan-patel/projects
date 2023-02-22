const hre = require("hardhat");

const main = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const myToken = await hre.ethers.getContractFactory("myToken");
  const mytoken = await myToken.deploy();
  
  await mytoken.deployed();
  console.log("SimpleToken deployed to ", mytoken.address);

  const ICO = await hre.ethers.getContractFactory("ICO");
  const ico = await ICO.deploy(mytoken.address, deployer.address, 1, 2, ethers.utils.parseEther("0.01"));

  await ico.deployed();
  console.log("ICO deployed to ", ico.address);
}

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.err;
  }
}

runMain();