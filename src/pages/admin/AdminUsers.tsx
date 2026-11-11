import React, { useMemo, useState } from 'react';
import { Search, UserPlus, Eye, Edit3, Ban, CheckCircle, Users } from 'lucide-react';
import { AdminLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Pagination } from '@/components/common/Pagination';
import { Drawer } from '@/components/common/Drawer';
import { Modal, ConfirmationDialog } from '@/components/common/Modal';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatShortDate } from '@/utils/formatters';
import { AccountStatus, Customer } from '@/types';

export const AdminUsers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [agentFilter, setAgentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAgentId, setNewAgentId] = useState('AGT-101');
  const [newInitialBal, setNewInitialBal] = useState('500');

  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAgentId, setEditAgentId] = useState('');

  const [drawerUser, setDrawerUser] = useState<Customer | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Customer | null>(null);

  const admin = useAurelStore((s) => s.admin);
  const customers = useAurelStore((s) => s.customers);
  const agents = useAurelStore((s) => s.agents);
  const transactions = useAurelStore((s) => s.transactions);
  const demoBets = useAurelStore((s) => s.demoBets);
  const createCustomer = useAurelStore((s) => s.createCustomer);
  const updateCustomer = useAurelStore((s) => s.updateCustomer);
  const toggleCustomerStatus = useAurelStore((s) => s.toggleCustomerStatus);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const filtered = useMemo(() => {
    const base = customers.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (agentFilter !== 'all' && c.agentId !== agentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!`${c.id} ${c.name} ${c.username} ${c.email}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    return [...base].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime();
      }
      if (sortBy === 'balance') return b.walletBalance - a.walletBalance;
      return a.name.localeCompare(b.name);
    });
  }, [customers, statusFilter, agentFilter, searchQuery, sortBy]);

  const pageSize = 8;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createCustomer(
      {
        name: newName,
        username: newUsername,
        email: newEmail,
        phone: newPhone || '+44 7700 900000',
        agentId: newAgentId,
        initialBalance: Math.max(0, Number(newInitialBal) || 0),
        status: 'active' as AccountStatus,
      },
      'admin',
      admin.id
    );
    if (res.ok) {
      addToast('success', 'User Created', res.message);
      setCreateOpen(false);
      setNewName('');
      setNewUsername('');
      setNewEmail('');
      setNewPhone('');
    } else {
      addToast('error', 'Validation Error', res.message);
    }
  };

  const openEdit = (c: Customer) => {
    setEditTarget(c);
    setEditName(c.name);
    setEditEmail(c.email);
    setEditAgentId(c.agentId);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    const res = updateCustomer(
      editTarget.id,
      { name: editName, email: editEmail, agentId: editAgentId },
      'admin',
      admin.name
    );
    if (res.ok) {
      addToast('success', 'Customer Updated', res.message);
      setEditTarget(null);
    }
  };

  const liveDrawerUser = drawerUser
    ? customers.find((c) => c.id === drawerUser.id) || drawerUser
    : null;

  return (
    <AdminLayout title="User Management">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Global User Management
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Manage all {customers.length} simulated customer accounts across every agent desk.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Create Demo User
          </Button>
        </div>

        {/* Filters */}
        <div className="grid gap-3 rounded-card border border-warm-border bg-soft-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-grey" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search user, ID, email..."
              className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 pl-9 pr-3 text-sm focus:border-forest focus:outline-none"
            />
          </div>

          <CustomSelect
            value={agentFilter}
            onChange={(val) => {
              setAgentFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Assigned Agents' },
              ...agents.map((a) => ({ value: a.id, label: `${a.name} (${a.id})` })),
            ]}
          />

          <CustomSelect
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'suspended', label: 'Suspended' },
            ]}
          />

          <CustomSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              { value: 'newest', label: 'Sort: Newest' },
              { value: 'balance', label: 'Sort: Highest Balance' },
              { value: 'name', label: 'Sort: Alphabetical' },
            ]}
          />
        </div>

        {/* Table */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="No users match filters"
                description="Reset filters or create a new simulated customer."
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Assigned Agent</th>
                      <th className="px-4 py-3">Registered</th>
                      <th className="px-4 py-3 text-right">Demo Balance</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border">
                    {paginated.map((c) => {
                      const ag = agents.find((a) => a.id === c.agentId);
                      return (
                        <tr key={c.id} className="hover:bg-ivory/40">
                          <td className="px-4 py-3.5">
                            <CopyIdButton value={c.id} />
                          </td>
                          <td className="px-4 py-3.5">
                            <button
                              type="button"
                              onClick={() => setDrawerUser(c)}
                              className="font-medium text-forest hover:underline text-left"
                            >
                              {c.name}
                            </button>
                            <p className="text-[11px] text-muted-grey">@{c.username}</p>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-charcoal">
                            {ag?.name || c.agentId}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-muted-grey">
                            {formatShortDate(c.registeredAt)}
                          </td>
                          <td className="px-4 py-3.5 text-right text-xs font-semibold tabular-nums">
                            {formatCurrency(c.walletBalance, currency)}
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge tone={statusToBadgeTone(c.status)}>{c.status}</Badge>
                          </td>
                          <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                            <button
                              type="button"
                              onClick={() => setDrawerUser(c)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-btn border border-warm-border hover:bg-ivory"
                              title="Inspect account"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEdit(c)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-btn border border-warm-border hover:bg-ivory"
                              title="Edit & reassign"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setToggleTarget(c)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-btn border border-warm-border hover:bg-ivory"
                              title="Suspend / Activate"
                            >
                              {c.status === 'active' ? (
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

      {/* Create User Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Demo Customer Account"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Full Name *</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Username *</label>
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
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
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">Phone</label>
              <input
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+44 7700 900123"
                className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <CustomSelect
              label="Assign Agent"
              value={newAgentId}
              onChange={setNewAgentId}
              options={agents.map((a) => ({ value: a.id, label: a.name }))}
            />
            <div>
              <label className="mb-1 block text-xs font-medium">Initial Demo Balance</label>
              <input
                type="number"
                value={newInitialBal}
                onChange={(e) => setNewInitialBal(e.target.value)}
                className="h-11 w-full rounded-btn border border-warm-border px-3 text-sm tabular-nums focus:border-forest focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit & Reassign User Modal */}
      <Modal
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        title={editTarget ? `Edit & Reassign · ${editTarget.id}` : ''}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium">Full Name</label>
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium">Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
              className="h-10 w-full rounded-btn border border-warm-border px-3 text-sm focus:border-forest focus:outline-none"
            />
          </div>
          <CustomSelect
            label="Assigned Agent"
            value={editAgentId}
            onChange={setEditAgentId}
            options={agents.map((a) => ({ value: a.id, label: `${a.name} (${a.region})` }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Account History Drawer */}
      <Drawer
        open={liveDrawerUser !== null}
        onClose={() => setDrawerUser(null)}
        title={liveDrawerUser?.name || ''}
        subtitle={liveDrawerUser ? `${liveDrawerUser.id} · @${liveDrawerUser.username}` : ''}
      >
        {liveDrawerUser && (
          <div className="space-y-5 text-xs">
            <div className="rounded-card bg-forest p-4 text-ivory flex justify-between items-center">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-champagne">Demo Balance</p>
                <p className="font-heading text-2xl font-semibold tabular-nums">
                  {formatCurrency(liveDrawerUser.walletBalance, currency)}
                </p>
              </div>
              <Badge tone="champagne">{liveDrawerUser.status}</Badge>
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-charcoal">Recent Demo Bets</p>
              {demoBets.filter((b) => b.customerId === liveDrawerUser.id).length === 0 ? (
                <p className="text-muted-grey">No simulated wagers placed yet.</p>
              ) : (
                demoBets
                  .filter((b) => b.customerId === liveDrawerUser.id)
                  .slice(0, 5)
                  .map((b) => (
                    <div
                      key={b.id}
                      className="flex justify-between rounded-btn border border-warm-border px-3 py-2"
                    >
                      <span>{b.reference}</span>
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(b.stake, currency)} · {b.status}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="space-y-2">
              <p className="font-semibold text-charcoal">Transaction History</p>
              {transactions
                .filter((t) => t.accountId === liveDrawerUser.id)
                .slice(0, 6)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex justify-between rounded-btn border border-warm-border px-3 py-2"
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

      <ConfirmationDialog
        open={toggleTarget !== null}
        onClose={() => setToggleTarget(null)}
        onConfirm={() => {
          if (!toggleTarget) return;
          const res = toggleCustomerStatus(toggleTarget.id, 'admin', admin.id);
          if (res.ok) addToast('info', 'User Status Updated', res.message);
        }}
        title={toggleTarget?.status === 'active' ? 'Suspend User?' : 'Activate User?'}
        description={
          toggleTarget
            ? `Toggle simulated account status for ${toggleTarget.name} (${toggleTarget.id})?`
            : ''
        }
        confirmLabel={toggleTarget?.status === 'active' ? 'Suspend' : 'Activate'}
        tone={toggleTarget?.status === 'active' ? 'danger' : 'primary'}
      />
    </AdminLayout>
  );
};

