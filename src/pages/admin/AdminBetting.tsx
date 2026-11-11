import React, { useMemo, useState } from 'react';
import { Search, Ticket, Clock, CheckCircle2, BarChart3, TrendingUp } from 'lucide-react';
import { AdminLayout } from '@/layouts/PortalWrappers';
import { StatCard } from '@/components/common/StatCard';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Pagination } from '@/components/common/Pagination';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { EmptyState } from '@/components/common/EmptyState';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime, formatOdds } from '@/utils/formatters';
import { DemoBet } from '@/types';

export const AdminBetting: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [detailBet, setDetailBet] = useState<DemoBet | null>(null);

  const demoBets = useAurelStore((s) => s.demoBets);
  const customers = useAurelStore((s) => s.customers);
  const currency = useAurelStore((s) => s.settings.currency);

  const openCount = demoBets.filter((b) => b.status === 'open').length;
  const settledCount = demoBets.filter((b) => b.status === 'won' || b.status === 'lost').length;
  const totalVolume = demoBets.reduce((s, b) => s + b.stake, 0);
  const totalWinnings = demoBets
    .filter((b) => b.status === 'won')
    .reduce((s, b) => s + b.potentialReturn, 0);

  const filtered = useMemo(() => {
    return demoBets.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (customerFilter !== 'all' && b.customerId !== customerFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ev = b.selections.map((s) => `${s.eventLabel} ${s.outcomeLabel}`).join(' ');
        if (!`${b.reference} ${b.customerName} ${ev}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [demoBets, statusFilter, customerFilter, searchQuery]);

  const pageSize = 7;
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <AdminLayout title="Betting Management">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Simulated Betting Oversight
          </h1>
          <p className="mt-1 text-sm text-muted-grey">
            Review simulated platform wagers across customers and sports. No live odds settlement.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total Demo Bets" value={String(demoBets.length)} icon={Ticket} />
          <StatCard label="Open Bets" value={String(openCount)} icon={Clock} />
          <StatCard label="Settled Bets" value={String(settledCount)} icon={CheckCircle2} />
          <StatCard
            label="Simulated Volume"
            value={formatCurrency(totalVolume, currency)}
            icon={BarChart3}
            accent
          />
          <StatCard
            label="Simulated Winnings"
            value={formatCurrency(totalWinnings, currency)}
            icon={TrendingUp}
          />
        </div>

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
              placeholder="Search bet ref, event, customer..."
              className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 pl-9 pr-3 text-sm focus:border-forest focus:outline-none"
            />
          </div>

          <CustomSelect
            value={customerFilter}
            onChange={(val) => {
              setCustomerFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Customers' },
              ...customers.map((c) => ({ value: c.id, label: c.name })),
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
              { value: 'open', label: 'Open' },
              { value: 'won', label: 'Won' },
              { value: 'lost', label: 'Lost' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Ticket}
                title="No bets match your criteria"
                description="Clear filters to inspect all simulated bets."
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                    <tr>
                      <th className="px-4 py-3">Bet Ref</th>
                      <th className="px-4 py-3">Customer</th>
                      <th className="px-4 py-3">Event &amp; Selection</th>
                      <th className="px-4 py-3 text-right">Stake</th>
                      <th className="px-4 py-3 text-right">Odds</th>
                      <th className="px-4 py-3 text-right">Pot. Return</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border">
                    {paginated.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => setDetailBet(b)}
                        className="cursor-pointer hover:bg-ivory/40"
                      >
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <CopyIdButton value={b.reference} />
                        </td>
                        <td className="px-4 py-3.5 text-xs font-medium text-charcoal">
                          {b.customerName}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-xs font-medium text-charcoal">
                            {b.selections.length === 1
                              ? b.selections[0].eventLabel
                              : `${b.selections.length}-Fold Multiple`}
                          </p>
                          <p className="text-[11px] text-muted-grey">
                            {b.selections.map((s) => s.outcomeLabel).join(' + ')}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs tabular-nums">
                          {formatCurrency(b.stake, currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold tabular-nums">
                          {formatOdds(b.totalOdds)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold text-forest tabular-nums">
                          {formatCurrency(b.potentialReturn, currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Badge tone={statusToBadgeTone(b.status)}>{b.status}</Badge>
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

      <Modal
        open={detailBet !== null}
        onClose={() => setDetailBet(null)}
        title={detailBet ? `Simulated Bet · ${detailBet.reference}` : ''}
        subtitle={detailBet ? `${detailBet.customerName} · ${formatDateTime(detailBet.placedAt)}` : ''}
        footer={
          <Button variant="primary" onClick={() => setDetailBet(null)}>
            Close
          </Button>
        }
      >
        {detailBet && (
          <div className="space-y-3 text-xs">
            {detailBet.selections.map((s) => (
              <div
                key={s.id}
                className="flex justify-between rounded-btn border border-warm-border p-3"
              >
                <div>
                  <p className="font-semibold text-forest">{s.outcomeLabel}</p>
                  <p className="text-muted-grey">{s.eventLabel}</p>
                </div>
                <span className="font-semibold tabular-nums">{formatOdds(s.odds)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-warm-border pt-3 font-semibold">
              <span>Stake / Potential Return</span>
              <span className="tabular-nums">
                {formatCurrency(detailBet.stake, currency)} →{' '}
                {formatCurrency(detailBet.potentialReturn, currency)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
};

