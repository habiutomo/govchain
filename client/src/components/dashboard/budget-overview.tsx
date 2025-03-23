import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { Budget } from '@shared/schema';
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  Cell,
  Legend
} from 'recharts';

export function BudgetOverview() {
  const [period, setPeriod] = useState<'annual' | 'quarterly' | 'monthly'>('annual');
  
  const { data: budgetData, isLoading: budgetLoading } = useQuery<Budget[]>({
    queryKey: ['/api/budget', period],
  });

  const departmentColors = {
    "Education": "#3b82f6",
    "Healthcare": "#06b6d4", 
    "Infrastructure": "#4f46e5",
    "Defense": "#22c55e",
    "Social Services": "#eab308",
    "Other": "#64748b"
  };

  // Calculate percentages
  const totalBudget = budgetData?.reduce((sum, item) => sum + item.allocation, 0) || 0;
  const budgetWithPercentage = budgetData?.map(item => ({
    ...item,
    percentage: Math.round((item.allocation / totalBudget) * 100)
  })) || [];

  // Sort by allocation (largest first)
  const sortedBudget = [...(budgetWithPercentage || [])].sort((a, b) => b.allocation - a.allocation);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-6">
      {/* Budget Allocation Chart */}
      <Card className="lg:col-span-4">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Budget Allocation</h3>
            <div className="flex space-x-2">
              <button 
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  period === 'annual' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                onClick={() => setPeriod('annual')}
              >
                Annual
              </button>
              <button 
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  period === 'quarterly' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                onClick={() => setPeriod('quarterly')}
              >
                Quarterly
              </button>
              <button 
                className={`px-3 py-1 text-xs font-medium rounded-md ${
                  period === 'monthly' 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                onClick={() => setPeriod('monthly')}
              >
                Monthly
              </button>
            </div>
          </div>
          
          <div className="h-72">
            {budgetLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-slate-500">Loading budget data...</span>
              </div>
            ) : (
              sortedBudget.length > 0 ? (
                <div className="space-y-4 w-full px-4">
                  {sortedBudget.map((item) => (
                    <div key={item.id} className="w-full flex items-center">
                      <div className="w-28 text-sm text-slate-600">{item.department}</div>
                      <div className="flex-1 h-6 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full`}
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor: departmentColors[item.department as keyof typeof departmentColors] || '#64748b'
                          }}
                        ></div>
                      </div>
                      <div className="ml-3 text-sm font-medium">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-slate-500">No budget data available</span>
                </div>
              )
            )}
          </div>
          
          <div className="mt-2 text-xs text-slate-500 text-right">
            Data verified on blockchain, last updated: 2 hours ago
          </div>
        </CardContent>
      </Card>

      {/* Recent Verifications */}
      <RecentVerifications />
    </div>
  );
}

function RecentVerifications() {
  const { data: verifications, isLoading } = useQuery({
    queryKey: ['/api/verifications/recent'],
  });

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
            {verifications.map((verification: any) => (
              <div key={verification.id} className="flex items-start p-3 border border-slate-200 rounded-lg">
                <div className={`h-8 w-8 rounded-full ${verification.status === 'verified' ? 'bg-green-100' : 'bg-yellow-100'} flex items-center justify-center mr-3 flex-shrink-0`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`${verification.status === 'verified' ? 'text-green-600' : 'text-yellow-600'} h-4 w-4`}
                  >
                    {verification.status === 'verified' ? (
                      <path d="M20 6L9 17l-5-5" />
                    ) : (
                      <><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></>
                    )}
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{verification.title}</p>
                  <div className="flex items-center mt-1">
                    <span className={`text-xs ${
                      verification.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    } px-2 py-0.5 rounded-full`}>
                      {verification.status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                    <span className="text-xs text-slate-500 ml-2">{verification.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Hash: <span className="font-mono">{verification.hash}</span>
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
