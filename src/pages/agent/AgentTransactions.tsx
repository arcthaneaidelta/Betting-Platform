import React, { useMemo, useState } from 'react';
import { Download, Search, ReceiptText } from 'lucide-react';
import { AgentLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Pagination } from '@/components/common/Pagination';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAurelStore } from '@/store/useAurelStore';
import { exportToCsv, formatCurrency, formatDateTime } from '@/utils/formatters';
import { clsx } from 'clsx';

export const AgentTransactions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const activeAgentId = useAurelStore((s) => s.activeAgentId);
  const customers = useAurelStore((s) => s.customers);
  const transactions = useAurelStore((s) => s.transactions);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const assignedCustomerIds = useMemo(
    () => new Set(customers.filter((c) => c.agentId === activeAgentId).map((c) => c.id)),
    [customers, activeAgentId]
  );

  // Scoped strictly to agent wallet + assigned customers
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const inScope = t.accountId === activeAgentId || assignedCustomerIds.has(t.accountId);
      if (!inScope) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!`${t.reference} ${t.accountName} ${t.description}`.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, activeAgentId, assignedCustomerIds, statusFilter, searchQuery]);

  const pageSize = 7;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <AgentLayout title="Agent Transactions">
      <div className="space-y-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Agent &amp; Assigned Customer Transactions
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Financial activity scoped exclusively to your wallet and assigned customers.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              exportToCsv(
                `aurel-agent-${activeAgentId}-transactions.csv`,
                filtered.map((t) => ({
                  Reference: t.reference,
                  Account: t.accountName,
                  Type: t.type,
                  Description: t.description,
                  Amount: t.amount,
                  NewBalance: t.newBalance,
                  Date: t.createdAt,
                  Status: t.status,
                }))
              );
              addToast('success', 'CSV Exported', `Exported ${filtered.length} rows.`);
            }}
            disabled={filtered.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid gap-3 rounded-card border border-warm-border bg-soft-white p-4 sm:grid-cols-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-grey" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search reference or account..."
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
                title="No transactions found"
                description="No simulated transactions match your search criteria."
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                    <tr>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Account</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Amount</th>
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
                        <td className="px-4 py-3.5 text-xs font-medium text-charcoal">
                          {t.accountName}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey max-w-xs truncate">
                          {t.description}
                        </td>
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
    </AgentLayout>
  );
};

