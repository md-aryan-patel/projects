const {expect} = require("chai");
const {ethers} = require("hardhat");
const hre = require("hardhat");
const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);
const cap = toWei(50000);

describe("Token Contract", () => {
    let contract, deployer;
    beforeEach(async () => {
        const token = await hre.ethers.getContractFactory("Tokens");
        [deployer] = await hre.ethers.getSigners();
        contract = await token.deploy(cap);
        await contract.deployed();
    });

    describe("Testing Token basics", () => {
        it("Should assign a token name", async  () => { 
            const name = await contract.name();
            expect(name).to.equal("test");
        });

        it("Should assign a Symbol name", async  () => {
            const symbol = await contract.symbol();
            expect(symbol).to.equal("TST");
        });
    });
    // describe("Test minting: ", ()=> {
    //     it("Verify that tokens are minted correctly when a user invested 1 Ether", async () => {
    //         const investmentValue = toWei(0.5);
    //         await contract.mint();
    //         const balance = await contract.balanceOf(deployer.address);
    //         console.log(balance);
    //     });
    // });
});