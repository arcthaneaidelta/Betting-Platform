import React, { useMemo, useState } from 'react';
import { Percent, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AgentLayout } from '@/layouts/PortalWrappers';
import { StatCard } from '@/components/common/StatCard';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

export const AgentCommissions: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const agents = useAurelStore((s) => s.agents);
  const activeAgentId = useAurelStore((s) => s.activeAgentId);
  const commissions = useAurelStore((s) => s.commissions);
  const currency = useAurelStore((s) => s.settings.currency);

  const agent = agents.find((a) => a.id === activeAgentId) || agents[0];

  const myCommissions = useMemo(
    () => commissions.filter((c) => c.agentId === agent.id),
    [commissions, agent.id]
  );

  const filtered = useMemo(() => {
    const now = Date.now();
    return myCommissions.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (dateFilter !== 'all') {
        const diff = (now - new Date(c.createdAt).getTime()) / 86400000;
        if (dateFilter === '7d' && diff > 7) return false;
        if (dateFilter === '30d' && diff > 30) return false;
      }
      return true;
    });
  }, [myCommissions, statusFilter, dateFilter]);

  const approvedComm = myCommissions
    .filter((c) => c.status === 'approved')
    .reduce((s, c) => s + c.amount, 0);
  const pendingComm = myCommissions
    .filter((c) => c.status === 'pending')
    .reduce((s, c) => s + c.amount, 0);

  const trendData = [
    { month: 'Jun', commission: 485 },
    { month: 'Jul', commission: 612 },
    { month: 'Aug', commission: 590 },
    { month: 'Sep', commission: 745 },
    { month: 'Oct', commission: 810 },
    { month: 'Nov', commission: Math.round(approvedComm + pendingComm + 360) },
  ];

  return (
    <AgentLayout title="Commission Reports">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Illustrative Commission Reports
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              All commission figures are simulated at your configured rate ({agent.commissionRate}%)
              for demonstration purposes.
            </p>
          </div>
          <Badge tone="champagne">All Figures Illustrative</Badge>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Commission"
            value={formatCurrency(agent.totalCommissionEarned, currency)}
            icon={Percent}
            accent
          />
          <StatCard
            label="Current Month"
            value={formatCurrency(approvedComm + 360, currency)}
            icon={TrendingUp}
          />
          <StatCard
            label="Previous Month"
            value={formatCurrency(810, currency)}
            icon={TrendingUp}
          />
          <StatCard
            label="Pending Comm."
            value={formatCurrency(pendingComm, currency)}
            icon={Clock}
          />
          <StatCard
            label="Approved Comm."
            value={formatCurrency(approvedComm, currency)}
            icon={CheckCircle2}
          />
        </div>

        {/* Chart */}
        <div className="rounded-card border border-warm-border bg-soft-white p-5">
          <h2 className="font-heading text-base font-semibold text-charcoal mb-4">
            Monthly Simulated Commission Trend
          </h2>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="commission"
                  name="Illustrative Commission ($)"
                  stroke="#203B32"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#C6AD83', strokeWidth: 2, stroke: '#203B32' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Filters + Table */}
        <div className="space-y-4">
          <div className="grid gap-3 rounded-card border border-warm-border bg-soft-white p-4 sm:grid-cols-2">
            <CustomSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'approved', label: 'Approved' },
                { value: 'pending', label: 'Pending' },
              ]}
            />
            <CustomSelect
              label="Period"
              value={dateFilter}
              onChange={setDateFilter}
              options={[
                { value: 'all', label: 'All Dates' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
              ]}
            />
          </div>

          <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Activity Reference</th>
                    <th className="px-4 py-3 text-right">Base Amount</th>
                    <th className="px-4 py-3 text-right">Rate</th>
                    <th className="px-4 py-3 text-right">Commission</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-ivory/40">
                      <td className="px-4 py-3.5 text-xs text-muted-grey whitespace-nowrap">
                        {formatDateTime(c.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-charcoal">
                        {c.customerName}
                      </td>
                      <td className="px-4 py-3.5">
                        <CopyIdButton value={c.activityReference} />
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs tabular-nums">
                        {formatCurrency(c.baseAmount, currency)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs tabular-nums">{c.rate}%</td>
                      <td className="px-4 py-3.5 text-right text-xs font-semibold text-success tabular-nums">
                        {formatCurrency(c.amount, currency)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Badge tone={statusToBadgeTone(c.status)}>{c.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
};

