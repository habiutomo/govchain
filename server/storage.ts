import { 
  User, 
  InsertUser, 
  Block, 
  InsertBlock, 
  Transaction, 
  InsertTransaction, 
  Document, 
  InsertDocument, 
  BudgetItem, 
  InsertBudgetItem,
  DigitalIdentity,
  InsertDigitalIdentity,
  Stats
} from "@shared/schema";
import { Blockchain } from "./blockchain/Blockchain";
import { Block as BlockClass } from "./blockchain/Block";
import { generateTransactionHash, generateDocumentHash } from "./blockchain/utils";

// Interface for all storage operations
export interface IStorage {
  // Original user methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Blockchain methods
  getBlockchain(): Promise<Blockchain>;
  getBlocks(): Promise<Block[]>;
  getBlockByHash(hash: string): Promise<Block | undefined>;
  getBlockByNumber(blockNumber: number): Promise<Block | undefined>;
  getRecentBlocks(count?: number): Promise<Block[]>;
  addBlock(block: InsertBlock): Promise<Block>;

  // Transaction methods
  getTransactions(): Promise<Transaction[]>;
  getTransactionsByType(type: string): Promise<Transaction[]>;
  getTransactionsByBlockId(blockId: number): Promise<Transaction[]>;
  getRecentTransactions(count?: number): Promise<Transaction[]>;
  getBudgetTransactions(): Promise<Transaction[]>;
  addTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Document methods
  getDocuments(): Promise<Document[]>;
  getDocumentByHash(hash: string): Promise<Document | undefined>;
  getRecentDocuments(count?: number): Promise<Document[]>;
  addDocument(document: InsertDocument): Promise<Document>;
  verifyDocument(hash: string): Promise<Document | undefined>;

  // Budget methods
  getBudgetItems(): Promise<BudgetItem[]>;
  getBudgetItemById(id: number): Promise<BudgetItem | undefined>;
  addBudgetItem(item: InsertBudgetItem): Promise<BudgetItem>;
  updateBudgetSpending(id: number, amount: number): Promise<BudgetItem | undefined>;

  // Digital Identity methods
  getDigitalIdentities(): Promise<DigitalIdentity[]>;
  getDigitalIdentityById(id: number): Promise<DigitalIdentity | undefined>;
  getDigitalIdentityByIdentifier(identifier: string): Promise<DigitalIdentity | undefined>;
  addDigitalIdentity(identity: InsertDigitalIdentity): Promise<DigitalIdentity>;
  revokeDigitalIdentity(id: number): Promise<DigitalIdentity | undefined>;

  // Dashboard stats
  getStats(): Promise<Stats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private blockchain: Blockchain;
  private blocks: Map<number, Block>;
  private transactions: Map<number, Transaction>;
  private documents: Map<number, Document>;
  private budgetItems: Map<number, BudgetItem>;
  private digitalIdentities: Map<number, DigitalIdentity>;
  private userIdCounter: number;
  private transactionIdCounter: number;
  private documentIdCounter: number;
  private budgetItemIdCounter: number;
  private identityIdCounter: number;

  constructor() {
    this.users = new Map();
    this.blockchain = new Blockchain();
    this.blocks = new Map();
    this.transactions = new Map();
    this.documents = new Map();
    this.budgetItems = new Map();
    this.digitalIdentities = new Map();
    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.documentIdCounter = 1;
    this.budgetItemIdCounter = 1;
    this.identityIdCounter = 1;

    // Initialize with some blocks from the blockchain
    const initialBlocks = this.blockchain.toJSON();
    for (const block of initialBlocks) {
      this.addBlock(block);
    }

    // Add initial budget items
    this.initializeBudgetItems();
  }

