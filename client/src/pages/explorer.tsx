import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  RefreshCw,
  Server,
  Database
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchBlockData, fetchBlockchainInfo } from '@/lib/blockchain';
import type { Block, Transaction } from '@shared/schema';

export default function Explorer() {
  const [activeTab, setActiveTab] = useState('blocks');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Block[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  
  const { data: blocks, isLoading: blocksLoading } = useQuery<Block[]>({
    queryKey: ['/api/blocks', page],
  });
  
  const { data: blockCount } = useQuery<number>({
    queryKey: ['/api/blocks/count'],
  });
  
  const { data: selectedBlock, isLoading: blockDetailLoading } = useQuery<Block>({
    queryKey: ['/api/blocks', selectedBlockId],
    enabled: !!selectedBlockId
  });
  
  const { data: blockchainInfo } = useQuery({
    queryKey: ['/api/blockchain/info'],
  });
  
  const { data: transactions, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions', { page, perPage: 10 }],
    enabled: activeTab === 'transactions'
  });
  
  const { data: transactionCount } = useQuery<number>({
    queryKey: ['/api/transactions/count'],
    enabled: activeTab === 'transactions'
  });
  
  const itemsPerPage = 10;
  const totalBlockPages = blockCount ? Math.ceil(blockCount / itemsPerPage) : 0;
  const totalTransactionPages = transactionCount ? Math.ceil(transactionCount / itemsPerPage) : 0;
  
  const displayedBlocks = searchTerm && searchResults.length > 0 ? searchResults : blocks || [];

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/blocks/search?term=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
      setActiveTab('blocks');
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const formatBlockNumber = (num: number) => {
    return "#" + num.toLocaleString();
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatSize = (bytes: number) => {
    const kb = bytes / 1024;
    return `${kb.toFixed(1)} KB`;
  };

  const formatHash = (hash: string) => {
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  useEffect(() => {
    // Reset search when tab changes
    setSearchTerm('');
    setSearchResults([]);
    setPage(1);
    setSelectedBlockId(null);
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Blockchain Explorer</h2>
        <p className="text-slate-500 mt-1">Explore the blockchain data, blocks, and transactions</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Blocks</p>
                <h3 className="text-2xl font-bold mt-1">{blockCount?.toLocaleString() || "0"}</h3>
              </div>
              <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Layers className="text-primary-600 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Network Nodes</p>
                <h3 className="text-2xl font-bold mt-1">{blockchainInfo?.nodes || "0"}</h3>
              </div>
              <div className="h-10 w-10 bg-secondary-100 rounded-full flex items-center justify-center">
                <Server className="text-secondary-600 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Network Status</p>
                <div className="flex items-center mt-2">
                  <div className="bg-green-500 h-3 w-3 rounded-full mr-2"></div>
                  <h3 className="text-md font-medium">Operational</h3>
                </div>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Database className="text-green-600 h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Blockchain Data</CardTitle>
            <div className="relative w-full md:w-64">
              <Input 
                type="text" 
                placeholder="Search by hash or number..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-10"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-0 top-0 h-full px-3" 
                onClick={handleSearch}
                disabled={isSearching}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Tabs 
            defaultValue="blocks" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="blocks">Blocks</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="blocks" className="space-y-4">
              {selectedBlockId && selectedBlock ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedBlockId(null)}
                    >
                      Back to Blocks
                    </Button>
                    <Badge className="text-lg py-1">
                      Block {formatBlockNumber(selectedBlock.blockNumber)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Block Hash</p>
                      <p className="text-sm font-mono mt-1 bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto">
                        {selectedBlock.blockHash}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Previous Hash</p>
                      <p className="text-sm font-mono mt-1 bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto">
                        {selectedBlock.previousHash}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Block Number</p>
                      <p className="text-sm">{selectedBlock.blockNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Timestamp</p>
                      <p className="text-sm">{formatTimestamp(selectedBlock.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Transactions</p>
                      <p className="text-sm">{selectedBlock.transactionCount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">Size</p>
                      <p className="text-sm">{formatSize(selectedBlock.size)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Block Transactions</h3>
                    {selectedBlock.data && selectedBlock.data.transactions && selectedBlock.data.transactions.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Transaction Hash</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedBlock.data.transactions.map((tx: any, index: number) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono">{formatHash(tx.hash)}</TableCell>
                              <TableCell>{tx.type}</TableCell>
                              <TableCell>{tx.department}</TableCell>
                              <TableCell>{tx.amount ? formatCurrency(tx.amount) : 'N/A'}</TableCell>
                              <TableCell>
                                <Badge variant={tx.status === 'verified' ? 'verified' : 'pending'}>
                                  {tx.status === 'verified' ? 'Verified' : 'Pending'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="flex justify-center items-center h-32 bg-slate-50 rounded-md">
                        <p className="text-slate-500">No transactions in this block</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {blocksLoading ? (
                    <div className="flex justify-center items-center h-48">
                      <RefreshCw className="h-5 w-5 text-primary animate-spin mr-2" />
                      <p className="text-slate-500">Loading blocks...</p>
                    </div>
                  ) : displayedBlocks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Block #</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Transactions</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Block Hash</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {displayedBlocks.map((block) => (
                            <TableRow key={block.id}>
                              <TableCell>
                                <div className="text-sm font-medium text-primary">
                                  {formatBlockNumber(block.blockNumber)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm text-slate-500">
                                  {formatTimestamp(block.timestamp)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{block.transactionCount}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">{formatSize(block.size)}</div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-mono">{formatHash(block.blockHash)}</div>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedBlockId(block.id)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      
                      {/* Pagination */}
                      {!searchTerm && totalBlockPages > 1 && (
                        <div className="flex justify-center mt-4">
                          <nav className="flex space-x-1" aria-label="Pagination">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setPage(p => Math.max(1, p - 1))}
                              disabled={page === 1}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            
                            {Array.from({ length: Math.min(5, totalBlockPages) }, (_, i) => {
                              let pageNum;
                              if (totalBlockPages <= 5) {
                                pageNum = i + 1;
                              } else if (page <= 3) {
                                pageNum = i + 1;
                              } else if (page >= totalBlockPages - 2) {
                                pageNum = totalBlockPages - 4 + i;
                              } else {
                                pageNum = page - 2 + i;
                              }
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={page === pageNum ? "secondary" : "outline"}
                                  size="sm"
                                  onClick={() => setPage(pageNum)}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setPage(p => Math.min(totalBlockPages, p + 1))}
                              disabled={page === totalBlockPages}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </nav>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-48">
                      <p className="text-slate-500">
                        {searchTerm ? 'No search results found' : 'No blocks available'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="transactions" className="space-y-4">
              {transactionsLoading ? (
                <div className="flex justify-center items-center h-48">
                  <RefreshCw className="h-5 w-5 text-primary animate-spin mr-2" />
                  <p className="text-slate-500">Loading transactions...</p>
                </div>
              ) : transactions && transactions.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Transaction Hash</TableHead>
                          <TableHead>Department</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Block #</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-mono">
                              {formatHash(transaction.transactionHash)}
                            </TableCell>
                            <TableCell>{transaction.department}</TableCell>
                            <TableCell>{transaction.category}</TableCell>
                            <TableCell>
                              {formatCurrency(transaction.amount)}
                            </TableCell>
                            <TableCell>
                              {new Date(transaction.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={transaction.status === 'verified' ? 'verified' : 'pending'}>
                                {transaction.status === 'verified' ? 'Verified' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {transaction.blockNumber ? (
                                <Button 
                                  variant="link" 
                                  className="p-0 h-auto" 
                                  onClick={() => {
                                    setActiveTab('blocks');
                                    // Find the block with this block number
                                    const blockId = blocks?.find(b => b.blockNumber === transaction.blockNumber)?.id;
                                    if (blockId) {
                                      setSelectedBlockId(blockId);
                                    }
                                  }}
                                >
                                  {formatBlockNumber(transaction.blockNumber)}
                                </Button>
                              ) : (
                                <span className="text-slate-400">Pending</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {totalTransactionPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <nav className="flex space-x-1" aria-label="Pagination">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        {Array.from({ length: Math.min(5, totalTransactionPages) }, (_, i) => {
                          let pageNum;
                          if (totalTransactionPages <= 5) {
                            pageNum = i + 1;
                          } else if (page <= 3) {
                            pageNum = i + 1;
                          } else if (page >= totalTransactionPages - 2) {
                            pageNum = totalTransactionPages - 4 + i;
                          } else {
                            pageNum = page - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={page === pageNum ? "secondary" : "outline"}
                              size="sm"
                              onClick={() => setPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPage(p => Math.min(totalTransactionPages, p + 1))}
                          disabled={page === totalTransactionPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex justify-center items-center h-48">
                  <p className="text-slate-500">No transactions available</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>How Blockchain Works</CardTitle>
            <CardDescription>Understanding the core principles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-primary-600 text-sm font-medium">1</span>
              </div>
              <div>
                <h4 className="text-sm font-medium">Distributed Ledger</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Government data is stored across multiple nodes in a distributed network, 
                  eliminating single points of failure and enhancing transparency.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-primary-600 text-sm font-medium">2</span>
              </div>
              <div>
                <h4 className="text-sm font-medium">Consensus Mechanisms</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Transactions are verified by multiple government nodes before being 
                  added to the blockchain, ensuring data integrity and preventing fraud.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-primary-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-primary-600 text-sm font-medium">3</span>
              </div>
              <div>
                <h4 className="text-sm font-medium">Cryptographic Security</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Advanced cryptography secures each transaction and block, making the
                  data immutable and tamper-evident for complete public trust.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Government Transparency</CardTitle>
            <CardDescription>Benefits of blockchain for governance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-secondary-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-secondary-600 text-sm font-medium">1</span>
              </div>
              <div>
                <h4 className="text-sm font-medium">Public Accountability</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Citizens can verify government spending and transactions in real-time,
                  promoting accountability and reducing corruption.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-secondary-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-secondary-600 text-sm font-medium">2</span>
              </div>
              <div>
                <h4 className="text-sm font-medium">Document Integrity</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Official documents are cryptographically signed and verified,
                  preventing forgery and ensuring authenticity for all records.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="h-6 w-6 bg-secondary-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-secondary-600 text-sm font-medium">3</span>
              </div>
              <div>
                <h4 className="text-sm font-medium">Budget Tracking</h4>
                <p className="text-sm text-slate-500 mt-1">
                  Government budgets are transparently tracked from allocation to
                  spending, allowing citizens to follow the money trail.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
