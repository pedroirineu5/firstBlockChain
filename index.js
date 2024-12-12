const CryptoJs = require('crypto-js');

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  calculateHash() {
    return CryptoJs.SHA256(this.timestamp + this.previousHash + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mineBlock(difficulty, minerAddress) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined: " + this.hash);

    const totalFees = this.transactions.reduce((acc, tx) => acc + tx.fee, 0);
    const rewardTransaction = new Transaction(totalFees, null, minerAddress);
    this.transactions.push(rewardTransaction);
  }

  toString() {
    return `
    ==============================
    Block Information:
    ==============================
    Timestamp     : ${this.timestamp}
    Previous Hash : ${this.previousHash}
    Hash          : ${this.hash}
    Nonce         : ${this.nonce}
    Transactions  : 
      ${this.transactions.map(tx => tx.toString()).join('\n')}
    ==============================
    `;
  }
}

class AddressHistory {
  constructor() {
    this.history = {};
  }

  addTransaction(transaction) {
    if (!this.history[transaction.sender]) {
      this.history[transaction.sender] = [];
    }
    if (!this.history[transaction.receiver]) {
      this.history[transaction.receiver] = [];
    }
    this.history[transaction.sender].push(transaction);
    this.history[transaction.receiver].push(transaction);
  }

  getHistory(address) {
    return this.history[address] || [];
  }
}

class Node {
  constructor(blockchain) {
    this.blockchain = blockchain;
    this.peers = [];
  }

  addPeer(peer) {
    this.peers.push(peer);
  }

  broadcastTransaction(transaction) {
    this.peers.forEach(peer => {
      peer.receiveTransaction(transaction);
    });
  }

  broadcastBlock(block) {
    this.peers.forEach(peer => {
      peer.receiveBlock(block);
    });
  }

  receiveTransaction(transaction) {
    this.blockchain.createTransaction(transaction);
  }

  receiveBlock(block) {
    const latestBlock = this.blockchain.getLatestBlock();
    if (block.previousHash === latestBlock.hash && block.hash === block.calculateHash()) {
      this.blockchain.chain.push(block);
      block.transactions.forEach(tx => addressHistory.addTransaction(tx));
    } else {
      this.resolveFork(block);
    }
  }

  resolveFork(newBlock) {
    const newChain = [...this.blockchain.chain, newBlock];
    if (newChain.length > this.blockchain.chain.length && this.isChainValid(newChain)) {
      this.blockchain.chain = newChain;
      console.log("Fork resolved: adopted the longer chain.");
    } else {
      console.log("Fork detected but the new chain is not longer or invalid.");
    }
  }

  isChainValid(chain) {
    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }
}

class Transaction {
  constructor(amount, sender, receiver, fee = 0) {
    this.amount = amount;
    this.sender = sender;
    this.receiver = receiver;
    this.fee = fee;
  }

  verifyBalanceSender() {
    if (this.sender === null) return true;
    return balanceTracker.getBalance(this.sender) >= this.amount + this.fee;
  }

  toString() {
    return `SENDER: ${this.sender}, AMOUNT: ${this.amount}, RECEIVER: ${this.receiver}, FEE: ${this.fee}`;
  }
}

class Wallet {
  constructor() {
    this.address = this.generateAddress();
  }

  generateAddress() {
    return CryptoJs.SHA256(Date.now().toString() + Math.random().toString()).toString();
  }
}

class BalanceTracker {
  constructor() {
    this.balances = {};
  }

  updateBalances(transactions, minerAddress) {
    transactions.forEach(tx => {
      if (!this.balances[tx.sender]) {
        this.balances[tx.sender] = 0;
      }
      if (!this.balances[tx.receiver]) {
        this.balances[tx.receiver] = 0;
      }
      this.balances[tx.sender] -= (tx.amount + tx.fee);
      this.balances[tx.receiver] += tx.amount;
      this.balances[minerAddress] = (this.balances[minerAddress] || 0) + tx.fee;
    });
  }

  getBalance(address) {
    return this.balances[address] || 0;
  }

  addInitialBalance(address, amount) {
    this.balances[address] = (this.balances[address] || 0) + amount;
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.pendingTransactions = [];
    this.difficulty = 2;
  }

