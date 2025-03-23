import { ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import type { Transaction, Document, User, Block } from '@shared/schema';

export function StatsOverview() {
  const { data: transactionCount, isLoading: transactionsLoading } = useQuery<number>({
    queryKey: ['/api/transactions/count'],
  });
  
  const { data: documentCount, isLoading: documentsLoading } = useQuery<number>({
    queryKey: ['/api/documents/count'],
  });
  
  const { data: identityCount, isLoading: identitiesLoading } = useQuery<number>({
    queryKey: ['/api/users/count'],
  });
  
  const { data: blockCount, isLoading: blocksLoading } = useQuery<number>({
    queryKey: ['/api/blocks/count'],
  });

  const stats = [
    {
      title: "Total Transactions",
      value: transactionsLoading ? "-" : transactionCount?.toLocaleString() || "0",
      change: "+12.5%",
      iconBg: "bg-primary-100",
      iconColor: "text-primary-600",
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-xl h-5 w-5"
        >
          <path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M12 22v-8"/><path d="M20 7 4 7"/>
          <path d="M16 13v-2"/><path d="M8 13v-2"/><path d="M4 17l8-8 8 8"/>
        </svg>
      )
    },
    {
      title: "Verified Documents",
      value: documentsLoading ? "-" : documentCount?.toLocaleString() || "0",
      change: "+8.2%",
      iconBg: "bg-secondary-100",
      iconColor: "text-secondary-600",
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-xl h-5 w-5"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/><path d="m9 15 3 3 5-5"/>
        </svg>
      )
    },
    {
      title: "Active Digital IDs",
      value: identitiesLoading ? "-" : identityCount?.toLocaleString() || "0",
      change: "+24.8%",
      iconBg: "bg-accent bg-opacity-10",
      iconColor: "text-accent-500",
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-xl h-5 w-5"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/><path d="M22 11v6"/><path d="M19 8v12"/>
        </svg>
      )
    },
    {
      title: "Blockchain Nodes",
      value: blocksLoading ? "-" : blockCount?.toLocaleString() || "0",
      change: "+5.3%",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      icon: (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-xl h-5 w-5"
        >
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
          <line x1="6" y1="6" x2="6.01" y2="6"/>
          <line x1="6" y1="18" x2="6.01" y2="18"/>
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-5">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`h-10 w-10 ${stat.iconBg} rounded-md flex items-center justify-center`}>
                <div className={stat.iconColor}>
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className="flex items-center mt-4">
              <span className="text-green-600 text-sm font-medium flex items-center">
                <ArrowUpRight className="mr-1 h-4 w-4" /> {stat.change}
              </span>
              <span className="text-xs text-slate-500 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
