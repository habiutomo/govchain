import { Link, useLocation } from "wouter";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path ? "bg-primary-50 text-primary-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  };

  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity" onClick={onClose}>
      <div 
        className="fixed inset-y-0 left-0 w-full max-w-xs bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="material-icons text-white text-sm">link</span>
            </div>
            <span className="ml-2 text-lg font-semibold text-gray-900">GovChain</span>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/">
            <a 
              className={`${isActive("/")} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={onClose}
            >
              <span className="material-icons mr-3 text-primary-500 align-text-bottom">dashboard</span>
              Dashboard
            </a>
          </Link>
          <Link href="/transactions">
            <a 
              className={`${isActive("/transactions")} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={onClose}
            >
              <span className="material-icons mr-3 text-gray-400 align-text-bottom">receipt_long</span>
              Transactions
            </a>
          </Link>
          <Link href="/documents">
            <a 
              className={`${isActive("/documents")} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={onClose}
            >
              <span className="material-icons mr-3 text-gray-400 align-text-bottom">insert_drive_file</span>
              Documents
            </a>
          </Link>
          <Link href="/digital-identity">
            <a 
              className={`${isActive("/digital-identity")} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={onClose}
            >
              <span className="material-icons mr-3 text-gray-400 align-text-bottom">fingerprint</span>
              Digital Identity
            </a>
          </Link>
          <Link href="/budget-tracking">
            <a 
              className={`${isActive("/budget-tracking")} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={onClose}
            >
              <span className="material-icons mr-3 text-gray-400 align-text-bottom">account_balance</span>
              Budget Tracking
            </a>
          </Link>
          <Link href="/analytics">
            <a 
              className={`${isActive("/analytics")} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={onClose}
            >
              <span className="material-icons mr-3 text-gray-400 align-text-bottom">analytics</span>
              Analytics
            </a>
          </Link>
          <Link href="/settings">
            <a 
              className={`${isActive("/settings")} block px-3 py-2 rounded-md text-base font-medium`}
              onClick={onClose}
            >
              <span className="material-icons mr-3 text-gray-400 align-text-bottom">settings</span>
              Settings
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
