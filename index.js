const CryptoJs = require('crypto-js');

class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  // cálculo do hash
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

class Transaction {
  constructor(amount, sender, receiver) {
    this.amount = amount;
    this.sender = sender;
    this.receiver = receiver;
  }

  toString() {
    return `${this.sender}, ${this.amount}, ${this.receiver}`;
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

  // Função para adicionar um novo bloco, dessa vez com mineração.
  addBlock() {
    let block = new Block(Date.now().toString(), this.pendingTransactions, this.getLatestBlock().hash);
    block.mineBlock(this.difficulty);
    this.chain.push(block);
    this.pendingTransactions = [];
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
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

myCoin.createTransaction(new Transaction(50, "Kadu", "Andrade"));
myCoin.createTransaction(new Transaction(20, "Andrade", "Ricardo"));
myCoin.addBlock();

myCoin.createTransaction(new Transaction(10, "Ricardo", "Irineu"));
myCoin.addBlock();

//Fraude, apenas para testar a função de validação da blockchain.
//myCoin.chain[1].transactions[0] = 1000;

myCoin.chain.forEach(block => {
  console.log(block.toString());
});

console.log('Is blockchain valid?', myCoin.isChainValid());