  // Initialize sample budget data
  private initializeBudgetItems(): void {
    const categories = ['Education', 'Healthcare', 'Infrastructure', 'Public Safety'];
    const allocations = [12000000, 20000000, 16000000, 10000000];
    const spent = [9300000, 13000000, 6700000, 8500000];

    for (let i = 0; i < categories.length; i++) {
      this.addBudgetItem({
        category: categories[i],
        allocated: allocations[i],
        spent: spent[i],
        fiscalYear: '2023'
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Blockchain methods
  async getBlockchain(): Promise<Blockchain> {
    return this.blockchain;
  }

  async getBlocks(): Promise<Block[]> {
    return Array.from(this.blocks.values());
  }

  async getBlockByHash(hash: string): Promise<Block | undefined> {
    return Array.from(this.blocks.values()).find(block => block.hash === hash);
  }

  async getBlockByNumber(blockNumber: number): Promise<Block | undefined> {
    return this.blocks.get(blockNumber);
  }

  async getRecentBlocks(count: number = 5): Promise<Block[]> {
    return Array.from(this.blocks.values())
      .sort((a, b) => b.blockNumber - a.blockNumber)
      .slice(0, count);
  }

  async addBlock(insertBlock: InsertBlock): Promise<Block> {
    const block: Block = {
      ...insertBlock,
      id: insertBlock.blockNumber // Use blockNumber as id for simplicity
    };
    this.blocks.set(block.blockNumber, block);
    return block;
  }

  // Transaction methods
  async getTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values());
  }

  async getTransactionsByType(type: string): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.type === type);
  }