  createGenesisBlock() {
    return new Block(Date.now().toString(), [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(minerAddress) {
    let block = new Block(Date.now().toString(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty, minerAddress);
    this.chain.push(block);
    this.pendingTransactions.forEach(tx => {
      addressHistory.addTransaction(tx);
      balanceTracker.updateBalances([tx], minerAddress);
    });
    this.pendingTransactions = [];
  }

  createTransaction(transaction) {
    if (!this.isValidAddress(transaction.sender) || !this.isValidAddress(transaction.receiver)) {
      console.log('Invalid address detected. Transaction rejected.');
      return;
    }

    if (transaction.sender && !transaction.verifyBalanceSender()) {
      console.log(`Transaction rejected: insufficient balance for sender ${transaction.sender}.`);
      return;
    }

    this.pendingTransactions.push(transaction);
  }

  isValidAddress(address) {
    return typeof address === 'string' && address.length > 0;
  }
}

let myCoin = new Blockchain();
const addressHistory = new AddressHistory();
const balanceTracker = new BalanceTracker();

const wallet1 = new Wallet();
const wallet2 = new Wallet();
const wallet3 = new Wallet();
const wallet4 = new Wallet();
const walletMiner = new Wallet();

balanceTracker.addInitialBalance(wallet1.address, 100);
balanceTracker.addInitialBalance(wallet2.address, 50);
balanceTracker.addInitialBalance(wallet3.address, 70);
balanceTracker.addInitialBalance(wallet4.address, 30);

const node1 = new Node(myCoin);
const node2 = new Node(myCoin);
const node3 = new Node(myCoin);

node1.addPeer(node2);
node1.addPeer(node3);
node2.addPeer(node1);
node2.addPeer(node3);
node3.addPeer(node1);
node3.addPeer(node2);

const transaction1 = new Transaction(50, wallet1.address, wallet2.address, 1);
const transaction2 = new Transaction(20, wallet2.address, wallet3.address, 0.5);
node1.broadcastTransaction(transaction1);
node1.broadcastTransaction(transaction2);
myCoin.addBlock(walletMiner.address);
node1.broadcastBlock(myCoin.getLatestBlock());

const transaction3 = new Transaction(10000, wallet3.address, wallet4.address, 0.2);
const transaction4 = new Transaction(5, wallet4.address, wallet1.address, 0.1);
node1.broadcastTransaction(transaction3);
node1.broadcastTransaction(transaction4);
myCoin.addBlock(walletMiner.address);
node1.broadcastBlock(myCoin.getLatestBlock());

console.log("Blockchain:");
myCoin.chain.forEach(block => {
  console.log(block.toString());
});

console.log("Histórico de transações da carteira 1:");
console.log(addressHistory.getHistory(wallet1.address).map(tx => tx.toString()).join('\n'));

console.log("Histórico de transações da carteira 2:");
console.log(addressHistory.getHistory(wallet2.address).map(tx => tx.toString()).join('\n'));

console.log("Histórico de transações da carteira 3:");
console.log(addressHistory.getHistory(wallet3.address).map(tx => tx.toString()).join('\n'));

console.log("Histórico de transações da carteira 4:");
console.log(addressHistory.getHistory(wallet4.address).map(tx => tx.toString()).join('\n'));

console.log("Saldo da wallet 1:", balanceTracker.getBalance(wallet1.address));
console.log("Saldo da wallet 2:", balanceTracker.getBalance(wallet2.address));
console.log("Saldo da wallet 3:", balanceTracker.getBalance(wallet3.address));
console.log("Saldo da wallet 4:", balanceTracker.getBalance(wallet4.address));
console.log("Saldo da wallet Miner:", balanceTracker.getBalance(walletMiner.address));

console.log("Nodes e os peers:");
console.log("Node 1 peers:", node1.peers.map(peer => peer.blockchain.chain[0].hash));
console.log("Node 2 peers:", node2.peers.map(peer => peer.blockchain.chain[0].hash));
console.log("Node 3 peers:", node3.peers.map(peer => peer.blockchain.chain[0].hash));
