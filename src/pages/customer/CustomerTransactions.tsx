import React, { useMemo, useState } from 'react';
import { Download, Search, ReceiptText } from 'lucide-react';
import { CustomerLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Pagination } from '@/components/common/Pagination';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAurelStore } from '@/store/useAurelStore';
import { exportToCsv, formatCurrency, formatDateTime } from '@/utils/formatters';
import { clsx } from 'clsx';

const TYPE_LABELS: Record<string, string> = {
  demo_deposit: 'Demo deposit',
  demo_bet_stake: 'Demo betting stake',
  simulated_winnings: 'Simulated winnings',
  adjustment: 'Adjustment',
  reversal: 'Reversal',
  agent_distribution: 'Agent credit',
};

export const CustomerTransactions: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  const activeCustomerId = useAurelStore((s) => s.activeCustomerId);
  const transactions = useAurelStore((s) => s.transactions);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const filtered = useMemo(() => {
    const now = Date.now();
    return transactions.filter((t) => {
      if (t.accountId !== activeCustomerId) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (dateFilter !== 'all') {
        const diff = (now - new Date(t.createdAt).getTime()) / 86400000;
        if (dateFilter === '7d' && diff > 7) return false;
        if (dateFilter === '30d' && diff > 30) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!`${t.reference} ${t.description}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [transactions, activeCustomerId, typeFilter, statusFilter, dateFilter, searchQuery]);

  const pageSize = 7;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const handleExport = () => {
    exportToCsv(
      `aurel-customer-transactions-${activeCustomerId}.csv`,
      filtered.map((t) => ({
        Reference: t.reference,
        Type: TYPE_LABELS[t.type] || t.type,
        Description: t.description,
        Amount: t.amount,
        PreviousBalance: t.previousBalance,
        NewBalance: t.newBalance,
        Date: t.createdAt,
        Status: t.status,
      }))
    );
    addToast('success', 'CSV Exported', `Exported ${filtered.length} simulated ledger rows.`);
  };

  return (
    <CustomerLayout title="Transaction History">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Transaction Ledger
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Complete record of simulated deposits, stakes, winnings, adjustments, and reversals.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
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
              placeholder="Search reference ID..."
              className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 pl-9 pr-3 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
            />
          </div>

          <CustomSelect
            value={typeFilter}
            onChange={(val) => {
              setTypeFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'demo_deposit', label: 'Demo deposit' },
              { value: 'demo_bet_stake', label: 'Demo betting stake' },
              { value: 'simulated_winnings', label: 'Simulated winnings' },
              { value: 'adjustment', label: 'Adjustment' },
              { value: 'reversal', label: 'Reversal' },
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
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />

          <CustomSelect
            value={dateFilter}
            onChange={(val) => {
              setDateFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Time' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ]}
          />
        </div>

        {/* Ledger Table */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ReceiptText}
                title="No transaction records found"
                description="No simulated ledger entries match the selected filters."
                actionLabel="Clear filters"
                onAction={() => {
                  setTypeFilter('all');
                  setStatusFilter('all');
                  setDateFilter('all');
                  setSearchQuery('');
                  setPage(1);
                }}
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                    <tr>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">Prev. Bal</th>
                      <th className="px-4 py-3 text-right">New Bal</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border">
                    {paginated.map((t) => (
                      <tr key={t.id} className="hover:bg-ivory/40">
                        <td className="px-4 py-3.5">
                          <CopyIdButton value={t.reference} />
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-charcoal whitespace-nowrap">
                          {TYPE_LABELS[t.type] || t.type}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey max-w-xs truncate">
                          {t.description}
                        </td>
                        <td
                          className={clsx(
                            'px-4 py-3.5 text-right text-xs font-semibold tabular-nums whitespace-nowrap',
                            t.amount >= 0 ? 'text-success' : 'text-error'
                          )}
                        >
                          {formatCurrency(t.amount, currency, { showSign: true })}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs text-muted-grey tabular-nums whitespace-nowrap">
                          {formatCurrency(t.previousBalance, currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-medium text-charcoal tabular-nums whitespace-nowrap">
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
    </CustomerLayout>
  );
};

