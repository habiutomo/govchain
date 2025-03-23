import crypto from 'crypto';
import { Block, Transaction, Document, User, InsertBlock } from '../shared/schema';

// Simple blockchain implementation for government data
export class Blockchain {
  private static instance: Blockchain;
  private currentDifficulty: number = 2; // Number of leading zeros in hash

  private constructor() {}

  public static getInstance(): Blockchain {
    if (!Blockchain.instance) {
      Blockchain.instance = new Blockchain();
    }
    return Blockchain.instance;
  }

  // Generate a hash for a block
  public generateBlockHash(blockNumber: number, previousHash: string, timestamp: Date, data: any): string {
    const stringToHash = `${blockNumber}${previousHash}${timestamp.toISOString()}${JSON.stringify(data)}`;
    return this.generateHash(stringToHash);
  }

  // Generate a transaction hash
  public generateTransactionHash(transaction: Partial<Transaction>): string {
    const stringToHash = `${transaction.department}${transaction.amount}${transaction.date?.toISOString()}${transaction.category}${transaction.description || ''}`;
    return this.generateHash(stringToHash);
  }

  // Generate a document hash
  public generateDocumentHash(document: Partial<Document>): string {
    const stringToHash = `${document.name}${document.fileType}${document.uploadedAt?.toISOString()}`;
    return this.generateHash(stringToHash);
  }

  // Generate an identity hash
  public generateIdentityHash(user: Partial<User>): string {
    const stringToHash = `${user.username}${user.fullName}${user.idNumber}${user.department || ''}${user.identityType}${user.authorizationLevel}`;
    return this.generateHash(stringToHash);
  }

  // Generic hash function
  public generateHash(data: string): string {
    return '0x' + crypto.createHash('sha256').update(data).digest('hex');
  }

  // Create a new block with transactions
  public async createBlock(
    blockNumber: number, 
    previousHash: string, 
    transactions: Transaction[]
  ): Promise<InsertBlock> {
    const timestamp = new Date();
    const transactionCount = transactions.length;
    
    // Calculate size based on data (simplified)
    const dataStr = JSON.stringify({ transactions });
    const size = Buffer.from(dataStr).length;
    
    // Build block data
    const data = {
      transactions: transactions.map(tx => ({
        hash: tx.transactionHash,
        type: tx.category,
        department: tx.department,
        amount: tx.amount,
        status: tx.status
      }))
    };
    
    // Generate the block hash with proof of work
    const blockHash = this.mineBlock(blockNumber, previousHash, timestamp, data);
    
    // Create the block
    return {
      blockNumber,
      timestamp,
      transactionCount,
      size,
      blockHash,
      previousHash,
      data
    };
  }

  // Mine a block (simplified proof of work)
  private mineBlock(blockNumber: number, previousHash: string, timestamp: Date, data: any): string {
    let nonce = 0;
    let hash = '';
    
    while (true) {
      const stringToHash = `${blockNumber}${previousHash}${timestamp.toISOString()}${JSON.stringify(data)}${nonce}`;
      hash = this.generateHash(stringToHash);
      
      // Check if hash meets difficulty requirement (starts with N zeros)
      if (hash.startsWith('0x' + '0'.repeat(this.currentDifficulty))) {
        break;
      }
      
      nonce++;
    }
    
    return hash;
  }

  // Verify a block is valid
  public verifyBlock(block: Block): boolean {
    // Check if the hash is valid
    const calculatedHash = this.generateBlockHash(
      block.blockNumber,
      block.previousHash,
      block.timestamp,
      block.data
    );
    
    // Hash should match and meet difficulty requirements
    return block.blockHash === calculatedHash && 
           block.blockHash.startsWith('0x' + '0'.repeat(this.currentDifficulty));
  }

  // Verify a chain of blocks (simplified)
  public verifyChain(blocks: Block[]): boolean {
    if (blocks.length === 0) return true;
    
    // Sort blocks by blockNumber
    const sortedBlocks = [...blocks].sort((a, b) => a.blockNumber - b.blockNumber);
    
    for (let i = 1; i < sortedBlocks.length; i++) {
      const currentBlock = sortedBlocks[i];
      const previousBlock = sortedBlocks[i - 1];
      
      // Check block integrity
      if (!this.verifyBlock(currentBlock)) {
        return false;
      }
      
      // Check block linkage (previous hash)
      if (currentBlock.previousHash !== previousBlock.blockHash) {
        return false;
      }
    }
    
    return true;
  }

  // Get blockchain network information
  public getNetworkInfo() {
    return {
      networkName: "GovChain",
      nodes: 162, // Simulated node count
      lastBlock: 0, // This will be updated with the actual last block
      status: "operational" as const,
      uptime: 99.98 // Simulated uptime percentage
    };
  }
}

// Export singleton instance
export const blockchain = Blockchain.getInstance();
