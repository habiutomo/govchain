import { Link } from "wouter";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <div className="h-10 w-10 rounded-md bg-primary flex items-center justify-center">
                  <span className="material-icons text-white">link</span>
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900">GovChain</span>
              </a>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <span className="material-icons">notifications</span>
              </button>
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="material-icons text-gray-500 text-sm">person</span>
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">Admin User</span>
                </div>
              </div>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button 
              onClick={onMenuClick}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="material-icons">menu</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
