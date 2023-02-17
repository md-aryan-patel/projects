const hre = require("hardhat");

async function main() {

  const Token = await hre.ethers.getContractAt("Tokens");
  const token = await Token.deploy();
  await token.deployed();

  const ICO = await hre.ethers.getContractAt("ICO");
  const ico = await ICO.deploy();
  await ico.deployed();

  console.log(
    `Lock deployed to: ${token.address}`
  );
  console.log(
    `ICO deployed to: ${ico.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
