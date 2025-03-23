import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import type { Verification } from '@shared/schema';
import { CheckCircle, Clock } from 'lucide-react';

export function RecentVerifications() {
  const { data: verifications, isLoading } = useQuery<Verification[]>({
    queryKey: ['/api/verifications/recent'],
  });

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const truncateHash = (hash: string) => {
    if (hash.length <= 12) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  return (
    <Card className="lg:col-span-3">
      <CardContent className="p-5">
        <h3 className="text-lg font-medium mb-4">Recent Verifications</h3>
        
        {isLoading ? (
          <div className="flex justify-center p-6">
            <span className="text-slate-500">Loading verifications...</span>
          </div>
        ) : verifications && verifications.length > 0 ? (
          <div className="space-y-4">
            {verifications.map((verification) => (
              <div key={verification.id} className="flex items-start p-3 border border-slate-200 rounded-lg">
                <div className={`h-8 w-8 rounded-full ${verification.status === 'verified' ? 'bg-green-100' : 'bg-yellow-100'} flex items-center justify-center mr-3 flex-shrink-0`}>
                  {verification.status === 'verified' ? (
                    <CheckCircle className="text-green-600 h-4 w-4" />
                  ) : (
                    <Clock className="text-yellow-600 h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {verification.entityType === 'document' ? 'Document Verification' : 
                     verification.entityType === 'transaction' ? 'Transaction Verification' : 
                     'Identity Verification'}
                  </p>
                  <div className="flex items-center mt-1">
                    <Badge variant={verification.status === 'verified' ? 'verified' : 'pending'}>
                      {verification.status === 'verified' ? 'Verified' : 'Pending'}
                    </Badge>
                    <span className="text-xs text-slate-500 ml-2">
                      {formatTime(verification.verifiedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Hash: <span className="font-mono">{truncateHash(verification.hash)}</span>
                  </p>
                </div>
              </div>
            ))}
            <button className="w-full text-center text-sm text-primary font-medium hover:text-primary-700 py-2">
              View all verifications
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6">
            <p className="text-slate-500">No recent verifications</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