  async getTransactionsByBlockId(blockId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => tx.blockId === blockId);
  }

  async getRecentTransactions(count: number = 5): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  }

  async getBudgetTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(tx => ['Budget Allocation', 'Procurement', 'Grants', 'Salaries'].includes(tx.type))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      hash: insertTransaction.hash || generateTransactionHash()
    };
    this.transactions.set(id, transaction);

    // Add to blockchain pending transactions
    this.blockchain.addTransaction(insertTransaction);

    // Process transactions periodically (here for simplicity, we process after each transaction)
    const newBlock = this.blockchain.processPendingTransactions();
    if (newBlock) {
      await this.addBlock({
        blockNumber: newBlock.blockNumber,
        hash: newBlock.hash,
        previousHash: newBlock.previousHash,
        timestamp: newBlock.timestamp,
        data: newBlock.data,
        nonce: newBlock.nonce,
        transactionCount: newBlock.transactionCount
      });
    }

    return transaction;
  }

  // Document methods
  async getDocuments(): Promise<Document[]> {
    return Array.from(this.documents.values());
  }

  async getDocumentByHash(hash: string): Promise<Document | undefined> {
    return Array.from(this.documents.values())
      .find(doc => doc.hash === hash);
  }

  async getRecentDocuments(count: number = 3): Promise<Document[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.verified)
      .sort((a, b) => {
        const dateA = a.verifiedAt ? new Date(a.verifiedAt).getTime() : 0;
        const dateB = b.verifiedAt ? new Date(b.verifiedAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, count);
  }

  async addDocument(insertDocument: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const document: Document = {
      ...insertDocument,
      id,
      verified: false,
      createdAt: new Date(),
      hash: insertDocument.hash || generateDocumentHash()
    };
    this.documents.set(id, document);
    return document;
  }

  async verifyDocument(hash: string): Promise<Document | undefined> {
    const document = await this.getDocumentByHash(hash);
    if (!document) return undefined;

    // Create block with document data to record on blockchain
    const blockchainData = JSON.stringify([{ hash, name: document.name, verifiedAt: new Date() }]);
    const newBlock = this.blockchain.addBlock(blockchainData, 1);
    
    // Add the block to our storage
    await this.addBlock({
      blockNumber: newBlock.blockNumber,
      hash: newBlock.hash,
      previousHash: newBlock.previousHash,
      timestamp: newBlock.timestamp,
      data: newBlock.data,
      nonce: newBlock.nonce,
      transactionCount: newBlock.transactionCount
    });

    // Update document with verification information
    const updatedDocument: Document = {
      ...document,
      verified: true,
      verifiedAt: new Date(),
      blockId: newBlock.blockNumber
    };
    this.documents.set(document.id, updatedDocument);
    
    return updatedDocument;
  }

  // Budget methods
  async getBudgetItems(): Promise<BudgetItem[]> {
    return Array.from(this.budgetItems.values());
  }

  async getBudgetItemById(id: number): Promise<BudgetItem | undefined> {
    return this.budgetItems.get(id);
  }

  async addBudgetItem(insertBudgetItem: InsertBudgetItem): Promise<BudgetItem> {
    const id = this.budgetItemIdCounter++;
    const budgetItem: BudgetItem = {
      ...insertBudgetItem,
      id
    };
    this.budgetItems.set(id, budgetItem);
    return budgetItem;
  }

  async updateBudgetSpending(id: number, amount: number): Promise<BudgetItem | undefined> {
    const item = await this.getBudgetItemById(id);
    if (!item) return undefined;

    const updatedItem: BudgetItem = {
      ...item,
      spent: item.spent + amount
    };
    this.budgetItems.set(id, updatedItem);
    return updatedItem;
  }

  // Digital Identity methods
  async getDigitalIdentities(): Promise<DigitalIdentity[]> {
    return Array.from(this.digitalIdentities.values());
  }

  async getDigitalIdentityById(id: number): Promise<DigitalIdentity | undefined> {
    return this.digitalIdentities.get(id);
  }

  async getDigitalIdentityByIdentifier(identifier: string): Promise<DigitalIdentity | undefined> {
    return Array.from(this.digitalIdentities.values())
      .find(identity => identity.identifier === identifier);
  }

  async addDigitalIdentity(insertIdentity: InsertDigitalIdentity): Promise<DigitalIdentity> {
    // Create a block for this identity
    const identityData = JSON.stringify({
      name: insertIdentity.name,
      identifier: insertIdentity.identifier,
      organization: insertIdentity.organization,
      role: insertIdentity.role,
      createdAt: new Date()
    });
    
    const newBlock = this.blockchain.addBlock(identityData, 1);
    
    // Add the block to our storage
    await this.addBlock({
      blockNumber: newBlock.blockNumber,
      hash: newBlock.hash,
      previousHash: newBlock.previousHash,
      timestamp: newBlock.timestamp,
      data: newBlock.data,
      nonce: newBlock.nonce,
      transactionCount: newBlock.transactionCount
    });

    const id = this.identityIdCounter++;
    const identity: DigitalIdentity = {
      ...insertIdentity,
      id,
      active: true,
      createdAt: new Date(),
      blockNumber: newBlock.blockNumber,
      transactionHash: newBlock.hash
    };
    this.digitalIdentities.set(id, identity);
    return identity;
  }

  async revokeDigitalIdentity(id: number): Promise<DigitalIdentity | undefined> {
    const identity = await this.getDigitalIdentityById(id);
    if (!identity) return undefined;

    // Create a revocation block
    const revocationData = JSON.stringify({
      identifier: identity.identifier,
      action: "revoke",
      revokedAt: new Date()
    });
    
    const newBlock = this.blockchain.addBlock(revocationData, 1);
    
    // Add the block to our storage
    await this.addBlock({
      blockNumber: newBlock.blockNumber,
      hash: newBlock.hash,
      previousHash: newBlock.previousHash,
      timestamp: newBlock.timestamp,
      data: newBlock.data,
      nonce: newBlock.nonce,
      transactionCount: newBlock.transactionCount
    });

    // Update identity with revocation information
    const updatedIdentity: DigitalIdentity = {
      ...identity,
      active: false,
      revokedAt: new Date()
    };
    this.digitalIdentities.set(id, updatedIdentity);
    
    return updatedIdentity;
  }

  // Dashboard stats
  async getStats(): Promise<Stats> {
    const blocks = await this.getBlocks();
    const transactions = await this.getTransactions();
    const documents = await this.getDocuments();
    const identities = await this.getDigitalIdentities();

    // Calculate daily transactions (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const dailyTransactions = transactions.filter(tx => 
      new Date(tx.timestamp).getTime() > oneDayAgo.getTime()
    ).length;

    return {
      totalBlocks: blocks.length,
      dailyTransactions,
      verifiedDocuments: documents.filter(doc => doc.verified).length,
      digitalIdentities: identities.length
    };
  }
}

export const storage = new MemStorage();
