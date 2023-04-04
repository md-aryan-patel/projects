const { ethers, network } = require("hardhat");
const abi = require("../artifacts/contracts/Token.sol/Tokens.json");
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

const approve = async (_to, _value) => {
  const trx = await contract.connect(wallet).approve(_to, _value);
  csl(trx);
};

const getAllowance = async (_to) => {
  csl(toEth(await contract.connect(wallet).allowance(process.env.from, _to)));
};

const mint = async (_value) => {
  const trx = await contract.connect(wallet).mint({ value: _value });
  csl(trx);
};

const transferFrom = async (_from, _to, _value) => {
  const trx = await contract
    .connect(wallet)
    .transferFrom(process.env.from, process.env.acc3, _value, {
      from: process.env.to,
    });
  csl(trx.hash);
};

const transfer = async (_to, _value) => {
  const trx = await contract.connect(wallet).transfer(_to, _value);
  // creceiptonst  = await trx.wait();
  // const events = receipt.events;
  csl(trx);
};

const signMessage = async (_message) => {
  const message = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(_message));

  const flatSign = await wallet.signMessage(_message);
  csl("Your message signature: " + flatSign);

  const sig = ethers.utils.splitSignature(flatSign);

  const address = ethers.utils.recoverAddress(message, flatSign);
  csl("Signing address: " + address);
};

const testFunctions = async () => {
  console.log(await provider.listAccounts());
  console.log(
    "Balance of my_account: " + (await provider.getBalance(process.env.from))
  );
  console.log(network);
  console.log(provider);
  console.log(await provider.getNetwork());
  console.log(await provider.getNetwork());
  console.log(await provider.getGasPrice());
  console.log(await provider.getBlockNumber());

  console.log(contract.address);

  const encode = contract.interface._encodeParams(
    ["uint", "string"],
    [123, "Hello"]
  );
  const decode = contract.interface._decodeParams(["uint", "string"], encode);
  const topic = contract.interface.getEventTopic("Transfer");
  csl(topic);
};

const signedTransfer = async (_from, _to, _value) => {
  const trx = {
    from: _from,
    to: _to,
    data: contract.interface.encodeFunctionData("transfer", [
      process.env.to,
      _value,
    ]),
  };

  const newWallet = new ethers.Wallet(process.env.private_key);
  const signer = newWallet.connect(provider);
  const result = await signer.sendTransaction(trx);
  csl(result);
};

const main = async () => {
  signMessage("approving to disapprove this message");
  // displayData();
  // signedTransfer(process.env.from, process.env.to, value);
  // approve(process.env.to, toWei(100));
  // getAllowance(process.env.to);
  // transfer(process.env.to, value);
  // mint(toWei(0.5));
  // testFunctions();
  // console.csl(await wallet.getTransactionCount());
};

main();
