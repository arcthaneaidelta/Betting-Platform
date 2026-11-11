import React, { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ToastContainer } from '@/components/common/ToastContainer';
import { useAurelStore } from '@/store/useAurelStore';

// Public Pages
import { LandingPage } from '@/pages/public/LandingPage';
import { SportsPage } from '@/pages/public/SportsPage';
import { MatchDetailPage } from '@/pages/public/MatchDetailPage';
import { HowItWorksPage } from '@/pages/public/HowItWorksPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { DemoAccessPage } from '@/pages/public/DemoAccessPage';

// Customer Pages
import { CustomerOverview } from '@/pages/customer/CustomerOverview';
import { CustomerSports } from '@/pages/customer/CustomerSports';
import { CustomerBets } from '@/pages/customer/CustomerBets';
import { CustomerDeposits } from '@/pages/customer/CustomerDeposits';
import { CustomerTransactions } from '@/pages/customer/CustomerTransactions';
import { CustomerProfile } from '@/pages/customer/CustomerProfile';
import { CustomerSettings } from '@/pages/customer/CustomerSettings';
import { CustomerResponsibleBetting } from '@/pages/customer/CustomerResponsibleBetting';

// Agent Pages
import { AgentOverview } from '@/pages/agent/AgentOverview';
import { AgentCustomers } from '@/pages/agent/AgentCustomers';
import { AgentNewCustomer } from '@/pages/agent/AgentNewCustomer';
import { AgentDeposits } from '@/pages/agent/AgentDeposits';
import { AgentWallet } from '@/pages/agent/AgentWallet';
import { AgentTransactions } from '@/pages/agent/AgentTransactions';
import { AgentCommissions } from '@/pages/agent/AgentCommissions';
import { AgentActivity } from '@/pages/agent/AgentActivity';
import { AgentProfile } from '@/pages/agent/AgentProfile';
import { AgentSupport } from '@/pages/agent/AgentSupport';

// Admin Pages
import { AdminOverview } from '@/pages/admin/AdminOverview';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { AdminAgents } from '@/pages/admin/AdminAgents';
import { AdminDeposits } from '@/pages/admin/AdminDeposits';
import { AdminWallets } from '@/pages/admin/AdminWallets';
import { AdminTransactions } from '@/pages/admin/AdminTransactions';
import { AdminBetting } from '@/pages/admin/AdminBetting';
import { AdminSports } from '@/pages/admin/AdminSports';
import { AdminCommissions } from '@/pages/admin/AdminCommissions';
import { AdminReports } from '@/pages/admin/AdminReports';
import { AdminActivity } from '@/pages/admin/AdminActivity';
import { AdminSettings } from '@/pages/admin/AdminSettings';

const RouteSyncAndScroll: React.FC = () => {
  const location = useLocation();
  const setActiveRole = useAurelStore((s) => s.setActiveRole);

  useEffect(() => {
    if (location.pathname.startsWith('/customer')) {
      setActiveRole('customer');
    } else if (location.pathname.startsWith('/agent')) {
      setActiveRole('agent');
    } else if (location.pathname.startsWith('/admin')) {
      setActiveRole('admin');
    } else {
      setActiveRole('public');
    }

    if (!location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [location.pathname, location.hash, setActiveRole]);

  return null;
};

export const App: React.FC = () => {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <BrowserRouter>
      {showIntro && <LoadingScreen onComplete={() => setShowIntro(false)} />}
      <RouteSyncAndScroll />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/sports" element={<SportsPage />} />
        <Route path="/matches/:matchId" element={<MatchDetailPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/demo-access" element={<DemoAccessPage />} />

        {/* Customer Portal Routes */}
        <Route path="/customer" element={<CustomerOverview />} />
        <Route path="/customer/sports" element={<CustomerSports />} />
        <Route path="/customer/live" element={<CustomerSports liveOnly />} />
        <Route path="/customer/bets" element={<CustomerBets />} />
        <Route path="/customer/deposits" element={<CustomerDeposits />} />
        <Route path="/customer/transactions" element={<CustomerTransactions />} />
        <Route path="/customer/profile" element={<CustomerProfile />} />
        <Route path="/customer/settings" element={<CustomerSettings />} />
        <Route path="/customer/responsible-betting" element={<CustomerResponsibleBetting />} />

        {/* Agent Portal Routes */}
        <Route path="/agent" element={<AgentOverview />} />
        <Route path="/agent/customers" element={<AgentCustomers />} />
        <Route path="/agent/customers/new" element={<AgentNewCustomer />} />
        <Route path="/agent/deposits" element={<AgentDeposits />} />
        <Route path="/agent/wallet" element={<AgentWallet />} />
        <Route path="/agent/transactions" element={<AgentTransactions />} />
        <Route path="/agent/commissions" element={<AgentCommissions />} />
        <Route path="/agent/activity" element={<AgentActivity />} />
        <Route path="/agent/profile" element={<AgentProfile />} />
        <Route path="/agent/support" element={<AgentSupport />} />

        {/* Super Administrator Portal Routes */}
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/agents" element={<AdminAgents />} />
        <Route path="/admin/deposits" element={<AdminDeposits />} />
        <Route path="/admin/wallets" element={<AdminWallets />} />
        <Route path="/admin/transactions" element={<AdminTransactions />} />
        <Route path="/admin/betting" element={<AdminBetting />} />
        <Route path="/admin/sports" element={<AdminSports />} />
        <Route path="/admin/commissions" element={<AdminCommissions />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/activity" element={<AdminActivity />} />
        <Route path="/admin/settings" element={<AdminSettings />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
};

export default App;

