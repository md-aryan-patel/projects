const { ethers } = require("hardhat");
const Web3 = require("web3");
const abi = require("../artifacts/contracts/Token.sol/Tokens.json");
require("dotenv").config();

const toWei = (num) => Web3.utils.toWei(num.toString(), "ether");
const toEth = (num) => Web3.utils.fromWei(num.toString(), "ether");
const url = process.env.SEPOLIA_INFURA_ENDPOINT;
const provider = new Web3.providers.HttpProvider(url);

const web3 = new Web3(provider);
const value = toWei(10);

const contract = new web3.eth.Contract(abi.abi, process.env.TOKEN);

const tx = {
  from: process.env.from,
  to: process.env.to,
  gasLimit: 6721975,
  data: contract.methods.transfer(process.env.to, value).encodeABI(),
};

const displayData = async () => {
  const name = await contract.methods.name().call();
  console.log(name);

  const symbol = await contract.methods.symbol().call();
  console.log(symbol);

  const totalSupply = await contract.methods.totalSupply().call();
  console.log(toEth(totalSupply));

  const balanceOf = await contract.methods.balanceOf(process.env.from).call();
  console.log(toEth(balanceOf));

  const balanceOfTo = await contract.methods.balanceOf(process.env.to).call();
  console.log(toEth(balanceOfTo));
};

const transfer = async () => {
  const trx = await contract.methods
    .transfer(process.env.to, value)
    .send({ from: process.env.from });
  console.log(trx.transactionHash);
};

const mint = async () => {
  const trx = await contract.methods
    .mint()
    .send({ from: process.env.from, value: toWei(1), gasLimit: 6721975 });
  console.log(`Minted token to: ${process.env.from}`);
  console.log(`Transaction receipt: ${trx}`);
};

const transferSigned = async () => {
  const signPromise = web3.eth.signTransaction(tx, tx.private_key);
  signPromise
    .then((signedTx) => {
      const sentTx = web3.eth.sendSignedTransaction(
        signedTx.raw || signedTx.rawTransaction
      );
      sentTx.on("receipt", (receipt) => {
        console.log(contract.methods.balanceOf(process.env.from)).call();
      });
      sentTx.on("error", (err) => {
        console.log(err.message);
      });
    })
    .catch((err) => {
      console.log(err.message);
    });
};

const main = async () => {
  // mint();
  // transfer();
  // transferSigned();
  displayData();
};

main();
