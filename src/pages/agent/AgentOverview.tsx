import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Clock,
  Wallet,
  Percent,
  Activity,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AgentLayout } from '@/layouts/PortalWrappers';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime, formatRelativeTime } from '@/utils/formatters';

export const AgentOverview: React.FC = () => {
  const navigate = useNavigate();

  const agents = useAurelStore((s) => s.agents);
  const activeAgentId = useAurelStore((s) => s.activeAgentId);
  const customers = useAurelStore((s) => s.customers);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const commissions = useAurelStore((s) => s.commissions);
  const activityLogs = useAurelStore((s) => s.activityLogs);
  const currency = useAurelStore((s) => s.settings.currency);

  const agent = agents.find((a) => a.id === activeAgentId) || agents[0];
  const firstName = agent.name.split(' ')[0];

  // Rule 1: Scoped to assigned customers
  const myCustomers = useMemo(
    () => customers.filter((c) => c.agentId === agent.id),
    [customers, agent.id]
  );
  const activeCustomersCount = myCustomers.filter((c) => c.status === 'active').length;
  const myPendingDeposits = useMemo(
    () => depositRequests.filter((d) => d.agentId === agent.id && d.status === 'pending'),
    [depositRequests, agent.id]
  );
  const myCommissions = useMemo(
    () => commissions.filter((c) => c.agentId === agent.id),
    [commissions, agent.id]
  );
  const myActivity = useMemo(
    () =>
      activityLogs
        .filter((l) => l.agentId === agent.id || l.actorId === agent.id)
        .slice(0, 6),
    [activityLogs, agent.id]
  );

  const monthlyActivityCount = myActivity.length + myCustomers.length * 3;

  const chartData = [
    { month: 'Jun', deposits: 6400, commissions: 544 },
    { month: 'Jul', deposits: 7800, commissions: 663 },
    { month: 'Aug', deposits: 7100, commissions: 603 },
    { month: 'Sep', deposits: 9200, commissions: 782 },
    { month: 'Oct', deposits: 10500, commissions: 892 },
    {
      month: 'Nov',
      deposits:
        depositRequests
          .filter((d) => d.agentId === agent.id && d.status === 'approved')
          .reduce((s, d) => s + d.amount, 0) + 4200,
      commissions: Math.round(
        myCommissions.reduce((s, c) => s + c.amount, 0) + 320
      ),
    },
  ];

  return (
    <AgentLayout title="Agent Overview">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-grey">
              Agent Operations · {agent.id} ({agent.region})
            </p>
            <h1 className="mt-1 font-heading text-2xl font-semibold text-charcoal sm:text-3xl">
              Good afternoon, {firstName}.
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Here&apos;s an overview of your agent operations.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/agent/deposits')}
            >
              Review Deposits ({myPendingDeposits.length})
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/agent/customers/new')}
            >
              <UserPlus className="h-4 w-4" />
              Add Demo Customer
            </Button>
          </div>
        </div>

        {/* 6 Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Total Assigned Users"
            value={String(myCustomers.length)}
            sublabel="Scoped to your agent roster"
            trend="+2 this month"
            icon={Users}
          />
          <StatCard
            label="Active Users"
            value={String(activeCustomersCount)}
            sublabel={`${myCustomers.length - activeCustomersCount} suspended`}
            icon={UserCheck}
          />
          <StatCard
            label="Pending Deposit Requests"
            value={String(myPendingDeposits.length)}
            sublabel="Requires operational review"
            icon={Clock}
          />
          <StatCard
            label="Agent Wallet Balance"
            value={formatCurrency(agent.walletBalance, currency)}
            sublabel="Available simulated liquidity"
            icon={Wallet}
            accent
          />
          <StatCard
            label="Total Commission"
            value={formatCurrency(agent.totalCommissionEarned, currency)}
            sublabel={`Illustrative rate: ${agent.commissionRate}%`}
            trend="+9.2%"
            icon={Percent}
          />
          <StatCard
            label="Monthly Activity"
            value={`${monthlyActivityCount} ops`}
            sublabel="Deposits, distributions & onboarding"
            icon={Activity}
          />
        </div>

        {/* Chart + Pending Queue */}
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-card border border-warm-border bg-soft-white p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading text-base font-semibold text-charcoal">
                  Simulated Desk Volume &amp; Commission
                </h2>
                <p className="text-xs text-muted-grey">
                  Illustrative 6-month assigned deposit volume
                </p>
              </div>
              <Badge tone="champagne">Illustrative Data</Badge>
            </div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5DD" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#777F79' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E7E5DD',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="deposits" name="Approved Deposits ($)" fill="#203B32" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="commissions" name="Commission ($)" fill="#C6AD83" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-card border border-warm-border bg-soft-white overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-warm-border px-5 py-4">
              <div>
                <h2 className="font-heading text-base font-semibold text-charcoal">
                  Pending Deposit Queue
                </h2>
                <p className="text-xs text-muted-grey">From assigned customers</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/agent/deposits')}
                className="text-xs font-medium text-forest hover:underline inline-flex items-center gap-1"
              >
                Manage
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex-1 divide-y divide-warm-border">
              {myPendingDeposits.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-grey">
                  All assigned customer deposit requests have been reviewed.
                </div>
              ) : (
                myPendingDeposits.slice(0, 4).map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-charcoal truncate">{req.customerName}</p>
                      <p className="text-[11px] text-muted-grey">
                        {req.reference} · {formatRelativeTime(req.submittedAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold text-forest tabular-nums">
                        {formatCurrency(req.amount, currency)}
                      </p>
                      <Badge tone="warning">Pending</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-warm-border px-5 py-4">
            <h2 className="font-heading text-base font-semibold text-charcoal">
              Recent Agent Desk Activity
            </h2>
            <button
              type="button"
              onClick={() => navigate('/agent/activity')}
              className="text-xs font-medium text-forest hover:underline"
            >
              View full feed →
            </button>
          </div>
          <div className="divide-y divide-warm-border">
            {myActivity.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-2 px-5 py-3.5 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone={statusToBadgeTone('active')}>{item.action}</Badge>
                    <span className="text-xs font-medium text-charcoal">{item.actorName}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-grey">{item.description}</p>
                </div>
                <span className="text-[11px] text-muted-grey whitespace-nowrap">
                  {formatDateTime(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AgentLayout>
  );
};

