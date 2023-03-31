const hre = require("hardhat");
const toWei = (num) => hre.ethers.utils.parseEther(num.toString());

const main = async () => {
  const [deployer] = await hre.ethers.getSigners();
  const myToken = await hre.ethers.getContractFactory("myToken");
  const mytoken = await myToken.deploy();

  const Token = await hre.ethers.getContractFactory("Tokens");
  const token = await Token.deploy(toWei(10000000));
  await token.deployed();

  await mytoken.deployed();
  console.log("SimpleToken deployed to ", mytoken.address);

  const ICO = await hre.ethers.getContractFactory("ICO");
  const ico = await ICO.deploy(
    mytoken.address,
    deployer.address,
    1,
    2,
    ethers.utils.parseEther("0.01")
  );

  await ico.deployed();
  console.log("ICO deployed to ", ico.address);
  console.log(`Token deployed to: ${token.address}`);

  // const VerifySignature = await hre.ethers.getContractFactory(
  //   "verifySignature"
  // );
  // const verifySignature = await VerifySignature.deploy();
  // await verifySignature.deployed();

  // console.log(`contract deployed to address: ${verifySignature.address}`);
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.err;
  }
};

runMain();
