import React, { useState } from 'react';
import { Plus, Network, Table as TableIcon, Eye, Ban, CheckCircle, ArrowRightLeft } from 'lucide-react';
import { AdminLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { Modal, ConfirmationDialog } from '@/components/common/Modal';
import { Drawer } from '@/components/common/Drawer';
import { CustomSelect } from '@/components/common/CustomSelect';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { AccountStatus, Agent, Customer } from '@/types';
import { clsx } from 'clsx';

export const AdminAgents: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'hierarchy'>('table');
  const [createOpen, setCreateOpen] = useState(false);
  const [drawerAgent, setDrawerAgent] = useState<Agent | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Agent | null>(null);
  const [reassignCustomer, setReassignCustomer] = useState<Customer | null>(null);
  const [reassignTargetAgent, setReassignTargetAgent] = useState('');

  // Create form state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [region, setRegion] = useState('Central Europe');
  const [initialAllocation, setInitialAllocation] = useState('5000');
  const [commissionRate, setCommissionRate] = useState('8.0');
  const [status, setStatus] = useState<AccountStatus>('active');

  const admin = useAurelStore((s) => s.admin);
  const agents = useAurelStore((s) => s.agents);
  const customers = useAurelStore((s) => s.customers);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const transactions = useAurelStore((s) => s.transactions);
  const createAgent = useAurelStore((s) => s.createAgent);
  const toggleAgentStatus = useAurelStore((s) => s.toggleAgentStatus);
  const updateCustomer = useAurelStore((s) => s.updateCustomer);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createAgent({
      name,
      username,
      email,
      phone: phone || '+44 20 7946 0000',
      region,
      initialAllocation: Math.max(0, Number(initialAllocation) || 0),
      commissionRate: Math.max(0.5, Number(commissionRate) || 8),
      status,
    });
    if (res.ok) {
      addToast('success', 'Agent Created', res.message);
      setCreateOpen(false);
      setName('');
      setUsername('');
      setEmail('');
      setPhone('');
    } else {
      addToast('error', 'Unable to Create Agent', res.message);
    }
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignCustomer || !reassignTargetAgent) return;
    const res = updateCustomer(
      reassignCustomer.id,
      { agentId: reassignTargetAgent },
      'admin',
      admin.name
    );
    if (res.ok) {
      addToast('success', 'Customer Reassigned', res.message);
      setReassignCustomer(null);
    }
  };

  return (
    <AdminLayout title="Agent Management & Hierarchy">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Agent Management &amp; Organizational Hierarchy
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Create agents, monitor demo liquidity allocations, and inspect Super Admin → Agent →
              Customer distribution.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-btn border border-warm-border bg-soft-white p-1">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-medium',
                  viewMode === 'table' ? 'bg-forest text-ivory' : 'text-muted-grey'
                )}
              >
                <TableIcon className="h-3.5 w-3.5" />
                Roster Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode('hierarchy')}
                className={clsx(
                  'inline-flex items-center gap-1.5 rounded-btn px-3 py-1.5 text-xs font-medium',
                  viewMode === 'hierarchy' ? 'bg-forest text-ivory' : 'text-muted-grey'
                )}
              >
                <Network className="h-3.5 w-3.5" />
                Hierarchy View
              </button>
            </div>

            <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                  <tr>
                    <th className="px-4 py-3">Agent ID</th>
                    <th className="px-4 py-3">Agent Name</th>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3 text-right">Assigned Customers</th>
                    <th className="px-4 py-3 text-right">Demo Wallet</th>
                    <th className="px-4 py-3 text-right">Total Deposits</th>
                    <th className="px-4 py-3 text-right">Commission</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border">
                  {agents.map((ag) => {
                    const assignedCount = customers.filter((c) => c.agentId === ag.id).length;
                    const agDeposits = depositRequests
                      .filter((d) => d.agentId === ag.id && d.status === 'approved')
                      .reduce((s, d) => s + d.amount, 0);

                    return (
                      <tr key={ag.id} className="hover:bg-ivory/40">
                        <td className="px-4 py-3.5">
                          <CopyIdButton value={ag.id} />
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => setDrawerAgent(ag)}
                            className="font-medium text-forest hover:underline text-left"
                          >
                            {ag.name}
                          </button>
                          <p className="text-[11px] text-muted-grey">{ag.region}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey">@{ag.username}</td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold tabular-nums">
                          {assignedCount}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold text-forest tabular-nums">
                          {formatCurrency(ag.walletBalance, currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs tabular-nums">
                          {formatCurrency(agDeposits, currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs tabular-nums">
                          {ag.commissionRate}% ({formatCurrency(ag.totalCommissionEarned, currency)})
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone={statusToBadgeTone(ag.status)}>{ag.status}</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setDrawerAgent(ag)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-btn border border-warm-border hover:bg-ivory"
                            title="Inspect performance"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setToggleTarget(ag)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-btn border border-warm-border hover:bg-ivory"
                            title="Activate / Deactivate"
                          >
                            {ag.status === 'active' ? (
                              <Ban className="h-3.5 w-3.5 text-error" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5 text-success" />
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Visual Management Hierarchy View */
          <div className="space-y-6">
            <div className="rounded-card-lg border border-forest bg-forest p-5 text-ivory flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-champagne">
                  Tier 1 · Root Governance
                </p>
                <h2 className="font-heading text-lg font-semibold">
                  Super Administrator — {admin.name} ({admin.id})
                </h2>
              </div>
              <span className="text-xs text-sage-muted tabular-nums">
                Treasury: {formatCurrency(admin.platformTreasuryBalance, currency)}
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {agents.map((ag) => {
                const agCustomers = customers.filter((c) => c.agentId === ag.id);
                return (
                  <div
                    key={ag.id}
                    className="rounded-card-lg border border-warm-border bg-soft-white p-5 space-y-4"
                  >
                    <div className="border-b border-warm-border pb-3.5 flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-champagne-dark">
                          Tier 2 · Agent ({ag.id})
                        </span>
                        <h3 className="font-heading text-base font-semibold text-charcoal">
                          {ag.name}
                        </h3>
                        <p className="text-xs text-muted-grey">
                          {ag.region} · {ag.commissionRate}% comm.
                        </p>
                      </div>
                      <Badge tone={statusToBadgeTone(ag.status)}>{ag.status}</Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                        Tier 3 · Assigned Customers ({agCustomers.length})
                      </p>
                      <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                        {agCustomers.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between rounded-btn border border-warm-border bg-ivory/50 px-3 py-2 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-charcoal truncate">{c.name}</p>
                              <p className="text-[10px] text-muted-grey tabular-nums">
                                {c.id} · {formatCurrency(c.walletBalance, currency)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setReassignCustomer(c);
                                setReassignTargetAgent(c.agentId);
                              }}
                              title="Reassign customer to another agent"
                              className="inline-flex items-center gap-1 rounded border border-warm-border bg-soft-white px-2 py-1 text-[10px] font-medium text-forest hover:border-forest shrink-0"
                            >
                              <ArrowRightLeft className="h-3 w-3" />
                              Reassign
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Agent Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Demo Agent"
        subtitle={`Available platform treasury: ${formatCurrency(admin.platformTreasuryBalance, currency)}`}
      >
        <form onSubmit={handleCreateAgent} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Full Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Username *</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 20 7946 0000"
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Initial Wallet Allocation</label>
              <input
                type="number"
                value={initialAllocation}
                onChange={(e) => setInitialAllocation(e.target.value)}
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm tabular-nums focus:border-forest focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Commission Rate (%)</label>
              <input
                type="number"
                step="0.5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm tabular-nums focus:border-forest focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Region</label>
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
              />
            </div>
            <CustomSelect
              label="Account Status"
              value={status}
              onChange={(val) => setStatus(val as AccountStatus)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Agent
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reassign Customer Modal */}
      <Modal
        open={reassignCustomer !== null}
        onClose={() => setReassignCustomer(null)}
        title={reassignCustomer ? `Reassign ${reassignCustomer.name}` : ''}
        size="sm"
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4">
          <CustomSelect
            label="Target Agent"
            value={reassignTargetAgent}
            onChange={setReassignTargetAgent}
            options={agents.map((a) => ({ value: a.id, label: `${a.name} (${a.region})` }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setReassignCustomer(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Reassignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Agent Performance Drawer */}
      <Drawer
        open={drawerAgent !== null}
        onClose={() => setDrawerAgent(null)}
        title={drawerAgent?.name || ''}
        subtitle={drawerAgent ? `${drawerAgent.id} · ${drawerAgent.region}` : ''}
      >
        {drawerAgent && (
          <div className="space-y-4 text-xs">
            <div className="rounded-card bg-forest p-4 text-ivory">
              <p className="text-[10px] uppercase tracking-wider text-champagne">
                Available Agent Wallet
              </p>
              <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">
                {formatCurrency(drawerAgent.walletBalance, currency)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-charcoal">Allocation &amp; Wallet Transactions</p>
              {transactions
                .filter((t) => t.accountId === drawerAgent.id)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-btn border border-warm-border p-3"
                  >
                    <div>
                      <p className="font-medium text-charcoal">{t.description}</p>
                      <p className="text-[11px] text-muted-grey">{formatDateTime(t.createdAt)}</p>
                    </div>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(t.amount, currency, { showSign: true })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Drawer>

      <ConfirmationDialog
        open={toggleTarget !== null}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => {
          if (!toggleTarget) return;
          const res = toggleAgentStatus(toggleTarget.id);
          if (res.ok) addToast('info', 'Agent Status Updated', res.message);
        }}
        title={toggleTarget?.status === 'active' ? 'Deactivate Agent?' : 'Activate Agent?'}
        description={
          toggleTarget
            ? `Change operational status for Agent ${toggleTarget.name} (${toggleTarget.id})?`
            : ''
        }
        confirmLabel={toggleTarget?.status === 'active' ? 'Deactivate' : 'Activate'}
        tone={toggleTarget?.status === 'active' ? 'danger' : 'primary'}
      />
    </AdminLayout>
  );
};

