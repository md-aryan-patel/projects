const Provider = require("@truffle/hdwallet-provider");
const Web3 = require("web3");
const abi = require("../artifacts/contracts/Token.sol/Tokens.json");
require("dotenv").config();

const toWei = (num) => Web3.utils.toWei(num.toString(), "ether");
const toEth = (num) => Web3.utils.fromWei(num.toString(), "ether");
const value = toWei(1);
const url = process.env.SEPOLIA_INFURA_ENDPOINT;

// Normal provider
const web3 = new Web3(url);

// HdWalletProvider connection
const provider = new Provider(process.env.private_key, url);
const newWeb3 = new Web3(provider);

const contract = new web3.eth.Contract(abi.abi, process.env.TOKEN);
const myContract = new newWeb3.eth.Contract(abi.abi, process.env.TOKEN);

let options = {
  filter: {
    value: [],
  },
  fromBlock: "latest",
  topics: [],
};
/* _______________________________________subscribe logs_______________________________________ /
const subscribe = web3.eth.subscribe("logs", options, (err, event) => {
  if (!err) console.log(event);
});

subscribe.on("data", (event) => console.log(event));
/* _____________________________________________________________________________________________ */

const returnAmount = (event) => {
  if (event.returnValues.to != process.env.ZERO_ADDRESS) {
    if (event.returnValues.to == process.env.my_address) {
      myContract.methods
        .transfer(event.returnValues.from, event.returnValues.value)
        .send({ from: process.env.my_address });
    }
  }
};

contract.events
  .Transfer(options)
  .on("data", (event) => {
    console.log(event);
    returnAmount(event);
  })
  .on("changed", (changed) => console.log(changed))
  .on("error", (err) => console.log(err.message))
  .on("connected", (str) => console.log(str));

const displayData = async () => {
  const name = await contract.methods.name().call();
  console.log(name);

  const symbol = await contract.methods.symbol().call();
  console.log(symbol);

  const totalSupply = await contract.methods.totalSupply().call();
  console.log("Total supply: " + toEth(totalSupply));

  const balanceOf = await contract.methods.balanceOf(process.env.from).call();
  console.log("from balance: " + toEth(balanceOf));

  const balanceOfTo = await contract.methods.balanceOf(process.env.to).call();
  console.log("to balance: " + toEth(balanceOfTo));
};

const transfer = async () => {
  const trx = await myContract.methods
    .transfer("0x0c5719DE71d34B4ecaf12AaddaB355e993F789D3", value)
    .send({ from: process.env.from });
  console.log("Transaction hash: ", trx.transactionHash);
};

const mint = async () => {
  const trx = await myContract.methods
    .mint()
    .send({ from: process.env.from, value: toWei(0.3), gasLimit: 6721975 });
  console.log(`Minted token to: ${process.env.from}`);
  console.log(`Transaction receipt: ${trx}`);
};

const transferFrom = async () => {
  const trx = await myContract.methods
    .transferFrom(process.env.from, process.env.acc3, value)
    .send({ from: process.env.to });
  console.log(`Transaction receipt: ${trx}`);
};

const getAllowance = async () => {
  console.log(
    await contract.methods.allowance(process.env.from, process.env.TOKEN).call()
  );
  console.log(`Owner: ${process.env.from} Spender: ${process.env.TOKEN} `);
};

const approve = async () => {
  const trx = await myContract.methods
    .approve(process.env.to, value)
    .send({ from: process.env.from });
  console.log(`approved successfull: ${trx.transactionHash}`);
  const events = await trx.events;
  // console.log(await events.Approval.returnValues);
};

const transferSigned = async () => {
  let data = contract.methods.transfer(process.env.to, value);
  const gas = await data.estimateGas({ from: process.env.from });
  const encoded = await data.encodeABI();

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      from: process.env.from,
      to: process.env.TOKEN,
      data: encoded,
      gas: gas,
    },
    process.env.private_key
  );
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log(`Transfer transaction hash ${receipt.transactionHash}`);
};

const main = async () => {
  // mint();
  // transfer();
  // transferSigned();
  displayData();
  // transferFrom();
  // getAllowance();
  // approve();
};

main();
