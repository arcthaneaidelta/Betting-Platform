import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Network,
  Clock,
  CheckCircle2,
  Landmark,
  Ticket,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AdminLayout } from '@/layouts/PortalWrappers';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency } from '@/utils/formatters';
import { clsx } from 'clsx';

type Timeframe = '7d' | '30d' | '90d';

export const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');

  const admin = useAurelStore((s) => s.admin);
  const customers = useAurelStore((s) => s.customers);
  const agents = useAurelStore((s) => s.agents);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const demoBets = useAurelStore((s) => s.demoBets);
  const transactions = useAurelStore((s) => s.transactions);
  const currency = useAurelStore((s) => s.settings.currency);

  const activeUsers = customers.filter((c) => c.status === 'active').length;
  const pendingDeposits = depositRequests.filter((d) => d.status === 'pending').length;
  const approvedDepositsTotal = depositRequests
    .filter((d) => d.status === 'approved')
    .reduce((sum, d) => sum + d.amount, 0);
  const totalCustomerBalances = customers.reduce((sum, c) => sum + c.walletBalance, 0);
  const totalAgentBalances = agents.reduce((sum, a) => sum + a.walletBalance, 0);
  const platformDemoBalance =
    admin.platformTreasuryBalance + totalAgentBalances + totalCustomerBalances;
  const totalBettingVolume = demoBets.reduce((sum, b) => sum + b.stake, 0);

  const analyticsSeries = useMemo(() => {
    const multiplier = timeframe === '7d' ? 1 : timeframe === '30d' ? 2.4 : 5.2;
    const labels =
      timeframe === '7d'
        ? ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'Today']
        : timeframe === '30d'
        ? ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Current']
        : ['Month 1', 'Month 2', 'Month 3', 'Current'];

    const userGrowth = labels.map((label, idx) => ({
      period: label,
      users: Math.max(4, Math.round(customers.length * (0.55 + idx * 0.11))),
    }));

    const depositTrends = labels.map((label, idx) => ({
      period: label,
      approved: Math.round((1400 + idx * 550) * multiplier),
      pending: Math.round((650 + idx * 220) * (idx === labels.length - 1 ? 1.4 : 0.8)),
    }));

    const bettingActivity = labels.map((label, idx) => ({
      period: label,
      stakes: Math.round((950 + idx * 320) * multiplier),
      winnings: Math.round((780 + idx * 270) * multiplier),
    }));

    const txnActivity = labels.map((label, idx) => ({
      period: label,
      count: Math.round((transactions.length * 0.4 + idx * 5) * (timeframe === '7d' ? 0.6 : 1.3)),
    }));

    const agentPerformance = agents.map((a) => ({
      name: a.name.split(' ')[0],
      customers: customers.filter((c) => c.agentId === a.id).length,
      volume: Math.round(
        depositRequests
          .filter((d) => d.agentId === a.id && d.status === 'approved')
          .reduce((s, d) => s + d.amount, 0) +
          a.totalAllocated * 0.35 * (timeframe === '90d' ? 1.5 : 1)
      ),
    }));

    return { userGrowth, depositTrends, bettingActivity, txnActivity, agentPerformance };
  }, [timeframe, customers, agents, depositRequests, transactions.length]);

  return (
    <AdminLayout title="AUREL Control Center">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-grey">
              Super Administrator · {admin.id}
            </p>
            <h1 className="mt-1 font-heading text-2xl font-semibold text-charcoal sm:text-3xl">
              Welcome to AUREL Control Center.
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Centralized oversight across users, agents, simulated wallets, markets, and audit
              trails.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-btn border border-warm-border bg-soft-white p-1">
            {([
              { key: '7d', label: 'Last 7 days' },
              { key: '30d', label: 'Last 30 days' },
              { key: '90d', label: 'Last 90 days' },
            ] as const).map((tf) => (
              <button
                key={tf.key}
                type="button"
                onClick={() => setTimeframe(tf.key)}
                className={clsx(
                  'rounded-btn px-3 py-1.5 text-xs font-medium transition-colors',
                  timeframe === tf.key
                    ? 'bg-forest text-ivory'
                    : 'text-muted-grey hover:text-charcoal'
                )}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8 Key Platform Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users" value={String(customers.length)} trend="+14%" icon={Users} />
          <StatCard
            label="Active Users"
            value={String(activeUsers)}
            sublabel={`${customers.length - activeUsers} suspended`}
            icon={UserCheck}
          />
          <StatCard label="Total Agents" value={String(agents.length)} icon={Network} />
          <StatCard
            label="Pending Deposits"
            value={String(pendingDeposits)}
            sublabel="Across all agent desks"
            icon={Clock}
          />
          <StatCard
            label="Approved Demo Deposits"
            value={formatCurrency(approvedDepositsTotal, currency)}
            icon={CheckCircle2}
          />
          <StatCard
            label="Platform Demo Balance"
            value={formatCurrency(platformDemoBalance, currency)}
            sublabel="Treasury + Agents + Customers"
            icon={Landmark}
            accent
          />
          <StatCard label="Total Demo Bets" value={String(demoBets.length)} icon={Ticket} />
          <StatCard
            label="Simulated Betting Volume"
            value={formatCurrency(totalBettingVolume, currency)}
            trend="+11.8%"
            icon={BarChart3}
          />
        </div>

        {/* Quick Action Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-warm-border bg-soft-white px-5 py-3.5">
          <p className="text-xs text-muted-grey">
            <strong className="text-charcoal">{pendingDeposits} pending deposit requests</strong>{' '}
            currently awaiting review across {agents.length} active agent desks.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => navigate('/admin/wallets')}>
              Allocate Agent Funds
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/admin/deposits')}>
              Review Deposit Queue
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* 5 Platform Analytics Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 1. User Growth Chart */}
          <div className="rounded-card border border-warm-border bg-soft-white p-5">
            <h2 className="font-heading text-base font-semibold text-charcoal">
              1. User Growth ({timeframe})
            </h2>
            <p className="text-xs text-muted-grey mb-4">Cumulative simulated customer accounts</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsSeries.userGrowth} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DD" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', borderColor: '#E7E5DD', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="users" name="Total Users" stroke="#203B32" fill="#203B32" fillOpacity={0.14} strokeWidth={2} animationDuration={450} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Deposit Request Trends */}
          <div className="rounded-card border border-warm-border bg-soft-white p-5">
            <h2 className="font-heading text-base font-semibold text-charcoal">
              2. Deposit Request Trends ({timeframe})
            </h2>
            <p className="text-xs text-muted-grey mb-4">Approved vs pending simulated volumes</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsSeries.depositTrends} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DD" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', borderColor: '#E7E5DD', fontSize: '12px' }} />
                  <Bar dataKey="approved" name="Approved ($)" fill="#54836B" radius={[4, 4, 0, 0]} animationDuration={450} />
                  <Bar dataKey="pending" name="Pending ($)" fill="#C6AD83" radius={[4, 4, 0, 0]} animationDuration={450} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Agent Performance Chart */}
          <div className="rounded-card border border-warm-border bg-soft-white p-5">
            <h2 className="font-heading text-base font-semibold text-charcoal">
              3. Agent Desk Performance ({timeframe})
            </h2>
            <p className="text-xs text-muted-grey mb-4">Simulated volume handled by agent</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsSeries.agentPerformance} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DD" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', borderColor: '#E7E5DD', fontSize: '12px' }} />
                  <Bar dataKey="volume" name="Simulated Volume ($)" fill="#203B32" radius={[4, 4, 0, 0]} animationDuration={450} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Betting Activity Chart */}
          <div className="rounded-card border border-warm-border bg-soft-white p-5">
            <h2 className="font-heading text-base font-semibold text-charcoal">
              4. Betting Activity ({timeframe})
            </h2>
            <p className="text-xs text-muted-grey mb-4">Simulated demo stakes vs settled payouts</p>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsSeries.bettingActivity} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DD" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', borderColor: '#E7E5DD', fontSize: '12px' }} />
                  <Line type="monotone" dataKey="stakes" name="Demo Stakes ($)" stroke="#203B32" strokeWidth={2} animationDuration={450} />
                  <Line type="monotone" dataKey="winnings" name="Simulated Payouts ($)" stroke="#B58B4F" strokeWidth={2} animationDuration={450} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 5. Transaction Activity Chart */}
        <div className="rounded-card border border-warm-border bg-soft-white p-5">
          <h2 className="font-heading text-base font-semibold text-charcoal">
            5. Transaction Activity Volume ({timeframe})
          </h2>
          <p className="text-xs text-muted-grey mb-4">
            Combined ledger operations across deposits, wagers, allocations, and adjustments
          </p>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsSeries.txnActivity} margin={{ top: 5, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DD" vertical={false} />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '10px', borderColor: '#E7E5DD', fontSize: '12px' }} />
                <Area type="monotone" dataKey="count" name="Ledger Transactions" stroke="#82998B" fill="#82998B" fillOpacity={0.2} strokeWidth={2} animationDuration={450} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
