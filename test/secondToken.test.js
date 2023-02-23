const {expect} = require("chai");
const {ethers} = require("hardhat");
const hre = require("hardhat");
const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe("Token contract: ", () => {
    let token, deployer, account_1;
    const cap = toWei(50000);

    beforeEach(async () => {
        [deployer, account_1] = await hre.ethers.getSigners();

        const Token = await hre.ethers.getContractFactory("Tokens");
        token = await Token.deploy(cap);
        await token.deployed();
    });

    describe("Testing myToken basics", () => {
        it("Should assign a token name", async  () => { 
            const name = await token.name();
            expect(name).to.equal("test");
        });

        it("Should assign a Symbol name", async  () => {
            const symbol = await token.symbol();
            expect(symbol).to.equal("TST");
        });
    });
    // describe("Minting token", () => {
    //     const investAmount = toWei(1);
    //     const mintedAmount = toWei(10000000);
        
    //     it("Should mint token for for 1 Ether", async () => {
    //         await token.connect(account_1).mint({value: investAmount});
    //         const balanceOfAccount = await token.balanceOf(account_1.address);
    //         expect(balanceOfAccount).to.equal(mintedAmount);
    //     });
    // });
});