import { useQuery } from "@tanstack/react-query";
import { Block } from "@shared/schema";

export default function BlockchainVisualization() {
  const { data: blocks, isLoading } = useQuery<Block[]>({
    queryKey: ['/api/blocks'],
  });

  return (
    <div className="mt-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Blockchain Visualization</h3>
          <p className="mt-1 text-sm text-gray-500">
            Visual representation of the most recent blocks in the chain
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {isLoading ? (
            <div className="py-4 flex justify-center">
              <span className="material-icons animate-spin">sync</span>
            </div>
          ) : (
            <div className="flex items-center justify-between overflow-x-auto py-4">
              {blocks && blocks.map((block) => (
                <div key={block.id} className="flex-none mr-4 last:mr-0">
                  <div className="w-48 border border-gray-200 rounded-md overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-gray-500">Block</span>
                        <span className="text-xs font-medium text-gray-900">{block.blockNumber}</span>
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="text-xs text-gray-500">Hash</div>
                      <div className="text-xs font-mono truncate">{block.hash}</div>
                      <div className="mt-2 text-xs text-gray-500">Timestamp</div>
                      <div className="text-xs">{new Date(block.timestamp).toLocaleString()}</div>
                      <div className="mt-2 text-xs text-gray-500">Transactions</div>
                      <div className="text-xs">{block.transactionCount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
