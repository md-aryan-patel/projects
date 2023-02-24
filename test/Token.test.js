const {expect} = require("chai");
const {ethers} = require("hardhat");
const hre = require("hardhat");
const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe("Token contract: ", () => {
    let token, deployer, account_1, account_2;
    const cap = toWei(2000000000);

    beforeEach(async () => {
        [deployer, account_1, account_2] = await hre.ethers.getSigners();

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
    
    describe("Minting token", () => {
        
        let investAmount = toWei(1);
        let mintedAmount = toWei(10000000);
        
        it("Should mint token for for 1 Ether", async () => {
            await token.connect(account_1).mint({value: investAmount});
            const balanceOfAccount = await token.balanceOf(account_1.address);
            expect(balanceOfAccount).to.equal(mintedAmount);
        });

        it("Should revert with error if the invested amount is less the 0.1 ether and Greater then 2 ether", async () => {
            investAmount = toWei(0.01);
            expect(token.connect(account_1).mint({value: investAmount})).to.be.revertedWith("Investment amount is low");
            investAmount = toWei(2);
            expect(token.connect(account_1).mint({value: investAmount})).to.be.revertedWith("Investement amount is too high");
        });

        it("Should revert with error if the the maximum mint limit has reached", async () => {
            investAmount = toWei(2.1);
            expect(token.connect(account_1).mint({value: investAmount}))
                .to.be.revertedWith("Max limit reached");
        });
    });

    describe("Transfer Token ", () => {
        let taxPercentage, transferAmount, taxableAmount, tx;
        let investAmount = toWei(1);
        
        beforeEach(async() => {
            transferAmount = toWei(1000)
            taxPercentage = await token.getTaxPercentage();
            taxableAmount = transferAmount / taxPercentage;
            await token.connect(account_1).mint({value: investAmount});
        });

        it("Should charge decided percenta of fees on not Exempted Accounts", async () => {
            tx = await token.connect(account_1).transfer(account_2.address, transferAmount);
            const balanceOfToAccount = await token.balanceOf(account_2.address);
            transferAmount -= taxableAmount;
            expect(balanceOfToAccount).to.equal(BigInt(transferAmount));
        });

        it("Should burn the taxFess", async () => {
            const receipt = await tx.wait();
            const events = receipt.events;
            expect(events.length).to.eq(2);
            expect(events[1].event).to.equal("Transfer");
            expect(events[1].args.to).to.equal(ethers.constants.AddressZero);
            expect(events[1].args.value).to.equal(BigInt(taxableAmount));
        });

        it("Should not charge decided percenta of fees on Exempted Accounts", async () => {
            await token.setExemptedAccount(account_1.address);
            await token.connect(account_1).transfer(account_2.address, transferAmount);
            const balanceOfToAccount = await token.balanceOf(account_2.address);  
            expect(balanceOfToAccount).to.equal(BigInt(transferAmount));
        });
    });

    describe("Burn tokens", () => {
        
    })
});