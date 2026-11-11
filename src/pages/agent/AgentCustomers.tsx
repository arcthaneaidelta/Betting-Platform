import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Users, Eye, Edit3, Ban, CheckCircle } from 'lucide-react';
import { AgentLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Pagination } from '@/components/common/Pagination';
import { Drawer } from '@/components/common/Drawer';
import { Modal, ConfirmationDialog } from '@/components/common/Modal';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime, formatShortDate } from '@/utils/formatters';
import { Customer } from '@/types';

export const AgentCustomers: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [statusToggleTarget, setStatusToggleTarget] = useState<Customer | null>(null);

  const activeAgentId = useAurelStore((s) => s.activeAgentId);
  const agents = useAurelStore((s) => s.agents);
  const customers = useAurelStore((s) => s.customers);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const demoBets = useAurelStore((s) => s.demoBets);
  const transactions = useAurelStore((s) => s.transactions);
  const updateCustomer = useAurelStore((s) => s.updateCustomer);
  const toggleCustomerStatus = useAurelStore((s) => s.toggleCustomerStatus);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const agent = agents.find((a) => a.id === activeAgentId) || agents[0];

  // Rule 1: Only customers assigned to this agent
  const filtered = useMemo(() => {
    const base = customers.filter((c) => {
      if (c.agentId !== agent.id) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!`${c.id} ${c.name} ${c.username} ${c.email}`.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });

    return [...base].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
      }
      return b.walletBalance - a.walletBalance;
    });
  }, [customers, agent.id, statusFilter, searchQuery, sortBy]);

  const pageSize = 6;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const openEdit = (c: Customer) => {
    setEditTarget(c);
    setEditName(c.name);
    setEditEmail(c.email);
    setEditPhone(c.phone);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    const res = updateCustomer(
      editTarget.id,
      { name: editName, email: editEmail, phone: editPhone },
      'agent',
      agent.name
    );
    if (res.ok) {
      addToast('success', 'Customer Updated', res.message);
      setEditTarget(null);
    }
  };

  const drawerLiveCustomer = drawerCustomer
    ? customers.find((c) => c.id === drawerCustomer.id) || drawerCustomer
    : null;

  return (
    <AgentLayout title="My Customers">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Assigned Customer Roster
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Showing only demo customers assigned to {agent.name} ({agent.id}).
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/agent/customers/new')}>
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="grid gap-3 rounded-card border border-warm-border bg-soft-white p-4 sm:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-grey" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search ID, name or username..."
              className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 pl-9 pr-3 text-sm focus:border-forest focus:bg-soft-white focus:outline-none"
            />
          </div>

          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Account Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />

          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'newest', label: 'Sort: Newest Registered' },
              { value: 'oldest', label: 'Sort: Oldest Registered' },
              { value: 'balance', label: 'Sort: Highest Demo Balance' },
            ]}
          />
        </div>

        {/* Customers Table */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="No assigned customers found"
                description="Adjust your search or add a new simulated customer under your agent desk."
                actionLabel="Add Customer"
                onAction={() => navigate('/agent/customers/new')}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                    <tr>
                      <th className="px-4 py-3">Customer ID</th>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Registered</th>
                      <th className="px-4 py-3 text-right">Demo Balance</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Last Activity</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border">
                    {paginated.map((c) => (
                      <tr key={c.id} className="hover:bg-ivory/40">
                        <td className="px-4 py-3.5">
                          <CopyIdButton value={c.id} />
                        </td>
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => setDrawerCustomer(c)}
                            className="font-medium text-forest hover:underline text-left"
                          >
                            {c.name}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey">@{c.username}</td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey whitespace-nowrap">
                          {formatShortDate(c.registeredAt)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold text-charcoal tabular-nums">
                          {formatCurrency(c.walletBalance, currency)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge tone={statusToBadgeTone(c.status)}>{c.status}</Badge>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey whitespace-nowrap">
                          {formatDateTime(c.lastActivityAt)}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setDrawerCustomer(c)}
                            title="View profile"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-btn border border-warm-border text-charcoal hover:bg-ivory"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            title="Edit customer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-btn border border-warm-border text-charcoal hover:bg-ivory"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusToggleTarget(c)}
                            title={c.status === 'active' ? 'Suspend account' : 'Activate account'}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-btn border border-warm-border text-charcoal hover:bg-ivory"
                          >
                            {c.status === 'active' ? (
                              <Ban className="h-3.5 w-3.5 text-error" />
                            ) : (
                              <CheckCircle className="h-3.5 w-3.5 text-success" />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={page}
                totalItems={filtered.length}
                pageSize={pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Customer Profile Drawer */}
      <Drawer
        open={drawerLiveCustomer !== null}
        onClose={() => setDrawerCustomer(null)}
        title={drawerLiveCustomer ? drawerLiveCustomer.name : ''}
        subtitle={
          drawerLiveCustomer
            ? `${drawerLiveCustomer.id} · @${drawerLiveCustomer.username}`
            : ''
        }
        side="right"
      >
        {drawerLiveCustomer && (
          <div className="space-y-5 text-xs">
            <div className="rounded-card border border-forest/15 bg-forest p-4 text-ivory flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-champagne">
                  Simulated Demo Balance
                </p>
                <p className="mt-1 font-heading text-2xl font-semibold tabular-nums">
                  {formatCurrency(drawerLiveCustomer.walletBalance, currency)}
                </p>
              </div>
              <Badge tone="champagne">{drawerLiveCustomer.status}</Badge>
            </div>

            <div className="rounded-card border border-warm-border p-4 space-y-2">
              <p className="font-semibold text-charcoal">Personal Details (Mock)</p>
              <div className="flex justify-between">
                <span className="text-muted-grey">Email</span>
                <span>{drawerLiveCustomer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-grey">Phone</span>
                <span>{drawerLiveCustomer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-grey">Assigned Agent</span>
                <span className="font-medium text-forest">{agent.name}</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-charcoal">Deposit History</p>
              {depositRequests.filter((d) => d.customerId === drawerLiveCustomer.id).length ===
              0 ? (
                <p className="text-muted-grey">No deposit requests yet.</p>
              ) : (
                depositRequests
                  .filter((d) => d.customerId === drawerLiveCustomer.id)
                  .slice(0, 4)
                  .map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between rounded-btn border border-warm-border bg-ivory/45 px-3 py-2"
                    >
                      <span>{d.reference}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold tabular-nums">
                          {formatCurrency(d.amount, currency)}
                        </span>
                        <Badge tone={statusToBadgeTone(d.status)}>{d.status}</Badge>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-charcoal">Recent Demo Betting Activity</p>
              {demoBets.filter((b) => b.customerId === drawerLiveCustomer.id).length === 0 ? (
                <p className="text-muted-grey">No simulated wagers placed yet.</p>
              ) : (
                demoBets
                  .filter((b) => b.customerId === drawerLiveCustomer.id)
                  .slice(0, 4)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between rounded-btn border border-warm-border bg-ivory/45 px-3 py-2"
                    >
                      <span className="truncate mr-2">{b.reference}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="tabular-nums">{formatCurrency(b.stake, currency)}</span>
                        <Badge tone={statusToBadgeTone(b.status)}>{b.status}</Badge>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-charcoal">Recent Transactions</p>
              {transactions
                .filter((t) => t.accountId === drawerLiveCustomer.id)
                .slice(0, 4)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded-btn border border-warm-border px-3 py-2"
                  >
                    <span className="truncate mr-2 text-muted-grey">{t.description}</span>
                    <span className="font-semibold tabular-nums shrink-0">
                      {formatCurrency(t.amount, currency, { showSign: true })}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </Drawer>

      {/* Edit Customer Modal */}
      <Modal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        title={editTarget ? `Edit Customer · ${editTarget.id}` : ''}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal">Full Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="h-11 w-full rounded-btn border border-warm-border px-3.5 text-sm focus:border-forest focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal">Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
              className="h-11 w-full rounded-btn border border-warm-border px-3.5 text-sm focus:border-forest focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-charcoal">Phone</label>
            <input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              required
              className="h-11 w-full rounded-btn border border-warm-border px-3.5 text-sm focus:border-forest focus:outline-none"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        open={statusToggleTarget !== null}
        onClose={() => setStatusToggleTarget(null)}
        onConfirm={() => {
          if (!statusToggleTarget) return;
          const res = toggleCustomerStatus(statusToggleTarget.id, 'agent', agent.id);
          if (res.ok) {
            addToast('info', 'Account Status Updated', res.message);
          } else {
            addToast('error', 'Action Denied', res.message);
          }
        }}
        title={
          statusToggleTarget?.status === 'active'
            ? 'Suspend Demo Account?'
            : 'Activate Demo Account?'
        }
        description={
          statusToggleTarget
            ? `Change status for ${statusToggleTarget.name} (${statusToggleTarget.id})?`
            : ''
        }
        confirmLabel={statusToggleTarget?.status === 'active' ? 'Suspend Account' : 'Activate'}
        tone={statusToggleTarget?.status === 'active' ? 'danger' : 'primary'}
      />
    </AgentLayout>
  );
};

