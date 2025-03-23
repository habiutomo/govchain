import { Card, CardContent } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import type { Transaction } from '@shared/schema';
import { School, Activity, Building, ShieldCheck, Users } from 'lucide-react';

export function RecentTransactions() {
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/recent'],
  });

  const getDepartmentIcon = (department: string) => {
    switch (department.toLowerCase()) {
      case 'education':
        return <School className="text-primary-600" />;
      case 'healthcare':
        return <Activity className="text-secondary-600" />;
      case 'infrastructure':
        return <Building className="text-purple-600" />;
      case 'defense':
        return <ShieldCheck className="text-green-600" />;
      case 'social services':
        return <Users className="text-green-600" />;
      default:
        return <Activity className="text-slate-600" />;
    }
  };

  const getDepartmentBgColor = (department: string) => {
    switch (department.toLowerCase()) {
      case 'education':
        return 'bg-primary-100';
      case 'healthcare':
        return 'bg-secondary-100';
      case 'infrastructure':
        return 'bg-purple-100';
      case 'defense':
        return 'bg-green-100';
      case 'social services': 
        return 'bg-green-100';
      default:
        return 'bg-slate-100';
    }
  };

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="lg:col-span-4 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-medium">Recent Transactions</h3>
        <button className="text-sm text-primary font-medium hover:text-primary-700">View all</button>
      </div>
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <p className="text-slate-500">Loading transactions...</p>
          </div>
        ) : transactions && transactions.length > 0 ? (
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-8 w-8 ${getDepartmentBgColor(transaction.department)} rounded-md flex items-center justify-center mr-3`}>
                        {getDepartmentIcon(transaction.department)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{transaction.department}</div>
                        <div className="text-xs text-slate-500">{transaction.category}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      ${transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-500">{formatDate(transaction.date)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={transaction.status === 'verified' ? 'verified' : 'pending'}>
                      {transaction.status === 'verified' ? 'Verified' : 'Pending'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex justify-center items-center h-48">
            <p className="text-slate-500">No transactions available</p>
          </div>
        )}
      </div>
    </Card>
  );
}
