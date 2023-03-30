const Provider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const abi = require("./token.json");
require("dotenv").config();

const toWei = (num) => Web3.utils.toWei(num.toString(), "ether");
const toEth = (num) => Web3.utils.fromWei(num.toString(), "ether");
const url = process.env.SEPOLIA_INFURA_ENDPOINT;

// Normal provider
const web3 = new Web3(url);

// HdWalletProvider connection
const provider = new Provider(process.env.private_key, url);
const newWeb3 = new Web3(provider);

const contract = new web3.eth.Contract(abi, process.env.TOKEN_2);
const myContract = new newWeb3.eth.Contract(abi, process.env.TOKEN_2);

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
  console.log("to balance: " + toEth(balanceOfTo));
};

const transfer = async () => {
  const trx = await myContract.methods
    .transfer("0x5969Ad5Abb6D9f1A0336579AD094828d4c3D3140", toWei(0.00001))
    .send({ from: process.env.from });
  console.log("Transaction hash: ", trx.transactionHash);
};

const approve = async () => {
  const trx = await myContract.methods
    .approve(process.env.to, toWei(0.0001))
    .send({ from: process.env.from });
  console.log(`approved successfull: ${trx.transactionHash}`);
  const events = await trx.events;
  // console.log(await events.Approval.returnValues);
};

const main = () => {
  //   approve();
  transfer();
};

main();
