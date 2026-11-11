import React, { useMemo, useState } from 'react';
import { Download, Search, ReceiptText } from 'lucide-react';
import { AdminLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Pagination } from '@/components/common/Pagination';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAurelStore } from '@/store/useAurelStore';
import { exportToCsv, formatCurrency, formatDateTime } from '@/utils/formatters';
import { clsx } from 'clsx';

export const AdminTransactions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const transactions = useAurelStore((s) => s.transactions);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (accountTypeFilter !== 'all' && t.accountType !== accountTypeFilter) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !`${t.reference} ${t.accountName} ${t.description} ${t.initiatedBy}`
            .toLowerCase()
            .includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, accountTypeFilter, typeFilter, statusFilter, searchQuery]);

  const pageSize = 8;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleExport = () => {
    exportToCsv(
      'aurel-global-ledger.csv',
      filtered.map((t) => ({
        TransactionID: t.reference,
        Account: t.accountName,
        AccountType: t.accountType,
        Category: t.type,
        Amount: t.amount,
        PreviousBalance: t.previousBalance,
        NewBalance: t.newBalance,
        RelatedRequest: t.relatedRequestId || '',
        InitiatedBy: t.initiatedBy,
        Timestamp: t.createdAt,
        Status: t.status,
      }))
    );
    addToast('success', 'Ledger Exported', `Downloaded ${filtered.length} global ledger rows.`);
  };

  return (
    <AdminLayout title="Global Transaction Ledger">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Global Transaction Ledger
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Platform-wide simulated ledger synchronized with customer, agent, and treasury actions.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

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
              placeholder="Search ref, account, actor..."
              className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 pl-9 pr-3 text-sm focus:border-forest focus:outline-none"
            />
          </div>

          <CustomSelect
            value={accountTypeFilter}
            onChange={(val) => {
              setAccountTypeFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Account Types' },
              { value: 'customer', label: 'Customer Accounts' },
              { value: 'agent', label: 'Agent Wallets' },
            ]}
          />

          <CustomSelect
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'demo_deposit', label: 'Demo deposit' },
              { value: 'demo_bet_stake', label: 'Demo betting stake' },
              { value: 'simulated_winnings', label: 'Simulated winnings' },
              { value: 'agent_allocation', label: 'Agent allocation' },
              { value: 'agent_distribution', label: 'Agent distribution' },
              { value: 'adjustment', label: 'Adjustment' },
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
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'rejected', label: 'Rejected' },
            ]}
          />
        </div>

        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ReceiptText}
                title="No ledger entries found"
                description="Reset filters to view all platform transactions."
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                    <tr>
                      <th className="px-4 py-3">Transaction ID</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">Prev / New Bal</th>
                      <th className="px-4 py-3">Initiated By</th>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border">
                    {paginated.map((t) => (
                      <tr key={t.id} className="hover:bg-ivory/40">
                        <td className="px-4 py-3.5">
                          <CopyIdButton value={t.reference} />
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-charcoal">
                          {t.accountName}
                        </td>
                        <td className="px-4 py-3.5 text-xs capitalize text-muted-grey">
                          {t.accountType}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-charcoal">
                          {t.type.replace(/_/g, ' ')}
                        </td>
                        <td
                          className={clsx(
                            'px-4 py-3.5 text-right text-xs font-semibold tabular-nums whitespace-nowrap',
                            t.amount >= 0 ? 'text-success' : 'text-error'
                          )}
                        >
                          {formatCurrency(t.amount, currency, { showSign: true })}
                        </td>
                        <td className="px-4 py-3.5 text-right text-[11px] text-muted-grey tabular-nums whitespace-nowrap">
                          {formatCurrency(t.previousBalance, currency)} →{' '}
                          <span className="font-medium text-charcoal">
                            {formatCurrency(t.newBalance, currency)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey">{t.initiatedBy}</td>
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
    </AdminLayout>
  );
};

