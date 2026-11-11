import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Ticket, Radio, Trophy } from 'lucide-react';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { MatchCard } from '@/components/betting/MatchCard';
import { BetSlipPanel } from '@/components/betting/BetSlipPanel';
import { EmptyState } from '@/components/common/EmptyState';
import { Drawer } from '@/components/common/Drawer';
import { SPORTS_CATEGORIES } from '@/data/mockData';
import { useAurelStore } from '@/store/useAurelStore';
import { SportKey } from '@/types';
import { clsx } from 'clsx';

export const SportsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') === 'live' ? 'live' : 'all';

  const [sportFilter, setSportFilter] = useState<'all' | SportKey>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming'>(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSlipOpen, setMobileSlipOpen] = useState(false);

  const matches = useAurelStore((s) => s.matches);
  const betSlip = useAurelStore((s) => s.betSlip);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (sportFilter !== 'all' && m.sport !== sportFilter) return false;
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${m.homeTeam.name} ${m.awayTeam.name} ${m.competition}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [matches, sportFilter, statusFilter, searchQuery]);

  const handleStatusChange = (status: 'all' | 'live' | 'upcoming') => {
    setStatusFilter(status);
    if (status === 'live') {
      setSearchParams({ status: 'live' });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <PublicHeader />

      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-warm-border pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-grey">
                Simulated Sportsbook
              </p>
              <h1 className="mt-1.5 font-heading text-3xl font-semibold text-charcoal">
                {statusFilter === 'live' ? 'Live Betting Center' : 'All Sports & Events'}
              </h1>
              <p className="mt-1 text-sm text-muted-grey">
                Explore fictional fixtures, filter by sport or status, and test the interactive bet slip.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(['all', 'live', 'upcoming'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(st)}
                  className={clsx(
                    'inline-flex h-10 items-center gap-1.5 rounded-btn border px-3.5 text-xs font-medium capitalize transition-colors',
                    statusFilter === st
                      ? 'border-forest bg-forest text-ivory'
                      : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
                  )}
                >
                  {st === 'live' && <Radio className="h-3.5 w-3.5 text-champagne" />}
                  {st === 'all' ? 'All Events' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Category Pills */}
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSportFilter('all')}
                className={clsx(
                  'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                  sportFilter === 'all'
                    ? 'border-forest bg-forest text-ivory'
                    : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
                )}
              >
                All ({matches.length})
              </button>
              {SPORTS_CATEGORIES.map((cat) => {
                const count = matches.filter((m) => m.sport === cat.key).length;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSportFilter(cat.key)}
                    className={clsx(
                      'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                      sportFilter === cat.key
                        ? 'border-forest bg-forest text-ivory'
                        : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
                    )}
                  >
                    {cat.label} ({count})
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-72 shrink-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-grey" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teams or competitions..."
                className="h-11 w-full rounded-btn border border-warm-border bg-soft-white pl-10 pr-4 text-sm text-charcoal focus:border-forest focus:outline-none"
              />
            </div>
          </div>

          {/* Grid + Persistent Desktop Bet Slip */}
          <div className="mt-8 grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-8">
              {filteredMatches.length === 0 ? (
                <EmptyState
                  icon={Trophy}
                  title="No matching demo fixtures"
                  description="Try clearing your search filter or selecting another sports category."
                  actionLabel="Reset filters"
                  onAction={() => {
                    setSportFilter('all');
                    handleStatusChange('all');
                    setSearchQuery('');
                  }}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filteredMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>

            <div className="hidden xl:block xl:col-span-4">
              <div className="sticky top-24">
                <BetSlipPanel isPublicContext />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile / Tablet Floating Bet Slip Button */}
      <div className="fixed bottom-4 right-4 z-30 xl:hidden">
        <button
          type="button"
          onClick={() => setMobileSlipOpen(true)}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-forest bg-forest px-5 text-sm font-medium text-ivory shadow-elevated"
        >
          <Ticket className="h-4 w-4 text-champagne" />
          <span>Bet Slip ({betSlip.length})</span>
        </button>
      </div>

      <Drawer
        open={mobileSlipOpen}
        onClose={() => setMobileSlipOpen(false)}
        title="Demo Bet Slip"
        side="bottom"
      >
        <BetSlipPanel isPublicContext onPlaced={() => setMobileSlipOpen(false)} />
      </Drawer>

      <PublicFooter />
    </div>
  );
};

