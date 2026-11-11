import React, { useMemo, useState } from 'react';
import { Search, Ticket } from 'lucide-react';
import { CustomerLayout } from '@/layouts/PortalWrappers';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CustomSelect } from '@/components/common/CustomSelect';
import { Pagination } from '@/components/common/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { SPORTS_CATEGORIES } from '@/data/mockData';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime, formatOdds } from '@/utils/formatters';
import { DemoBet } from '@/types';
import { clsx } from 'clsx';

const STATUS_TABS = ['all', 'open', 'won', 'lost', 'cancelled'] as const;

export const CustomerBets: React.FC = () => {
  const [statusTab, setStatusTab] = useState<(typeof STATUS_TABS)[number]>('all');
  const [sportFilter, setSportFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [detailBet, setDetailBet] = useState<DemoBet | null>(null);

  const activeCustomerId = useAurelStore((s) => s.activeCustomerId);
  const demoBets = useAurelStore((s) => s.demoBets);
  const currency = useAurelStore((s) => s.settings.currency);

  const pageSize = 5;

  const filtered = useMemo(() => {
    const now = Date.now();
    return demoBets.filter((b) => {
      if (b.customerId !== activeCustomerId) return false;
      if (statusTab !== 'all' && b.status !== statusTab) return false;
      if (sportFilter !== 'all' && b.sport !== sportFilter) return false;
      if (dateFilter !== 'all') {
        const diffDays = (now - new Date(b.placedAt).getTime()) / 86400000;
        if (dateFilter === '7d' && diffDays > 7) return false;
        if (dateFilter === '30d' && diffDays > 30) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const ev = b.selections.map((s) => `${s.eventLabel} ${s.outcomeLabel}`).join(' ');
        if (!`${b.reference} ${ev}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [demoBets, activeCustomerId, statusTab, sportFilter, dateFilter, searchQuery]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  return (
    <CustomerLayout title="My Bets">
      <div className="space-y-5">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">My Demo Bets</h1>
          <p className="mt-1 text-sm text-muted-grey">
            Track open, won, lost, and cancelled simulated wagers.
          </p>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setStatusTab(t);
                setPage(1);
              }}
              className={clsx(
                'rounded-btn border px-4 py-2 text-xs font-medium capitalize transition-colors',
                statusTab === t
                  ? 'border-forest bg-forest text-ivory'
                  : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
              )}
            >
              {t}
            </button>
          ))}
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
              placeholder="Search reference or event..."
              className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 pl-9 pr-3 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
            />
          </div>

          <CustomSelect
            value={sportFilter}
            onChange={(val) => {
              setSportFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Sports' },
              ...SPORTS_CATEGORIES.map((s) => ({ value: s.key, label: s.label })),
            ]}
          />

          <CustomSelect
            value={dateFilter}
            onChange={(val) => {
              setDateFilter(val);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Dates' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
            ]}
          />
        </div>

        {/* Table / Cards */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Ticket}
                title="No betting records match"
                description="No simulated bets match your current status, sport, or date filter."
                actionLabel="Reset filters"
                onAction={() => {
                  setStatusTab('all');
                  setSportFilter('all');
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
                      <th className="px-4 py-3">Event &amp; Selection</th>
                      <th className="px-4 py-3 text-right">Odds</th>
                      <th className="px-4 py-3 text-right">Stake</th>
                      <th className="px-4 py-3 text-right">Pot. Return</th>
                      <th className="px-4 py-3">Placed</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-border">
                    {paginated.map((bet) => (
                      <tr
                        key={bet.id}
                        onClick={() => setDetailBet(bet)}
                        className="cursor-pointer transition-colors hover:bg-ivory/50"
                      >
                        <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <CopyIdButton value={bet.reference} />
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-xs font-semibold text-charcoal">
                            {bet.selections.length === 1
                              ? bet.selections[0].eventLabel
                              : `${bet.selections.length}-Fold Multiple`}
                          </p>
                          <p className="text-[11px] text-muted-grey">
                            {bet.selections.map((s) => s.outcomeLabel).join(' + ')}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold tabular-nums">
                          {formatOdds(bet.totalOdds)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs tabular-nums">
                          {formatCurrency(bet.stake, currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right text-xs font-semibold text-forest tabular-nums">
                          {formatCurrency(bet.potentialReturn, currency)}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-grey whitespace-nowrap">
                          {formatDateTime(bet.placedAt)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Badge tone={statusToBadgeTone(bet.status)}>{bet.status}</Badge>
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

      {/* Bet Detail Modal */}
      <Modal
        open={detailBet !== null}
        onClose={() => setDetailBet(null)}
        title={detailBet ? `Demo Bet · ${detailBet.reference}` : ''}
        subtitle={detailBet ? `Placed ${formatDateTime(detailBet.placedAt)}` : ''}
        footer={
          <Button variant="primary" onClick={() => setDetailBet(null)}>
            Close
          </Button>
        }
      >
        {detailBet && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-card border border-warm-border bg-ivory/60 p-3.5 text-xs">
              <span>Mode: {detailBet.mode === 'multiple' ? 'Multiple (Parlay)' : 'Single'}</span>
              <Badge tone={statusToBadgeTone(detailBet.status)}>{detailBet.status}</Badge>
            </div>
            <div className="space-y-2">
              {detailBet.selections.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-btn border border-warm-border p-3 text-xs"
                >
                  <div>
                    <p className="font-semibold text-forest">{s.outcomeLabel}</p>
                    <p className="text-muted-grey">{s.marketName}</p>
                    <p className="mt-0.5 text-charcoal">{s.eventLabel}</p>
                  </div>
                  <span className="font-semibold tabular-nums">{formatOdds(s.odds)}</span>
                </div>
              ))}
            </div>
            <dl className="space-y-2 border-t border-warm-border pt-3 text-xs">
              <div className="flex justify-between">
                <dt className="text-muted-grey">Simulated Stake</dt>
                <dd className="font-semibold tabular-nums">
                  {formatCurrency(detailBet.stake, currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-grey">Total Odds</dt>
                <dd className="font-semibold tabular-nums">{formatOdds(detailBet.totalOdds)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-grey">Potential Profit</dt>
                <dd className="font-semibold text-success tabular-nums">
                  +{formatCurrency(detailBet.potentialProfit, currency)}
                </dd>
              </div>
              <div className="flex justify-between font-semibold text-sm">
                <dt>Potential Return</dt>
                <dd className="text-forest tabular-nums">
                  {formatCurrency(detailBet.potentialReturn, currency)}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </CustomerLayout>
  );
};

