import React, { useMemo, useState } from 'react';
import { Wallet, Send, ArrowDownToLine, Clock, CheckCircle2 } from 'lucide-react';
import { AgentLayout } from '@/layouts/PortalWrappers';
import { StatCard } from '@/components/common/StatCard';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { ConfirmationDialog } from '@/components/common/Modal';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { clsx } from 'clsx';

export const AgentWallet: React.FC = () => {
  const agents = useAurelStore((s) => s.agents);
  const activeAgentId = useAurelStore((s) => s.activeAgentId);
  const customers = useAurelStore((s) => s.customers);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const transactions = useAurelStore((s) => s.transactions);
  const distributeAgentCredits = useAurelStore((s) => s.distributeAgentCredits);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const agent = agents.find((a) => a.id === activeAgentId) || agents[0];
  const assignedCustomers = useMemo(
    () => customers.filter((c) => c.agentId === agent.id),
    [customers, agent.id]
  );

  const [selectedCustomerId, setSelectedCustomerId] = useState(
    assignedCustomers[0]?.id || ''
  );
  const [amount, setAmount] = useState('250');
  const [note, setNote] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const myDeposits = depositRequests.filter((d) => d.agentId === agent.id);
  const totalAssignedDeposits = myDeposits
    .filter((d) => d.status === 'approved')
    .reduce((s, d) => s + d.amount, 0);
  const pendingCount = myDeposits.filter((d) => d.status === 'pending').length;

  const agentWalletTxns = useMemo(
    () =>
      transactions.filter(
        (t) =>
          t.accountId === agent.id ||
          (t.type === 'agent_distribution' && t.initiatedBy === agent.name)
      ),
    [transactions, agent.id, agent.name]
  );

  const parsedAmount = Number(amount) || 0;
  const targetCustomer = assignedCustomers.find((c) => c.id === selectedCustomerId);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      addToast('warning', 'Select Customer', 'Choose an assigned customer first.');
      return;
    }
    if (parsedAmount <= 0) {
      addToast('warning', 'Invalid Amount', 'Enter a positive demo credit amount.');
      return;
    }
    if (parsedAmount > agent.walletBalance) {
      addToast('error', 'Insufficient Agent Liquidity', 'Amount exceeds your available demo balance.');
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <AgentLayout title="Agent Wallet">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Agent Operational Demo Wallet
          </h1>
          <p className="mt-1 text-sm text-muted-grey">
            Monitor simulated treasury allocations and distribute demo credits to your assigned
            customers. Never represents real money.
          </p>
        </div>

        {/* Summary KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Available Demo Wallet"
            value={formatCurrency(agent.walletBalance, currency)}
            icon={Wallet}
            accent
          />
          <StatCard
            label="Total Allocated Funds"
            value={formatCurrency(agent.totalAllocated, currency)}
            sublabel="Cumulative admin allocations"
            icon={CheckCircle2}
          />
          <StatCard
            label="Total Assigned Deposits"
            value={formatCurrency(totalAssignedDeposits, currency)}
            sublabel="Approved customer requests"
            icon={ArrowDownToLine}
          />
          <StatCard
            label="Pending Requests"
            value={String(pendingCount)}
            sublabel="Awaiting review"
            icon={Clock}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Distribution Form */}
          <form
            onSubmit={handleOpenConfirm}
            className="lg:col-span-5 rounded-card border border-warm-border bg-soft-white p-6 space-y-4 h-fit"
          >
            <div>
              <h2 className="font-heading text-base font-semibold text-charcoal">
                Distribute Demo Credits
              </h2>
              <p className="mt-0.5 text-xs text-muted-grey">
                Transfer simulated credits from your agent wallet to an assigned customer.
              </p>
            </div>

            <CustomSelect
              label="Assigned Customer"
              value={selectedCustomerId}
              onChange={setSelectedCustomerId}
              options={assignedCustomers.map((c) => ({
                value: c.id,
                label: `${c.name} (${formatCurrency(c.walletBalance, currency)})`,
              }))}
            />

            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Simulated Credit Amount ({currency}) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                step="10"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm font-semibold tabular-nums focus:border-forest focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-muted-grey">
                Max available: {formatCurrency(agent.walletBalance, currency)}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Reference Note (Optional)
              </label>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Weekend demo liquidity"
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm focus:border-forest focus:outline-none"
              />
            </div>

            <Button type="submit" variant="primary" fullWidth>
              <Send className="h-4 w-4" />
              Distribute Demo Credits
            </Button>
          </form>

          {/* Allocation & Wallet History */}
          <div className="lg:col-span-7 rounded-card border border-warm-border bg-soft-white overflow-hidden">
            <div className="border-b border-warm-border px-5 py-4">
              <h2 className="font-heading text-base font-semibold text-charcoal">
                Wallet Allocation &amp; Reconciliation Ledger
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">New Balance</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border">
                  {agentWalletTxns.map((t) => (
                    <tr key={t.id} className="hover:bg-ivory/40">
                      <td className="px-4 py-3.5">
                        <CopyIdButton value={t.reference} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-charcoal">{t.description}</td>
                      <td
                        className={clsx(
                          'px-4 py-3.5 text-right text-xs font-semibold tabular-nums',
                          t.amount >= 0 ? 'text-success' : 'text-error'
                        )}
                      >
                        {formatCurrency(t.amount, currency, { showSign: true })}
                      </td>
                      <td className="px-4 py-3.5 text-right text-xs font-medium tabular-nums">
                        {formatCurrency(t.newBalance, currency)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-grey whitespace-nowrap">
                        {formatDateTime(t.createdAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Badge tone={statusToBadgeTone(t.status)}>{t.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          const res = distributeAgentCredits(agent.id, selectedCustomerId, parsedAmount, note);
          if (res.ok) {
            addToast('success', 'Demo Credits Distributed', res.message);
            setNote('');
          } else {
            addToast('error', 'Distribution Blocked', res.message);
          }
        }}
        title="Confirm Demo Credit Distribution?"
        description="This transfers simulated funds from your agent wallet to the selected customer's demo balance."
        confirmLabel="Confirm Distribution"
        details={[
          { label: 'Recipient', value: targetCustomer?.name || selectedCustomerId },
          { label: 'Amount', value: formatCurrency(parsedAmount, currency) },
          {
            label: 'Remaining Agent Bal.',
            value: formatCurrency(Math.max(0, agent.walletBalance - parsedAmount), currency),
          },
        ]}
      />
    </AgentLayout>
  );
};

