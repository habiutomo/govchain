import { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTransactionSchema, insertDocumentSchema, insertDigitalIdentitySchema } from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { generateDocumentHash } from "./blockchain/utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Error Handler Middleware
  const handleApiError = (err: Error, res: Response) => {
    console.error("API Error:", err);
    if (err instanceof ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: fromZodError(err).message,
      });
    }
    return res.status(500).json({ error: err.message });
  };

  // Get dashboard stats
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  // Blockchain Routes
  app.get("/api/blocks", async (req: Request, res: Response) => {
    try {
      const count = req.query.count ? parseInt(req.query.count as string) : 5;
      const blocks = await storage.getRecentBlocks(count);
      res.json(blocks);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  app.get("/api/blocks/:id", async (req: Request, res: Response) => {
    try {
      const blockId = parseInt(req.params.id);
      const block = await storage.getBlockByNumber(blockId);
      
      if (!block) {
        return res.status(404).json({ error: "Block not found" });
      }
      
      res.json(block);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  // Transaction Routes
  app.get("/api/transactions", async (req: Request, res: Response) => {
    try {
      let transactions;
      
      if (req.query.type) {
        transactions = await storage.getTransactionsByType(req.query.type as string);
      } else {
        transactions = await storage.getTransactions();
      }
      
      res.json(transactions);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  app.get("/api/transactions/budget", async (req: Request, res: Response) => {
    try {
      const transactions = await storage.getBudgetTransactions();
      res.json(transactions);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const newTransaction = await storage.addTransaction(validatedData);
      res.status(201).json(newTransaction);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  // Document Routes
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const documents = await storage.getDocuments();
      
      // Filter by search term if provided
      if (req.query.search) {
        const searchTerm = (req.query.search as string).toLowerCase();
        const filtered = documents.filter(
          doc => doc.name.toLowerCase().includes(searchTerm) || 
                 doc.hash.toLowerCase().includes(searchTerm)
        );
        return res.json(filtered);
      }
      
      res.json(documents);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  app.get("/api/documents/recent", async (req: Request, res: Response) => {
    try {
      const count = req.query.count ? parseInt(req.query.count as string) : 3;
      const documents = await storage.getRecentDocuments(count);
      res.json(documents);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDocumentSchema.parse(req.body);
      const newDocument = await storage.addDocument(validatedData);
      res.status(201).json(newDocument);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  app.post("/api/documents/upload", async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would handle file uploads
      // For this demo, we'll create a document with mock data
      const documentName = req.body.name || "Uploaded Document.pdf";
      const documentHash = generateDocumentHash();
      
      const newDocument = await storage.addDocument({
        name: documentName,
        hash: documentHash,
      });
      
      res.status(201).json(newDocument);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  app.post("/api/documents/verify", async (req: Request, res: Response) => {
    try {
      const { hash } = req.body;
      
      if (!hash || typeof hash !== 'string') {
        return res.status(400).json({ error: "Valid document hash is required" });
      }
      
      // Find the document
      const document = await storage.getDocumentByHash(hash);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      if (document.verified) {
        return res.status(400).json({ 
          error: "Document already verified",
          document
        });
      }
      
      // Verify the document on blockchain
      const verifiedDocument = await storage.verifyDocument(hash);
      
      if (!verifiedDocument) {
        return res.status(500).json({ error: "Verification failed" });
      }
      
      res.json(verifiedDocument);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  // Budget Routes
  app.get("/api/budget", async (req: Request, res: Response) => {
    try {
      const budgetItems = await storage.getBudgetItems();
      res.json(budgetItems);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  // Digital Identity Routes
  app.get("/api/digital-identities", async (req: Request, res: Response) => {
    try {
      const identities = await storage.getDigitalIdentities();
      res.json(identities);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  app.get("/api/digital-identities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const identity = await storage.getDigitalIdentityById(id);
      
      if (!identity) {
        return res.status(404).json({ error: "Digital identity not found" });
      }
      
      res.json(identity);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  app.post("/api/digital-identities", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDigitalIdentitySchema.parse(req.body);
      
      // Check if identifier already exists
      const existing = await storage.getDigitalIdentityByIdentifier(validatedData.identifier);
      if (existing) {
        return res.status(400).json({ error: "Identifier already exists" });
      }
      
      const newIdentity = await storage.addDigitalIdentity(validatedData);
      res.status(201).json(newIdentity);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  app.delete("/api/digital-identities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const identity = await storage.getDigitalIdentityById(id);
      
      if (!identity) {
        return res.status(404).json({ error: "Digital identity not found" });
      }
      
      if (!identity.active) {
        return res.status(400).json({ error: "Digital identity already revoked" });
      }
      
      const revokedIdentity = await storage.revokeDigitalIdentity(id);
      res.json(revokedIdentity);
    } catch (err) {
      handleApiError(err as Error, res);
    }
  });

  // Initialize with some sample transactions
  await initializeTransactions();

  const httpServer = createServer(app);
  return httpServer;
  
  // Helper function to initialize sample data
  async function initializeTransactions() {
    try {
      const existingTransactions = await storage.getTransactions();
      
      // Only initialize if no transactions exist
      if (existingTransactions.length === 0) {
        const types = ['Procurement', 'Budget Allocation', 'Grants', 'Salaries', 'Procurement'];
        const entities = [
          'Department of Infrastructure', 
          'Department of Education',
          'Community Development Fund',
          'Public Service Payroll',
          'Department of Healthcare'
        ];
        const amounts = [123456, 500000, 75000, 1245300, 287450];
        const statuses = ['Confirmed', 'Confirmed', 'Pending', 'Confirmed', 'Confirmed'];
        
        // Create transactions with different timestamps
        const now = new Date();
        const timestamps = [];
        for (let i = 0; i < 5; i++) {
          const timestamp = new Date(now);
          timestamp.setMinutes(now.getMinutes() - i * 5);
          timestamps.push(timestamp);
        }
        
        for (let i = 0; i < types.length; i++) {
          await storage.addTransaction({
            hash: '',  // Will be generated
            blockId: 1,
            type: types[i],
            entity: entities[i],
            amount: amounts[i],
            status: statuses[i],
            timestamp: timestamps[i]
          });
        }
        
        // Initialize some documents
        const docNames = [
          'Budget Approval 2023.pdf',
          'Construction Permit #4532.pdf',
          'Public Safety Report Q2.pdf'
        ];
        
        for (let i = 0; i < docNames.length; i++) {
          const doc = await storage.addDocument({
            name: docNames[i],
            hash: generateDocumentHash()
          });
          
          // Verify the document
          await storage.verifyDocument(doc.hash);
        }
      }
    } catch (err) {
      console.error("Error initializing data:", err);
    }
  }
}
