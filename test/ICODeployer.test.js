const {expect} = require("chai");
const {ethers} = require("hardhat");
const hre = require("hardhat");
const toWei = (num) => hre.ethers.utils.parseEther(num.toString());

describe("ICODeployer contract", () => {
    let token, icoDeployer, deployer;
    const startTime = 1;
    const endTime = 2;
    const pricePerToken = toWei(0.01);

    beforeEach(async () => {
        [deployer] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("myToken");
        token = await Token.deploy();
        await token.deployed();

        const IcoDeployer = await ethers.getContractFactory("ICODeployer");
        icoDeployer = await IcoDeployer.deploy();
        await icoDeployer.deployed();
    });

    describe("ICO Created Properly with proper Owner of the ICO", () => {
        let events;
        beforeEach(async () => {
            const tx = await icoDeployer.deploy_ico(token.address, startTime, endTime, pricePerToken);
            const receipt = await tx.wait();
            events = await receipt.events;
        });

        it("Should Emit an Event", async () => {   
            expect(events.length).to.equal(1);
            expect(events[0].event).to.equal("CreateICO");
        });

        it("Should Deploy a ICO contract", async () => {
            const address = await events[0].args.icoAddress;
            const ico = await ethers.getContractAt("ICO", address);
            await ico.deployed();
            const provider = await ico.getProviders();
            expect(await icoDeployer.getCounter()).to.equal(1);
            expect(provider.owner).to.equal(deployer.address);
        });
    });
});