import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Ticket,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ArrowDownToLine,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { CustomerLayout } from '@/layouts/PortalWrappers';
import { StatCard } from '@/components/common/StatCard';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime, formatOdds } from '@/utils/formatters';
import { DemoBet } from '@/types';
import { clsx } from 'clsx';

export const CustomerOverview: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBet, setSelectedBet] = useState<DemoBet | null>(null);

  const customers = useAurelStore((s) => s.customers);
  const activeCustomerId = useAurelStore((s) => s.activeCustomerId);
  const hideBalance = useAurelStore((s) => s.hideBalance);
  const toggleHideBalance = useAurelStore((s) => s.toggleHideBalance);
  const demoBets = useAurelStore((s) => s.demoBets);
  const transactions = useAurelStore((s) => s.transactions);
  const agents = useAurelStore((s) => s.agents);
  const currency = useAurelStore((s) => s.settings.currency);

  const customer = customers.find((c) => c.id === activeCustomerId) || customers[0];
  const assignedAgent = agents.find((a) => a.id === customer.agentId);

  // Business Rule 3: Customer sees ONLY their own data
  const myBets = useMemo(
    () => demoBets.filter((b) => b.customerId === customer.id),
    [demoBets, customer.id]
  );
  const myTxns = useMemo(
    () => transactions.filter((t) => t.accountId === customer.id),
    [transactions, customer.id]
  );

  const activeBets = myBets.filter((b) => b.status === 'open');
  const settledBets = myBets.filter((b) => b.status === 'won' || b.status === 'lost');
  const simulatedWinnings = myBets
    .filter((b) => b.status === 'won')
    .reduce((sum, b) => sum + b.potentialReturn, 0);

  const chartData = useMemo(() => {
    const base = [
      { day: 'Mon', volume: 180, returns: 220 },
      { day: 'Tue', volume: 240, returns: 190 },
      { day: 'Wed', volume: 150, returns: 270 },
      { day: 'Thu', volume: 320, returns: 370 },
      { day: 'Fri', volume: 210, returns: 160 },
      { day: 'Sat', volume: 410, returns: 480 },
      { day: 'Today', volume: activeBets.reduce((s, b) => s + b.stake, 0) || 250, returns: simulatedWinnings > 0 ? Math.round(simulatedWinnings / 3) : 290 },
    ];
    return base;
  }, [activeBets, simulatedWinnings]);

  const firstName = customer.name.split(' ')[0];

  return (
    <CustomerLayout title="Customer Overview">
      <div className="space-y-6">
        {/* Greeting Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-grey">
              Customer Account · {customer.id}
            </p>
            <h1 className="mt-1 font-heading text-2xl font-semibold text-charcoal sm:text-3xl">
              Welcome back, {firstName}.
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Assigned Agent: <span className="font-medium text-charcoal">{assignedAgent?.name || 'Michael Vance'}</span> · Status:{' '}
              <span className="capitalize font-medium text-success">{customer.status}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="secondary" size="sm" onClick={() => navigate('/customer/deposits')}>
              <ArrowDownToLine className="h-4 w-4" />
              Request Demo Deposit
            </Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/customer/sports')}>
              Explore Sportsbook
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Balance + Stats Grid */}
        <div className="grid gap-4 lg:grid-cols-12">
          {/* Primary Balance Card */}
          <div className="lg:col-span-4 rounded-card-lg border border-forest bg-forest p-6 text-ivory shadow-card flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium uppercase tracking-wider text-champagne">
                  Available Demo Balance
                </span>
                <button
                  type="button"
                  onClick={toggleHideBalance}
                  aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
                  className="flex h-8 w-8 items-center justify-center rounded-btn bg-soft-white/10 text-ivory hover:bg-soft-white/20"
                >
                  {hideBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-3 font-heading text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
                {formatCurrency(customer.walletBalance, currency, { hideValue: hideBalance })}
              </p>
              <p className="mt-1.5 text-xs text-sage-muted">
                Currency: {currency} (Simulated) · Updated {formatDateTime(customer.lastActivityAt)}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-soft-white/15 pt-4 text-xs">
              <Link
                to="/customer/transactions"
                className="inline-flex items-center gap-1 font-medium text-champagne hover:underline"
              >
                View transaction history
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/customer/deposits"
                className="text-ivory/80 hover:text-ivory underline-offset-2 hover:underline"
              >
                Deposit requests
              </Link>
            </div>
          </div>

          {/* 4 KPIs */}
          <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Total Demo Bets"
              value={String(myBets.length)}
              sublabel="All-time simulated wagers"
              trend="+12% vs prev."
              icon={Ticket}
            />
            <StatCard
              label="Active Bets"
              value={String(activeBets.length)}
              sublabel="Open positions awaiting demo result"
              icon={Clock}
            />
            <StatCard
              label="Settled Bets"
              value={String(settledBets.length)}
              sublabel="Completed simulated events"
              icon={CheckCircle2}
            />
            <StatCard
              label="Simulated Winnings"
              value={formatCurrency(simulatedWinnings, currency, { hideValue: hideBalance })}
              sublabel="Gross settled demo returns"
              trend="+8.4%"
              icon={TrendingUp}
            />
          </div>
        </div>

        {/* Chart + Active Bets */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Activity Chart */}
          <div className="lg:col-span-5 rounded-card border border-warm-border bg-soft-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-base font-semibold text-charcoal">
                  Simulated Betting Trend
                </h2>
                <p className="text-xs text-muted-grey">7-day illustrative stake vs return</p>
              </div>
              <Badge tone="neutral">Demo Chart</Badge>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aurelForestGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#203B32" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#203B32" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DD" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E7E5DD',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="returns"
                    name="Simulated Returns"
                    stroke="#54836B"
                    strokeWidth={2}
                    fill="url(#aurelForestGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    name="Demo Stake"
                    stroke="#C6AD83"
                    strokeWidth={2}
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Bets */}
          <div className="lg:col-span-7 rounded-card border border-warm-border bg-soft-white overflow-hidden">
            <div className="flex items-center justify-between border-b border-warm-border px-5 py-4">
              <div>
                <h2 className="font-heading text-base font-semibold text-charcoal">
                  Active Demo Bets
                </h2>
                <p className="text-xs text-muted-grey">Click any bet to inspect full details</p>
              </div>
              <Link to="/customer/bets" className="text-xs font-medium text-forest hover:underline">
                View all bets →
              </Link>
            </div>

            {activeBets.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={Ticket}
                  title="No active demo bets"
                  description="Explore sports events and add selections to place a simulated bet."
                  actionLabel="Browse Sportsbook"
                  onAction={() => navigate('/customer/sports')}
                />
              </div>
            ) : (
              <div className="divide-y divide-warm-border">
                {activeBets.slice(0, 5).map((bet) => (
                  <button
                    key={bet.id}
                    type="button"
                    onClick={() => setSelectedBet(bet)}
                    className="flex w-full flex-col justify-between gap-2 px-5 py-3.5 text-left transition-colors hover:bg-ivory/50 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-medium text-forest">
                          {bet.reference}
                        </span>
                        <Badge tone={statusToBadgeTone(bet.status)}>{bet.status}</Badge>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-charcoal">
                        {bet.selections.length === 1
                          ? bet.selections[0].eventLabel
                          : `${bet.selections.length}-Fold Multiple Selection`}
                      </p>
                      <p className="text-xs text-muted-grey">
                        {bet.selections[0]?.outcomeLabel} @{' '}
                        <span className="font-semibold text-charcoal tabular-nums">
                          {formatOdds(bet.totalOdds)}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-6 text-right shrink-0">
                      <div>
                        <p className="text-[11px] text-muted-grey">Stake</p>
                        <p className="text-xs font-semibold text-charcoal tabular-nums">
                          {formatCurrency(bet.stake, currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-muted-grey">Pot. Return</p>
                        <p className="text-sm font-semibold text-forest tabular-nums">
                          {formatCurrency(bet.potentialReturn, currency)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-warm-border px-5 py-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-charcoal">
                Recent Account Activity
              </h2>
              <p className="text-xs text-muted-grey">
                Latest simulated deposits, stakes, and settlements
              </p>
            </div>
            <Link
              to="/customer/transactions"
              className="text-xs font-medium text-forest hover:underline"
            >
              Full ledger →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Activity</th>
                  <th className="px-5 py-3">Reference ID</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {myTxns.slice(0, 6).map((txn) => (
                  <tr key={txn.id} className="hover:bg-ivory/40">
                    <td className="px-5 py-3.5 text-xs text-muted-grey whitespace-nowrap">
                      {formatDateTime(txn.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-medium text-charcoal">
                      {txn.description}
                    </td>
                    <td className="px-5 py-3.5">
                      <CopyIdButton value={txn.reference} />
                    </td>
                    <td
                      className={clsx(
                        'px-5 py-3.5 text-right text-xs font-semibold tabular-nums whitespace-nowrap',
                        txn.amount >= 0 ? 'text-success' : 'text-charcoal'
                      )}
                    >
                      {formatCurrency(txn.amount, currency, { showSign: true })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Badge tone={statusToBadgeTone(txn.status)}>{txn.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bet Details Modal */}
      <Modal
        open={selectedBet !== null}
        onClose={() => setSelectedBet(null)}
        title={selectedBet ? `Bet Details · ${selectedBet.reference}` : ''}
        subtitle="Simulated wager record"
        footer={
          <Button variant="primary" onClick={() => setSelectedBet(null)}>
            Close
          </Button>
        }
      >
        {selectedBet && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-card border border-warm-border bg-ivory/60 p-3.5">
              <div>
                <p className="text-xs text-muted-grey">Status</p>
                <div className="mt-1">
                  <Badge tone={statusToBadgeTone(selectedBet.status)}>
                    {selectedBet.status}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-grey">Placed</p>
                <p className="mt-1 text-xs font-medium text-charcoal">
                  {formatDateTime(selectedBet.placedAt)}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-grey">
                Selections
              </p>
              {selectedBet.selections.map((sel) => (
                <div
                  key={sel.id}
                  className="flex items-center justify-between rounded-btn border border-warm-border p-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-forest">{sel.outcomeLabel}</p>
                    <p className="text-muted-grey">{sel.marketName}</p>
                    <p className="mt-0.5 text-charcoal">{sel.eventLabel}</p>
                  </div>
                  <span className="font-semibold text-charcoal tabular-nums">
                    {formatOdds(sel.odds)}
                  </span>
                </div>
              ))}
            </div>

            <dl className="space-y-2 border-t border-warm-border pt-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-grey">Simulated Stake</dt>
                <dd className="font-semibold tabular-nums">
                  {formatCurrency(selectedBet.stake, currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-grey">Total Decimal Odds</dt>
                <dd className="font-semibold tabular-nums">{formatOdds(selectedBet.totalOdds)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-grey">Potential Return</dt>
                <dd className="font-semibold text-forest tabular-nums">
                  {formatCurrency(selectedBet.potentialReturn, currency)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </CustomerLayout>
  );
};

