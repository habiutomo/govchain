import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/Dashboard";
import Transactions from "@/pages/Transactions";
import Documents from "@/pages/Documents";
import IdentityManagement from "@/pages/DigitalIdentity";
import BudgetTracking from "@/pages/BudgetTracking";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import { useState } from "react";
import MobileSidebar from "@/components/ui/mobile-sidebar";

function Router() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onMenuClick={() => setIsMobileSidebarOpen(true)} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <MobileSidebar 
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/transactions" component={Transactions} />
              <Route path="/documents" component={Documents} />
              <Route path="/digital-identity" component={IdentityManagement} />
              <Route path="/budget-tracking" component={BudgetTracking} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
