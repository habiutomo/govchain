import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Block } from '@shared/schema';

export function BlockchainExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [searchResults, setSearchResults] = useState<Block[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const { data: blocks, isLoading } = useQuery<Block[]>({
    queryKey: ['/api/blocks', page],
  });
  
  const { data: blockCount } = useQuery<number>({
    queryKey: ['/api/blocks/count'],
  });
  
  const totalPages = blockCount ? Math.ceil(blockCount / 10) : 0;

  const handleSearch = async () => {
    if (!searchTerm) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/blocks/search?term=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const displayedBlocks = searchTerm && searchResults.length > 0 ? searchResults : blocks || [];

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
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Blockchain Explorer</h3>
          <div className="relative w-64">
            <Input 
              type="text" 
              placeholder="Search by hash or block number" 
              className="pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={handleSearch}
                disabled={isSearching}
              >
                <Search className="h-4 w-4 text-slate-400" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-4 py-3 border-b text-sm font-medium">Recent Blocks</div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <p className="text-slate-500">Loading blocks...</p>
              </div>
            ) : displayedBlocks.length > 0 ? (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Block #</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Block Hash</TableHead>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex justify-center items-center h-48">
                <p className="text-slate-500">
                  {searchTerm ? 'No search results found' : 'No blocks available'}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Pagination */}
        {!searchTerm && totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <Button 
                variant="outline" 
                size="sm"
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "secondary" : "outline"}
                    size="sm"
                    className="relative inline-flex items-center px-4 py-2 border text-sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="outline" 
                size="sm"
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <span className="sr-only">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
