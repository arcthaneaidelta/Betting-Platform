import React from 'react';
import {
  LayoutDashboard,
  Trophy,
  Radio,
  Ticket,
  ArrowDownToLine,
  ReceiptText,
  User,
  Settings,
  ShieldCheck,
  Users,
  UserPlus,
  Wallet,
  Percent,
  Activity,
  LifeBuoy,
  Network,
  FileBarChart2,
  ClipboardList,
  Sliders,
} from 'lucide-react';
import { PortalLayout, PortalNavItem } from '@/components/navigation/PortalLayout';
import { useAurelStore } from '@/store/useAurelStore';

interface WrapperProps {
  title: string;
  children: React.ReactNode;
  onToggleSlipDrawer?: () => void;
}

export const CustomerLayout: React.FC<WrapperProps> = ({
  title,
  children,
  onToggleSlipDrawer,
}) => {
  const customers = useAurelStore((s) => s.customers);
  const activeCustomerId = useAurelStore((s) => s.activeCustomerId);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const betSlip = useAurelStore((s) => s.betSlip);
  const demoBets = useAurelStore((s) => s.demoBets);

  const customer = customers.find((c) => c.id === activeCustomerId) || customers[0];
  const pendingDeposits = depositRequests.filter(
    (d) => d.customerId === customer.id && d.status === 'pending'
  ).length;
  const openBets = demoBets.filter(
    (b) => b.customerId === customer.id && b.status === 'open'
  ).length;

  const navItems: PortalNavItem[] = [
    { label: 'Overview', to: '/customer', icon: LayoutDashboard },
    { label: 'Sports', to: '/customer/sports', icon: Trophy },
    { label: 'Live Betting', to: '/customer/live', icon: Radio },
    { label: 'My Bets', to: '/customer/bets', icon: Ticket, badge: openBets },
    { label: 'Deposit Requests', to: '/customer/deposits', icon: ArrowDownToLine, badge: pendingDeposits },
    { label: 'Transaction History', to: '/customer/transactions', icon: ReceiptText },
    { label: 'Profile', to: '/customer/profile', icon: User },
    { label: 'Settings', to: '/customer/settings', icon: Settings },
    { label: 'Responsible Betting', to: '/customer/responsible-betting', icon: ShieldCheck },
  ];

  const mobileQuickNav: PortalNavItem[] = [
    { label: 'Overview', to: '/customer', icon: LayoutDashboard },
    { label: 'Sports', to: '/customer/sports', icon: Trophy },
    { label: 'My Bets', to: '/customer/bets', icon: Ticket },
    { label: 'Deposits', to: '/customer/deposits', icon: ArrowDownToLine },
  ];

  return (
    <PortalLayout
      portalName="Customer"
      portalSubtitle={title}
      userName={customer.name}
      userMeta={`${customer.id} · @${customer.username}`}
      navItems={navItems}
      mobileQuickNav={mobileQuickNav}
      balanceDisplay={customer.walletBalance}
      onToggleSlipDrawer={onToggleSlipDrawer}
      slipCount={betSlip.length}
    >
      {children}
    </PortalLayout>
  );
};

export const AgentLayout: React.FC<WrapperProps> = ({ title, children }) => {
  const agents = useAurelStore((s) => s.agents);
  const activeAgentId = useAurelStore((s) => s.activeAgentId);
  const depositRequests = useAurelStore((s) => s.depositRequests);

  const agent = agents.find((a) => a.id === activeAgentId) || agents[0];
  const pendingDeposits = depositRequests.filter(
    (d) => d.agentId === agent.id && d.status === 'pending'
  ).length;

  const navItems: PortalNavItem[] = [
    { label: 'Overview', to: '/agent', icon: LayoutDashboard },
    { label: 'My Customers', to: '/agent/customers', icon: Users },
    { label: 'Add Customer', to: '/agent/customers/new', icon: UserPlus },
    { label: 'Deposit Requests', to: '/agent/deposits', icon: ArrowDownToLine, badge: pendingDeposits },
    { label: 'Wallet', to: '/agent/wallet', icon: Wallet },
    { label: 'Transactions', to: '/agent/transactions', icon: ReceiptText },
    { label: 'Commission Reports', to: '/agent/commissions', icon: Percent },
    { label: 'Activity', to: '/agent/activity', icon: Activity },
    { label: 'Profile', to: '/agent/profile', icon: User },
    { label: 'Support', to: '/agent/support', icon: LifeBuoy },
  ];

  const mobileQuickNav: PortalNavItem[] = [
    { label: 'Overview', to: '/agent', icon: LayoutDashboard },
    { label: 'Customers', to: '/agent/customers', icon: Users },
    { label: 'Deposits', to: '/agent/deposits', icon: ArrowDownToLine },
    { label: 'Wallet', to: '/agent/wallet', icon: Wallet },
  ];

  return (
    <PortalLayout
      portalName="Agent"
      portalSubtitle={title}
      userName={agent.name}
      userMeta={`${agent.id} · ${agent.region}`}
      navItems={navItems}
      mobileQuickNav={mobileQuickNav}
      balanceDisplay={agent.walletBalance}
    >
      {children}
    </PortalLayout>
  );
};

export const AdminLayout: React.FC<WrapperProps> = ({ title, children }) => {
  const admin = useAurelStore((s) => s.admin);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const pendingCount = depositRequests.filter((d) => d.status === 'pending').length;

  const navItems: PortalNavItem[] = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Agents', to: '/admin/agents', icon: Network },
    { label: 'Deposit Management', to: '/admin/deposits', icon: ArrowDownToLine, badge: pendingCount },
    { label: 'Wallet Management', to: '/admin/wallets', icon: Wallet },
    { label: 'Transactions', to: '/admin/transactions', icon: ReceiptText },
    { label: 'Betting Management', to: '/admin/betting', icon: Ticket },
    { label: 'Sports & Events', to: '/admin/sports', icon: Trophy },
    { label: 'Commission Settings', to: '/admin/commissions', icon: Percent },
    { label: 'Reports', to: '/admin/reports', icon: FileBarChart2 },
    { label: 'Activity Logs', to: '/admin/activity', icon: ClipboardList },
    { label: 'Platform Settings', to: '/admin/settings', icon: Sliders },
  ];

  const mobileQuickNav: PortalNavItem[] = [
    { label: 'Control', to: '/admin', icon: LayoutDashboard },
    { label: 'Agents', to: '/admin/agents', icon: Network },
    { label: 'Deposits', to: '/admin/deposits', icon: ArrowDownToLine },
    { label: 'Wallets', to: '/admin/wallets', icon: Wallet },
  ];

  return (
    <PortalLayout
      portalName="Super Admin"
      portalSubtitle={title}
      userName={admin.name}
      userMeta={`${admin.id} · ${admin.title}`}
      navItems={navItems}
      mobileQuickNav={mobileQuickNav}
      balanceDisplay={admin.platformTreasuryBalance}
    >
      {children}
    </PortalLayout>
  );
};

