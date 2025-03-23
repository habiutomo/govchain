import { useQuery } from "@tanstack/react-query";
import { BudgetItem } from "@shared/schema";

export default function BudgetTracking() {
  const { data: budgetItems, isLoading } = useQuery<BudgetItem[]>({
    queryKey: ['/api/budget'],
  });

  const getIconForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'education': return 'school';
      case 'healthcare': return 'local_hospital';
      case 'infrastructure': return 'engineering';
      case 'public safety': return 'security';
      default: return 'attach_money';
    }
  };

  const getColorForCategory = (category: string) => {
    switch (category.toLowerCase()) {
      case 'education': return 'text-primary-600';
      case 'healthcare': return 'text-secondary-600';
      case 'infrastructure': return 'text-accent-600';
      case 'public safety': return 'text-gray-600';
      default: return 'text-blue-600';
    }
  };

  const getColorForProgressBar = (category: string) => {
    switch (category.toLowerCase()) {
      case 'education': return 'bg-primary-600';
      case 'healthcare': return 'bg-secondary-600';
      case 'infrastructure': return 'bg-accent-600';
      case 'public safety': return 'bg-gray-600';
      default: return 'bg-blue-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 1,
      notation: 'compact',
    }).format(amount);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Budget Allocation & Spending</h3>
        <p className="mt-1 text-sm text-gray-500">
          Current fiscal year government budget transparency
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {isLoading ? (
          <div className="py-4 flex justify-center">
            <span className="material-icons animate-spin">sync</span>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetItems && budgetItems.map((item) => {
              const percentSpent = Math.round((item.spent / item.allocated) * 100);
              return (
                <div key={item.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`material-icons ${getColorForCategory(item.category)} mr-2`}>
                        {getIconForCategory(item.category)}
                      </span>
                      <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{percentSpent}%</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getColorForProgressBar(item.category)} h-2 rounded-full`}
                      style={{ width: `${percentSpent}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>{formatCurrency(item.spent)} spent</span>
                    <span>{formatCurrency(item.allocated)} allocated</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-6">
          <a href="/budget-tracking" className="text-sm font-medium text-primary-600 hover:text-primary-500">
            View detailed budget report
            <span className="material-icons text-xs align-text-bottom">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  );
}
