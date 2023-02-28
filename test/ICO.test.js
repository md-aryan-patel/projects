const {expect} = require("chai");
const {ethers} = require("hardhat");
const hre = require("hardhat");
const toWei = (num) => hre.ethers.utils.parseEther(num.toString());
const fromWei = (num) => hre.ethers.utils.formatEther(num);

describe("ICO contract", ()=> {
    let ico, token, deployer, add1;
    const amount = toWei(500);
    const totalMintAmount = toWei(10000000);

    beforeEach(async () => {
        [deployer, add1] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("myToken");
        token = await Token.deploy();
        await token.deployed();

        const ICO = await ethers.getContractFactory("ICO");
        ico = await ICO.deploy(token.address, deployer.address, 1, 2, toWei(0.01));
        await ico.deployed();

        await token.approve(ico.address, toWei(50000));
    });

    describe("Test to check if the contract is deployed successfully: ", () => {
        it("Checks if the token deployed properly and has name", async () => {
            const name = await token.name();
            expect(name).to.equal("SimpleToken");
        });
    });

    describe("Test to check if the contract is deployed successfully: ", () => {
        it("check Deployed ICO contract has a valid address", async () => {
            expect(ico.address).not.equal(ethers.constants.AddressZero);
        });

        it("check Deployed ICO contract with valid parameters", async () => {
            const provider = await ico.getProviders();
            expect(provider.token).to.equal(token.address);
            expect(provider.owner).to.equal(deployer.address);
            expect(provider.startTime.toString()).to.equal("1");
            expect(provider.endTime.toString()).to.equal("2");
            expect(provider.pricePerToken).to.equal(toWei(0.01));
        });
    });

    describe("Test to check if the addToken function works as expected: ", () => {
        it("Checks the caller of the function and the owner of the token are the same", async () => {
            const provider = await ico.getProviders();
            expect(provider.owner).to.equal(deployer.address);
        });

        it("Check if the contract has allowance to spend the tokens", async () => {
            const allowance = await token.allowance(deployer.address, ico.address);
            expect(allowance).to.equal(toWei(50000));
        });

        it("Try adding some tokens to the contract using the addToken function", async ()=> {
            await ico.addToken(amount);
            const addressBalance = await token.balanceOf(ico.address);
            expect(addressBalance).to.equal(toWei(500));
        });
    });

    describe("Test to check if the invest function works as expected: ", () => {
        beforeEach(async () => {
            await ico.addToken(amount);
        });
        
        it("Invest small amount of ether to check the invest", async () => {
            await token.balanceOf(ico.address); 
            await ico.connect(add1).invest({value: toWei(0.1)});
            expect(await token.balanceOf(ico.address)).to.equal(toWei(490));
        });

        it("Invest large amount to test revert feature", async () => {
            const initialBalance = parseInt(fromWei(await ethers.provider.getBalance(add1.address)));
            const tx = await ico.connect(add1).invest({value: toWei(6)});
            const finalBalance = parseInt(fromWei(await ethers.provider.getBalance(add1.address)));
            expect(await token.balanceOf(ico.address)).to.equal(0);
            expect(initialBalance - finalBalance).to.equal(5);
            expect(await token.balanceOf(add1.address)).to.equal(amount);
        });
    });

    describe("Test to check if the withdrawFunds function works as expected: ", () => {
        beforeEach(async () => {
            await ico.addToken(amount);
        });

        it("Call the withdrawFunds function and check if the token balance of the contract is transferred to the owner", async () => {
            let currentBalanceOfICO = await token.balanceOf(ico.address);
            expect(currentBalanceOfICO).to.equal(amount);
            const provider = await ico.getProviders();
            expect(provider.owner).to.equal(deployer.address);
            await ico.withdrawFunds();
            currentBalanceOfICO = await token.balanceOf(ico.address);
            expect(currentBalanceOfICO).to.equal(0);
            expect(await token.balanceOf(deployer.address)).to.equal(totalMintAmount);
        });
        
        it("should revert if the caller is not the owner of the ICO", async () => {
            expect(ico.connect(add1).withdrawFunds()).to.be.revertedWith("Not Owner");
        });

        it("Should Revert if the funds are 0", async () => {
            const tx = await ico.connect(add1).invest({value: toWei(6)});
            expect(ico.withdrawFunds()).to.be.revertedWith("Insufficient Funds");
        });
    });
});