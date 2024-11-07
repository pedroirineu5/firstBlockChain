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

  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined: " + this.hash);
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

class Transaction {
  constructor(amount, sender, receiver) {
    this.amount = amount;
    this.sender = sender;
    this.receiver = receiver;
  }

  toString() {
    return `SENDER: ${this.sender}, AMOUNT: ${this.amount}, RECEIVER:${this.receiver}`;
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

  addBlock() {
    let block = new Block(Date.now().toString(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.pendingTransactions.forEach(tx => addressHistory.addTransaction(tx));
    this.pendingTransactions = [];
  }

  createTransaction(transaction) {
    if (this.isValidAddress(transaction.sender) && this.isValidAddress(transaction.receiver)) {
      this.pendingTransactions.push(transaction);
    } else {
      console.log('Invalid address detected. Transaction rejected.');
    }
  }

  isValidAddress(address) {
    return typeof address === 'string' && address.length > 0;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

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

let myCoin = new Blockchain();
const addressHistory = new AddressHistory();

const wallet1 = new Wallet();
const wallet2 = new Wallet();
const wallet3 = new Wallet();
const wallet4 = new Wallet();

myCoin.createTransaction(new Transaction(50, wallet1.address, wallet2.address));
myCoin.createTransaction(new Transaction(20, wallet2.address, wallet3.address));
myCoin.addBlock();

myCoin.createTransaction(new Transaction(10, wallet3.address, wallet4.address));
myCoin.createTransaction(new Transaction(5, wallet4.address, wallet1.address));
myCoin.addBlock();

// testando histórico
console.log("Histórico de transações da carteira 1:");
console.log(addressHistory.getHistory(wallet1.address).map(tx => tx.toString()).join('\n'));

console.log("Histórico de transações da carteira 2:");
console.log(addressHistory.getHistory(wallet2.address).map(tx => tx.toString()).join('\n'));

console.log("Histórico de transações da carteira 3:");
console.log(addressHistory.getHistory(wallet3.address).map(tx => tx.toString()).join('\n'));

console.log("Histórico de transações da carteira 4:");
console.log(addressHistory.getHistory(wallet4.address).map(tx => tx.toString()).join('\n'));