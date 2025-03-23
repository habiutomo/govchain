export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Help Center</span>
              <span className="material-icons">help_outline</span>
            </a>
            <a href="#" className="ml-6 text-gray-400 hover:text-gray-500">
              <span className="sr-only">Privacy Policy</span>
              <span className="material-icons">policy</span>
            </a>
            <a href="#" className="ml-6 text-gray-400 hover:text-gray-500">
              <span className="sr-only">About</span>
              <span className="material-icons">info</span>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} GovChain Transparency Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
