import { useQuery } from "@tanstack/react-query";
import { BudgetItem, Transaction } from "@shared/schema";
import { useEffect, useRef } from "react";
import { Chart, ChartConfiguration, registerables } from "chart.js";

export default function BudgetTracking() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  
  const { data: budgetItems, isLoading: isBudgetLoading } = useQuery<BudgetItem[]>({
    queryKey: ['/api/budget'],
  });

  const { data: transactions, isLoading: isTransactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/budget'],
  });

  Chart.register(...registerables);

  // Create pie chart for allocation distribution
  useEffect(() => {
    if (!isBudgetLoading && budgetItems && pieChartRef.current) {
      const ctx = pieChartRef.current.getContext('2d');
      if (ctx) {
        const myChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: budgetItems.map(item => item.category),
            datasets: [{
              data: budgetItems.map(item => item.allocated),
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)', // Primary
                'rgba(16, 185, 129, 0.8)', // Secondary
                'rgba(124, 58, 237, 0.8)', // Accent
                'rgba(107, 114, 128, 0.8)', // Gray
                'rgba(239, 68, 68, 0.8)', // Red
                'rgba(245, 158, 11, 0.8)', // Amber
              ],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
              },
              title: {
                display: true,
                text: 'Budget Allocation Distribution'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw as number;
                    const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    const formattedValue = new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    }).format(value);
                    return `${label}: ${formattedValue} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });

        return () => {
          myChart.destroy();
        };
      }
    }
  }, [isBudgetLoading, budgetItems]);

  // Create bar chart for spending vs allocation
  useEffect(() => {
    if (!isBudgetLoading && budgetItems && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        const myChart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: budgetItems.map(item => item.category),
            datasets: [
              {
                label: 'Allocated',
                data: budgetItems.map(item => item.allocated),
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
              },
              {
                label: 'Spent',
                data: budgetItems.map(item => item.spent),
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '$' + value.toLocaleString();
                  }
                }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.dataset.label || '';
                    const value = context.raw as number;
                    return `${label}: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    }).format(value)}`;
                  }
                }
              }
            }
          } as ChartConfiguration['options']
        });

        return () => {
          myChart.destroy();
        };
      }
    }
  }, [isBudgetLoading, budgetItems]);

  // Create line chart for spending over time
  useEffect(() => {
    if (!isTransactionsLoading && transactions && barChartRef.current) {
      // Group transactions by month
      const txByMonth: Record<string, number> = {};
      
      if (transactions.length > 0) {
        transactions.forEach(tx => {
          const date = new Date(tx.timestamp);
          const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
          
          if (!txByMonth[month]) {
            txByMonth[month] = 0;
          }
          
          txByMonth[month] += tx.amount;
        });
      }
      
      // Sort months chronologically
      const sortedMonths = Object.keys(txByMonth).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      });
      
      const ctx = barChartRef.current.getContext('2d');
      if (ctx) {
        const myChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: sortedMonths,
            datasets: [
              {
                label: 'Monthly Spending',
                data: sortedMonths.map(month => txByMonth[month]),
                borderColor: 'rgba(124, 58, 237, 1)',
                backgroundColor: 'rgba(124, 58, 237, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
              }
            ]
          },
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return '$' + value.toLocaleString();
                  }
                }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.dataset.label || '';
                    const value = context.raw as number;
                    return `${label}: ${new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    }).format(value)}`;
                  }
                }
              }
            }
          } as ChartConfiguration['options']
        });

        return () => {
          myChart.destroy();
        };
      }
    }
  }, [isTransactionsLoading, transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTotalBudget = () => {
    if (!budgetItems) return 0;
    return budgetItems.reduce((total, item) => total + item.allocated, 0);
  };

  const getTotalSpent = () => {
    if (!budgetItems) return 0;
    return budgetItems.reduce((total, item) => total + item.spent, 0);
  };

  const getPercentageSpent = () => {
    const total = getTotalBudget();
    const spent = getTotalSpent();
    return total > 0 ? Math.round((spent / total) * 100) : 0;
  };

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

  return (
    <>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Budget Tracking</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span className="material-icons -ml-1 mr-2 text-sm">file_download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <span className="material-icons text-primary-600">account_balance</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Budget</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(getTotalBudget())}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
                <span className="material-icons text-secondary-600">shopping_cart</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(getTotalSpent())}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-accent-100 rounded-md p-3">
                <span className="material-icons text-accent-600">pie_chart</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Budget Utilization</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {getPercentageSpent()}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 rounded-md p-3">
                <span className="material-icons text-gray-600">receipt_long</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Transactions</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {transactions ? transactions.length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Spending vs Allocation</h3>
          </div>
          <div className="p-4">
            {isBudgetLoading ? (
              <div className="flex justify-center items-center h-64">
                <span className="material-icons animate-spin">sync</span>
              </div>
            ) : (
              <canvas ref={chartRef} height="300"></canvas>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Budget Distribution</h3>
          </div>
          <div className="p-4">
            {isBudgetLoading ? (
              <div className="flex justify-center items-center h-64">
                <span className="material-icons animate-spin">sync</span>
              </div>
            ) : (
              <canvas ref={pieChartRef} height="300"></canvas>
            )}
          </div>
        </div>
      </div>

      {/* Line Graph */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly Spending Trend</h3>
        </div>
        <div className="p-4">
          {isTransactionsLoading ? (
            <div className="flex justify-center items-center h-64">
              <span className="material-icons animate-spin">sync</span>
            </div>
          ) : (
            <canvas ref={barChartRef} height="250"></canvas>
          )}
        </div>
      </div>

      {/* Detailed Budget Table */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Detailed Budget Breakdown</h3>
          <p className="mt-1 text-sm text-gray-500">
            Current fiscal year budget allocation and spending by category
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocated
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spent
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isBudgetLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <span className="material-icons animate-spin mr-2">sync</span>
                    Loading budget data...
                  </td>
                </tr>
              ) : budgetItems && budgetItems.map((item) => {
                const percentSpent = Math.round((item.spent / item.allocated) * 100);
                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 rounded-md p-2 ${getColorForCategory(item.category).replace('text-', 'bg-').replace('-600', '-100')}`}>
                          <span className={`material-icons ${getColorForCategory(item.category)}`}>
                            {getIconForCategory(item.category)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.allocated)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.spent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.allocated - item.spent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div 
                            className={`${getColorForProgressBar(item.category)} h-2.5 rounded-full`}
                            style={{ width: `${percentSpent}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{percentSpent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
