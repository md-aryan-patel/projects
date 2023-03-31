const { ethers } = require("hardhat");
const abi = require("../artifacts/contracts/Token.sol/Tokens.json");
const signerAbi = require("../artifacts/contracts/verifySignature.sol/verifySignature.json");
require("dotenv").config();

const toEth = (num) => ethers.utils.formatEther(num);
const toWei = (num) => ethers.utils.parseEther(num.toString());
const csl = (str) => console.log(str);

const url = process.env.SEPOLIA_INFURA_ENDPOINT;
const provider = new ethers.providers.JsonRpcProvider(url);
const wallet = new ethers.Wallet(process.env.private_key, provider);
const value = toWei(1);

const contract = new ethers.Contract(process.env.TOKEN, abi.abi, provider);

const displayData = async () => {
  const name = await contract.name();
  csl(name);

  const symbol = await contract.symbol();
  csl(symbol);

  const balanceOf = await contract.balanceOf(process.env.from);
  csl("Balance of from: " + toEth(balanceOf));

  const balanceOfto = await contract.balanceOf(process.env.to);
  csl("Balance of to: " + toEth(balanceOfto));
};

const returnAmount = (event) => {
  if (event.to != process.env.ZERO_ADDRESS) {
    if (event.to == process.env.my_address) {
      contract.connect(wallet).transfer(event.from, event.value);
    }
  }
};

contract.on("Transfer", (from, to, value) => {
  let transferEvent = {
    from: from,
    to: to,
    value: value,
  };
  returnAmount(transferEvent);
  csl(transferEvent);
});

const approve = async () => {
  const trx = await contract
    .connect(wallet)
    .approve(process.env.to, toWei(100));
  csl(trx);
};

const getAllowance = async () => {
  csl(
    toEth(
      await contract.connect(wallet).allowance(process.env.from, process.env.to)
    )
  );
};

const mint = async () => {
  const trx = await contract
    .connect(wallet)
    .mint({ value: toWei(0.5), gasLimit: 6721975 });
  csl(trx);
};

const transferFrom = async () => {
  const trx = await contract
    .connect(wallet)
    .mint(process.env.from, process.env.acc3, { from: process.env.to });
  csl(trx.hash);
};

const transfer = async () => {
  const trx = await contract.connect(wallet).transfer(process.env.to, value);
  // creceiptonst  = await trx.wait();
  // const events = receipt.events;
  csl(`Transaction hash: ${trx.hash}`);
};

const signMessage = async (_message) => {
  const message = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(_message));

  const flatSign = await wallet.signMessage(_message);
  console.log("Your message signature: " + flatSign);

  const sig = ethers.utils.splitSignature(flatSign);

  const verificationContract = new ethers.Contract(
    process.env.signature_contract_address,
    signerAbi.abi,
    provider
  );

  const address = await verificationContract.verify(
    message,
    sig.v,
    sig.r,
    sig.s
  );
  console.log("Signing address: " + address);
  console.log("Wallet address: " + wallet.address);
};

const main = () => {
  signMessage("approving to disapprove this message");
  // displayData();
  // approve();
  // getAllowance();
  // transfer();
  // mint();
};

main();
