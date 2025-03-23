import { apiRequest } from './queryClient';

// Types
export interface BlockchainInfo {
  networkName: string;
  nodes: number;
  lastBlock: number;
  status: 'operational' | 'degraded' | 'down';
  uptime: number;
}

export interface BlockData {
  blockNumber: number;
  timestamp: Date;
  transactionCount: number;
  size: number;
  blockHash: string;
  previousHash: string;
  data: {
    transactions: BlockTransaction[];
  };
}

export interface BlockTransaction {
  hash: string;
  type: string;
  department: string;
  amount: number;
  status: 'verified' | 'pending';
}

// Fetch blockchain info
export async function fetchBlockchainInfo(): Promise<BlockchainInfo> {
  const response = await apiRequest('GET', '/api/blockchain/info');
  return response.json();
}

// Fetch block data
export async function fetchBlockData(blockNumber: number): Promise<BlockData> {
  const response = await apiRequest('GET', `/api/blocks/${blockNumber}`);
  return response.json();
}

// Verify document hash
export async function verifyDocumentHash(hash: string): Promise<{ verified: boolean; blockNumber?: number; timestamp?: Date }> {
  const response = await apiRequest('POST', '/api/documents/verify', { hash });
  return response.json();
}

// Verify identity
export async function verifyIdentity(id: number): Promise<{ verified: boolean; identityHash: string; blockNumber?: number }> {
  const response = await apiRequest('POST', `/api/users/${id}/verify`);
  return response.json();
}

// Create transaction
export async function createTransaction(transaction: any): Promise<{ hash: string; blockNumber?: number }> {
  const response = await apiRequest('POST', '/api/transactions/create', transaction);
  return response.json();
}

// Calculate document hash
export function calculateHash(data: string): string {
  // In a real implementation, this would use a proper hashing algorithm
  // For demo purposes, we're just simulating it here
  return `0x${Array.from(
    { length: 64 },
    () => Math.floor(Math.random() * 16).toString(16)
  ).join('')}`;
}
