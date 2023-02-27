const {expect} = require("chai");
const {ethers} = require("hardhat");
const hre = require("hardhat");
const toWei = (num) => ethers.utils.parseEther(num.toString());

describe("myToken Contract", () => {
    let token, deployer;
    const mintedAmount = toWei(10000000);
    beforeEach(async () => {
        const Token = await hre.ethers.getContractFactory("myToken");
        [deployer] = await hre.ethers.getSigners();
        token = await Token.deploy();
        await token.deployed();
    });

    describe("Testing myToken basics", () => {
        it("Should assign a token name", async  () => { 
            const name = await token.name();
            expect(name).to.equal("SimpleToken");
        });

        it("Should assign a Symbol name", async  () => {
            const symbol = await token.symbol();
            expect(symbol).to.equal("SIMP");
        });
    });

    describe("Minted tokens ", ()=> {
        it("Verify that tokens are minted correctly", async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(mintedAmount);
        });
    });
});