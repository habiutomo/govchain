import crypto from 'crypto';

/**
 * Calculate SHA-256 hash of input data
 * @param data - The data to hash
 * @returns SHA-256 hash as hexadecimal string
 */
export function calculateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate a random transaction hash
 * @returns Random transaction hash
 */
export function generateTransactionHash(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify if a document hash exists in the blockchain data
 * @param blockchain - Array of blocks to search through
 * @param documentHash - Hash to search for
 * @returns Boolean indicating if the hash was found
 */
export function verifyDocumentInBlockchain(blockchainData: string[], documentHash: string): { found: boolean, blockNumber?: number } {
  for (let i = 0; i < blockchainData.length; i++) {
    try {
      // Try to parse the block data as JSON
      const data = JSON.parse(blockchainData[i]);
      
      // Check if data contains documents
      if (Array.isArray(data) && data.some(item => item.hash === documentHash)) {
        return { found: true, blockNumber: i };
      }
    } catch (error) {
      // If data can't be parsed as JSON, check if it contains the hash as a string
      if (blockchainData[i].includes(documentHash)) {
        return { found: true, blockNumber: i };
      }
    }
  }
  
  return { found: false };
}

/**
 * Create a simple proof of work implementation
 * @param data - Data to calculate proof for
 * @param difficulty - Number of leading zeros required
 * @returns Object containing nonce and hash
 */
export function createProofOfWork(data: string, difficulty: number): { nonce: number, hash: string } {
  let nonce = 0;
  let hash = '';
  const target = Array(difficulty + 1).join("0");
  
  while (hash.substring(0, difficulty) !== target) {
    nonce++;
    hash = calculateHash(data + nonce);
  }
  
  return { nonce, hash };
}

/**
 * Generates a digital signature for a message using a private key
 * This is a simple implementation - in a real system, proper key management would be required
 * @param message - The message to sign
 * @param privateKey - Private key to sign with (hexadecimal string)
 * @returns Digital signature
 */
export function generateDigitalSignature(message: string, privateKey: string): string {
  // In a real implementation, we would use proper asymmetric cryptography
  // For this demo, we'll use HMAC with the private key
  return crypto.createHmac('sha256', privateKey).update(message).digest('hex');
}

/**
 * Verify a digital signature
 * @param message - Original message
 * @param signature - Signature to verify
 * @param publicKey - Public key corresponding to the private key used for signing
 * @returns Boolean indicating if signature is valid
 */
export function verifyDigitalSignature(message: string, signature: string, publicKey: string): boolean {
  // In a real implementation, we would use proper asymmetric cryptography
  // For this demo, we'll recreate the signature and compare
  const expectedSignature = crypto.createHmac('sha256', publicKey).update(message).digest('hex');
  return expectedSignature === signature;
}

/**
 * Generate a random hash for document verification
 * @returns Random document hash
 */
export function generateDocumentHash(): string {
  return crypto.randomBytes(20).toString('hex');
}
