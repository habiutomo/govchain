import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 pt-5 pb-4 bg-white">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            <Link href="/">
              <a className={`${isActive("/")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                <span className="material-icons mr-3 text-primary-500">dashboard</span>
                Dashboard
              </a>
            </Link>
            <Link href="/transactions">
              <a className={`${isActive("/transactions")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                <span className="material-icons mr-3 text-gray-400">receipt_long</span>
                Transactions
              </a>
            </Link>
            <Link href="/documents">
              <a className={`${isActive("/documents")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                <span className="material-icons mr-3 text-gray-400">insert_drive_file</span>
                Documents
              </a>
            </Link>
            <Link href="/digital-identity">
              <a className={`${isActive("/digital-identity")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                <span className="material-icons mr-3 text-gray-400">fingerprint</span>
                Digital Identity
              </a>
            </Link>
            <Link href="/budget-tracking">
              <a className={`${isActive("/budget-tracking")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                <span className="material-icons mr-3 text-gray-400">account_balance</span>
                Budget Tracking
              </a>
            </Link>
            <Link href="/analytics">
              <a className={`${isActive("/analytics")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                <span className="material-icons mr-3 text-gray-400">analytics</span>
                Analytics
              </a>
            </Link>
            <Link href="/settings">
              <a className={`${isActive("/settings")} group flex items-center px-2 py-2 text-sm font-medium rounded-md`}>
                <span className="material-icons mr-3 text-gray-400">settings</span>
                Settings
              </a>
            </Link>
          </nav>
        </div>
      </div>
    </aside>
  );
}
