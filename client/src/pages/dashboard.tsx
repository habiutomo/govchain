import { useQuery } from "@tanstack/react-query";
import { Stats } from "@shared/schema";
import StatusCard from "@/components/dashboard/StatusCard";
import BlockchainVisualization from "@/components/dashboard/BlockchainVisualization";
import BudgetTracking from "@/components/dashboard/BudgetTracking";
import DocumentVerification from "@/components/dashboard/DocumentVerification";
import TransactionTable from "@/components/dashboard/TransactionTable";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['/api/stats'],
  });

  return (
    <>
      {/* PageHeader */}
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span className="material-icons -ml-1 mr-2 text-sm">add</span>
            New Transaction
          </button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <span className="material-icons animate-spin">sync</span>
          </div>
        ) : (
          <>
            <StatusCard
              title="Total Blocks"
              value={stats?.totalBlocks || 0}
              icon="link"
              iconBgColor="bg-primary-100"
              iconColor="text-primary-600"
            />
            <StatusCard
              title="Transactions Today"
              value={stats?.dailyTransactions || 0}
              icon="sync_alt"
              iconBgColor="bg-secondary-100"
              iconColor="text-secondary-600"
              change={{ value: "12%", isPositive: true }}
            />
            <StatusCard
              title="Verified Documents"
              value={stats?.verifiedDocuments || 0}
              icon="insert_drive_file"
              iconBgColor="bg-accent-100"
              iconColor="text-accent-600"
            />
            <StatusCard
              title="Digital Identities"
              value={stats?.digitalIdentities || 0}
              icon="fingerprint"
              iconBgColor="bg-gray-100"
              iconColor="text-gray-600"
            />
          </>
        )}
      </div>

      {/* Blockchain Visualization */}
      <BlockchainVisualization />

      {/* Budget Tracking & Document Verification */}
      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <BudgetTracking />
        <DocumentVerification />
      </div>

      {/* Transactions Table */}
      <TransactionTable />
    </>
  );
}
