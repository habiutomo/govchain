import { calculateHash } from "./utils";

export class Block {
  blockNumber: number;
  hash: string;
  previousHash: string;
  timestamp: Date;
  data: string;
  nonce: number;
  transactionCount: number;

  constructor(
    blockNumber: number,
    previousHash: string,
    timestamp: Date,
    data: string,
    nonce = 0,
    transactionCount = 0
  ) {
    this.blockNumber = blockNumber;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.nonce = nonce;
    this.transactionCount = transactionCount;
    this.hash = this.calculateHash();
  }

  calculateHash(): string {
    return calculateHash(
      this.blockNumber.toString() +
      this.previousHash +
      this.timestamp.getTime().toString() +
      this.data +
      this.nonce.toString()
    );
  }

  mineBlock(difficulty: number): void {
    const target = Array(difficulty + 1).join("0");
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined: " + this.hash);
  }
}
