import { Block } from './Block';
import { InsertBlock, InsertTransaction } from '@shared/schema';

export class Blockchain {
  chain: Block[];
  difficulty: number;
  pendingTransactions: InsertTransaction[];

  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
  }

  createGenesisBlock(): Block {
    return new Block(0, "0", new Date(), "Genesis Block", 0, 0);
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data: string, transactionCount: number = 0): Block {
    const previousBlock = this.getLatestBlock();
    const newBlockNumber = previousBlock.blockNumber + 1;
    const newBlock = new Block(
      newBlockNumber,
      previousBlock.hash,
      new Date(),
      data,
      0,
      transactionCount
    );

    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
    return newBlock;
  }

  addTransaction(transaction: InsertTransaction): void {
    this.pendingTransactions.push(transaction);
  }

  processPendingTransactions(): Block | null {
    if (this.pendingTransactions.length === 0) {
      return null;
    }

    const transactionsData = JSON.stringify(this.pendingTransactions);
    const newBlock = this.addBlock(transactionsData, this.pendingTransactions.length);
    this.pendingTransactions = [];
    return newBlock;
  }

  isChainValid(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Check if the hash is valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // Check if the chain is intact
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getBlockByHash(hash: string): Block | undefined {
    return this.chain.find(block => block.hash === hash);
  }

  getBlockByNumber(blockNumber: number): Block | undefined {
    return this.chain.find(block => block.blockNumber === blockNumber);
  }

  getAllBlocks(): Block[] {
    return [...this.chain].reverse(); // Return newest blocks first
  }

  getRecentBlocks(count: number = 5): Block[] {
    return this.getAllBlocks().slice(0, count);
  }

  // Convert blockchain to a format that can be stored
  toJSON(): InsertBlock[] {
    return this.chain.map(block => ({
      blockNumber: block.blockNumber,
      hash: block.hash,
      previousHash: block.previousHash,
      timestamp: block.timestamp,
      data: block.data,
      nonce: block.nonce,
      transactionCount: block.transactionCount
    }));
  }

  // Recreate blockchain from stored blocks
  static fromJSON(blocks: InsertBlock[]): Blockchain {
    const blockchain = new Blockchain();
    // Clear the chain except genesis block if there are blocks to restore
    if (blocks.length > 0) {
      blockchain.chain = [];
    }

    // Sort blocks by blockNumber to ensure proper order
    blocks.sort((a, b) => a.blockNumber - b.blockNumber);

    for (const blockData of blocks) {
      const block = new Block(
        blockData.blockNumber,
        blockData.previousHash,
        new Date(blockData.timestamp),
        blockData.data,
        blockData.nonce,
        blockData.transactionCount
      );
      // Ensure the hash is correct (in case it was stored)
      block.hash = blockData.hash;
      blockchain.chain.push(block);
    }

    return blockchain;
  }
}
