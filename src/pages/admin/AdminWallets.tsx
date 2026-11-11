import React, { useState } from 'react';
import { Landmark, Users, Network, Clock, CheckCircle2, ArrowRight, SlidersHorizontal } from 'lucide-react';
import { AdminLayout } from '@/layouts/PortalWrappers';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { CustomSelect } from '@/components/common/CustomSelect';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { ConfirmationDialog } from '@/components/common/Modal';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { clsx } from 'clsx';

export const AdminWallets: React.FC = () => {
  const admin = useAurelStore((s) => s.admin);
  const customers = useAurelStore((s) => s.customers);
  const agents = useAurelStore((s) => s.agents);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const transactions = useAurelStore((s) => s.transactions);
  const allocateAgentFunds = useAurelStore((s) => s.allocateAgentFunds);
  const adjustCustomerWallet = useAurelStore((s) => s.adjustCustomerWallet);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  // Agent allocation form
  const [allocAgentId, setAllocAgentId] = useState(agents[0]?.id || '');
  const [allocAmount, setAllocAmount] = useState('2500');
  const [allocNote, setAllocNote] = useState('');
  const [allocConfirm, setAllocConfirm] = useState(false);

  // Customer adjustment form
  const [adjCustomerId, setAdjCustomerId] = useState(customers[0]?.id || '');
  const [adjType, setAdjType] = useState<'credit' | 'debit'>('credit');
  const [adjAmount, setAdjAmount] = useState('100');
  const [adjReason, setAdjReason] = useState('');
  const [adjConfirm, setAdjConfirm] = useState(false);

  const totalCustomerBalances = customers.reduce((s, c) => s + c.walletBalance, 0);
  const totalAgentBalances = agents.reduce((s, a) => s + a.walletBalance, 0);
  const pendingDepositsAmt = depositRequests
    .filter((d) => d.status === 'pending')
    .reduce((s, d) => s + d.amount, 0);
  const approvedDepositsAmt = depositRequests
    .filter((d) => d.status === 'approved')
    .reduce((s, d) => s + d.amount, 0);
  const totalAllocations = agents.reduce((s, a) => s + a.totalAllocated, 0);

  const parsedAlloc = Number(allocAmount) || 0;
  const parsedAdj = (adjType === 'credit' ? 1 : -1) * Math.abs(Number(adjAmount) || 0);
  const targetAgent = agents.find((a) => a.id === allocAgentId);
  const targetCustomer = customers.find((c) => c.id === adjCustomerId);

  return (
    <AdminLayout title="Wallet Management">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Centralized Wallet &amp; Treasury Management
          </h1>
          <p className="mt-1 text-sm text-muted-grey">
            Allocate simulated treasury funds to agents and perform audited balance adjustments.
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Platform Demo Treasury"
            value={formatCurrency(admin.platformTreasuryBalance, currency)}
            sublabel="Available for agent allocation"
            icon={Landmark}
            accent
          />
          <StatCard
            label="Total Customer Balances"
            value={formatCurrency(totalCustomerBalances, currency)}
            icon={Users}
          />
          <StatCard
            label="Total Agent Balances"
            value={formatCurrency(totalAgentBalances, currency)}
            icon={Network}
          />
          <StatCard
            label="Pending Deposit Amounts"
            value={formatCurrency(pendingDepositsAmt, currency)}
            icon={Clock}
          />
          <StatCard
            label="Approved Deposits"
            value={formatCurrency(approvedDepositsAmt, currency)}
            icon={CheckCircle2}
          />
          <StatCard
            label="Total Demo Allocations"
            value={formatCurrency(totalAllocations, currency)}
            icon={SlidersHorizontal}
          />
        </div>

        {/* Operational Forms */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Allocate to Agent */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (parsedAlloc <= 0) {
                addToast('warning', 'Invalid Amount', 'Enter a positive allocation amount.');
                return;
              }
              if (parsedAlloc > admin.platformTreasuryBalance) {
                addToast('error', 'Treasury Guard', 'Exceeds simulated treasury balance.');
                return;
              }
              setAllocConfirm(true);
            }}
            className="rounded-card border border-warm-border bg-soft-white p-6 space-y-4"
          >
            <div>
              <h2 className="font-heading text-base font-semibold text-charcoal">
                Allocate Demo Funds to Agent
              </h2>
              <p className="mt-0.5 text-xs text-muted-grey">
                Transfers simulated operational funds from Platform Treasury to an Agent wallet.
              </p>
            </div>

            <CustomSelect
              label="Target Agent"
              value={allocAgentId}
              onChange={setAllocAgentId}
              options={agents.map((a) => ({
                value: a.id,
                label: `${a.name} (Wallet: ${formatCurrency(a.walletBalance, currency)})`,
              }))}
            />

            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Allocation Amount ({currency}) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                step="50"
                value={allocAmount}
                onChange={(e) => setAllocAmount(e.target.value)}
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm font-semibold tabular-nums focus:border-forest focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Treasury Note (Optional)
              </label>
              <input
                value={allocNote}
                onChange={(e) => setAllocNote(e.target.value)}
                placeholder="e.g. Monthly regional liquidity replenishment"
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm focus:border-forest focus:outline-none"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth>
              Allocate Demo Funds
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Adjust Customer Demo Balance */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!adjReason.trim()) {
                addToast('warning', 'Reason Required', 'Please specify an adjustment reason.');
                return;
              }
              if (parsedAdj === 0) {
                addToast('warning', 'Invalid Amount', 'Adjustment cannot be zero.');
                return;
              }
              setAdjConfirm(true);
            }}
            className="rounded-card border border-warm-border bg-soft-white p-6 space-y-4"
          >
            <div>
              <h2 className="font-heading text-base font-semibold text-charcoal">
                Adjust Customer Demo Balance
              </h2>
              <p className="mt-0.5 text-xs text-muted-grey">
                Requires mandatory reason, confirmation, and writes a full ledger &amp; audit entry.
              </p>
            </div>

            <CustomSelect
              label="Customer Account"
              value={adjCustomerId}
              onChange={setAdjCustomerId}
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.name} (${formatCurrency(c.walletBalance, currency)})`,
              }))}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <CustomSelect
                label="Adjustment Direction"
                value={adjType}
                onChange={(val) => setAdjType(val as 'credit' | 'debit')}
                options={[
                  { value: 'credit', label: 'Credit (+ Add Demo Funds)' },
                  { value: 'debit', label: 'Debit (- Deduct Demo Funds)' },
                ]}
              />
              <div>
                <label className="mb-1.5 block text-xs font-medium text-charcoal">
                  Amount ({currency}) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  step="10"
                  min={1}
                  value={adjAmount}
                  onChange={(e) => setAdjAmount(e.target.value)}
                  className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm font-semibold tabular-nums focus:border-forest focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Mandatory Audit Reason <span className="text-error">*</span>
              </label>
              <input
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                placeholder="e.g. Promotional correction or reconciliation"
                required
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm focus:border-forest focus:outline-none"
              />
            </div>

            <Button type="submit" variant="secondary" fullWidth>
              Review Balance Adjustment
            </Button>
          </form>
        </div>

        {/* Recent Wallet & Allocation Transactions */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          <div className="border-b border-warm-border px-5 py-4">
            <h2 className="font-heading text-base font-semibold text-charcoal">
              Recent Treasury &amp; Adjustment History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Account</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">New Balance</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {transactions
                  .filter(
                    (t) =>
                      t.type === 'agent_allocation' ||
                      t.type === 'adjustment' ||
                      t.type === 'agent_distribution'
                  )
                  .slice(0, 8)
                  .map((t) => (
                    <tr key={t.id} className="hover:bg-ivory/40">
                      <td className="px-4 py-3.5">
                        <CopyIdButton value={t.reference} />
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium">{t.accountName}</td>
                      <td className="px-4 py-3.5 text-xs text-muted-grey">{t.description}</td>
                      <td
                        className={clsx(
                          'px-4 py-3.5 text-right text-xs font-semibold tabular-nums',
                          t.amount >= 0 ? 'text-success' : 'text-error'
                        )}
                      >
                        {formatCurrency(t.amount, currency, { showSign: true })}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs tabular-nums">
                        {formatCurrency(t.newBalance, currency)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-grey whitespace-nowrap">
                        {formatDateTime(t.createdAt)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={allocConfirm}
        onClose={() => setAllocConfirm(false)}
        onConfirm={() => {
          const res = allocateAgentFunds(allocAgentId, parsedAlloc, allocNote);
          if (res.ok) {
            addToast('success', 'Funds Allocated', res.message);
            setAllocNote('');
          } else {
            addToast('error', 'Allocation Failed', res.message);
          }
        }}
        title="Confirm Agent Treasury Allocation?"
        description="Transfers simulated liquidity from Platform Treasury into the agent's wallet."
        confirmLabel="Confirm Allocation"
        details={[
          { label: 'Agent', value: targetAgent?.name || allocAgentId },
          { label: 'Allocation', value: formatCurrency(parsedAlloc, currency) },
        ]}
      />

      <ConfirmationDialog
        open={adjConfirm}
        onClose={() => setAdjConfirm(false)}
        onConfirm={() => {
          const res = adjustCustomerWallet(adjCustomerId, parsedAdj, adjReason);
          if (res.ok) {
            addToast('success', 'Wallet Adjusted', res.message);
            setAdjReason('');
          } else {
            addToast('error', 'Adjustment Failed', res.message);
          }
        }}
        title="Confirm Customer Balance Adjustment?"
        description="Creates an audited transaction ledger entry and activity log record."
        confirmLabel="Confirm Adjustment"
        tone={parsedAdj < 0 ? 'warning' : 'primary'}
        details={[
          { label: 'Customer', value: targetCustomer?.name || adjCustomerId },
          { label: 'Adjustment', value: formatCurrency(parsedAdj, currency, { showSign: true }) },
          { label: 'Reason', value: adjReason },
        ]}
      />
    </AdminLayout>
  );
};

