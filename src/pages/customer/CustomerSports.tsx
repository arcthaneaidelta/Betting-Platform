import React, { useMemo, useState } from 'react';
import { Search, Trophy, Radio } from 'lucide-react';
import { CustomerLayout } from '@/layouts/PortalWrappers';
import { BetSlipPanel } from '@/components/betting/BetSlipPanel';
import { TeamCrest } from '@/components/betting/TeamCrest';
import { Badge } from '@/components/common/Badge';
import { Drawer } from '@/components/common/Drawer';
import { EmptyState } from '@/components/common/EmptyState';
import { SPORTS_CATEGORIES } from '@/data/mockData';
import { useAurelStore } from '@/store/useAurelStore';
import { formatMatchTime, formatOdds } from '@/utils/formatters';
import { MarketTab, SportKey } from '@/types';
import { clsx } from 'clsx';

interface CustomerSportsProps {
  liveOnly?: boolean;
}

const MARKET_TABS: { key: MarketTab; label: string }[] = [
  { key: 'main', label: 'Main Markets' },
  { key: 'goals', label: 'Goals' },
  { key: 'corners', label: 'Corners' },
  { key: 'players', label: 'Player Markets' },
  { key: 'info', label: 'Match Information' },
];

export const CustomerSports: React.FC<CustomerSportsProps> = ({ liveOnly = false }) => {
  const [sportFilter, setSportFilter] = useState<'all' | SportKey>('all');
  const [compFilter, setCompFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [marketTab, setMarketTab] = useState<MarketTab>('main');
  const [mobileSlipOpen, setMobileSlipOpen] = useState(false);

  const matches = useAurelStore((s) => s.matches);
  const betSlip = useAurelStore((s) => s.betSlip);
  const toggleBetSelection = useAurelStore((s) => s.toggleBetSelection);
  const addToast = useAurelStore((s) => s.addToast);

  const competitions = useMemo(() => {
    const base = matches.filter((m) =>
      (liveOnly ? m.status === 'live' : true) &&
      (sportFilter === 'all' || m.sport === sportFilter)
    );
    return Array.from(new Set(base.map((m) => m.competition)));
  }, [matches, sportFilter, liveOnly]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (liveOnly && m.status !== 'live') return false;
      if (sportFilter !== 'all' && m.sport !== sportFilter) return false;
      if (compFilter !== 'all' && m.competition !== compFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = `${m.homeTeam.name} ${m.awayTeam.name} ${m.competition}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [matches, liveOnly, sportFilter, compFilter, searchQuery]);

  const activeMatch =
    filteredMatches.find((m) => m.id === selectedMatchId) || filteredMatches[0] || null;

  const activeTabMarkets = useMemo(() => {
    if (!activeMatch || marketTab === 'info') return [];
    return activeMatch.markets.filter((m) => m.category === marketTab);
  }, [activeMatch, marketTab]);

  return (
    <CustomerLayout
      title={liveOnly ? 'Live Betting Center' : 'Sports & Markets'}
      onToggleSlipDrawer={() => setMobileSlipOpen(true)}
    >
      <div className="space-y-5">
        {/* Category Strip */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => {
                setSportFilter('all');
                setCompFilter('all');
              }}
              className={clsx(
                'shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                sportFilter === 'all'
                  ? 'border-forest bg-forest text-ivory'
                  : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
              )}
            >
              {liveOnly ? <Radio className="h-3.5 w-3.5 text-champagne" /> : null}
              All Sports
            </button>
            {SPORTS_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => {
                  setSportFilter(cat.key);
                  setCompFilter('all');
                }}
                className={clsx(
                  'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors',
                  sportFilter === cat.key
                    ? 'border-forest bg-forest text-ivory'
                    : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-grey" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search matches..."
              className="h-10 w-full rounded-btn border border-warm-border bg-soft-white pl-9 pr-3 text-xs text-charcoal focus:border-forest focus:outline-none"
            />
          </div>
        </div>

        {/* Competition filter pills */}
        {competitions.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setCompFilter('all')}
              className={clsx(
                'shrink-0 rounded-btn px-2.5 py-1 text-[11px] font-medium',
                compFilter === 'all'
                  ? 'bg-champagne-soft text-forest border border-champagne/40'
                  : 'text-muted-grey hover:text-charcoal'
              )}
            >
              All Competitions
            </button>
            {competitions.map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => setCompFilter(comp)}
                className={clsx(
                  'shrink-0 rounded-btn px-2.5 py-1 text-[11px] font-medium',
                  compFilter === comp
                    ? 'bg-champagne-soft text-forest border border-champagne/40'
                    : 'text-muted-grey hover:text-charcoal'
                )}
              >
                {comp}
              </button>
            ))}
          </div>
        )}

        {/* Main Desktop 3-Column Sportsbook (List + Center Markets + Right Bet Slip) */}
        <div className="grid gap-5 xl:grid-cols-12">
          {/* Left: Match List */}
          <div className="xl:col-span-4 space-y-2.5">
            {filteredMatches.length === 0 ? (
              <EmptyState
                icon={Trophy}
                title="No events match your filter"
                description="Reset filters to view available simulated events."
                actionLabel="Show all events"
                onAction={() => {
                  setSportFilter('all');
                  setCompFilter('all');
                  setSearchQuery('');
                }}
              />
            ) : (
              filteredMatches.map((m) => {
                const isSelected = activeMatch?.id === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMatchId(m.id);
                      setMarketTab('main');
                    }}
                    className={clsx(
                      'w-full rounded-card border p-4 text-left transition-all',
                      isSelected
                        ? 'border-forest bg-soft-white ring-1 ring-forest shadow-subtle'
                        : 'border-warm-border bg-soft-white hover:border-sage'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate font-medium text-muted-grey">
                        {m.competition}
                      </span>
                      {m.status === 'live' ? (
                        <Badge tone="live">LIVE {m.minute}</Badge>
                      ) : (
                        <span className="text-muted-grey">{formatMatchTime(m.startTime)}</span>
                      )}
                    </div>
                    <div className="mt-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
                        <span className="truncate">{m.homeTeam.name}</span>
                        {m.status === 'live' && m.score && (
                          <span className="text-forest tabular-nums">{m.score.home}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
                        <span className="truncate">{m.awayTeam.name}</span>
                        {m.status === 'live' && m.score && (
                          <span className="text-forest tabular-nums">{m.score.away}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Center: Selected Match Markets */}
          <div className="xl:col-span-5">
            {activeMatch ? (
              <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
                {/* Match Header */}
                <div className="bg-forest p-5 text-ivory">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-champagne font-medium">{activeMatch.competition}</span>
                    <Badge tone={activeMatch.status === 'live' ? 'champagne' : 'neutral'}>
                      {activeMatch.status === 'live'
                        ? `LIVE ${activeMatch.minute}`
                        : formatMatchTime(activeMatch.startTime)}
                    </Badge>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <TeamCrest
                        shortName={activeMatch.homeTeam.shortName}
                        color={activeMatch.homeTeam.primaryColor}
                        size="sm"
                      />
                      <span className="truncate font-heading text-sm font-semibold">
                        {activeMatch.homeTeam.name}
                      </span>
                    </div>

                    {activeMatch.status === 'live' && activeMatch.score ? (
                      <span className="font-heading text-xl font-semibold text-champagne tabular-nums shrink-0">
                        {activeMatch.score.home} - {activeMatch.score.away}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-sage-muted shrink-0">VS</span>
                    )}

                    <div className="flex items-center justify-end gap-2.5 min-w-0">
                      <span className="truncate font-heading text-sm font-semibold text-right">
                        {activeMatch.awayTeam.name}
                      </span>
                      <TeamCrest
                        shortName={activeMatch.awayTeam.shortName}
                        color={activeMatch.awayTeam.primaryColor}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Market Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto border-b border-warm-border bg-ivory/60 px-3 py-2">
                  {MARKET_TABS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setMarketTab(t.key)}
                      className={clsx(
                        'shrink-0 rounded-btn px-3 py-1.5 text-xs font-medium transition-colors',
                        marketTab === t.key
                          ? 'bg-soft-white text-forest shadow-subtle'
                          : 'text-muted-grey hover:text-charcoal'
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Market Options */}
                <div className="p-5 space-y-4">
                  {marketTab === 'info' ? (
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-warm-border pb-2">
                        <span className="text-muted-grey">Venue</span>
                        <span className="font-medium text-charcoal">{activeMatch.stats.venue}</span>
                      </div>
                      <div className="flex justify-between border-b border-warm-border pb-2">
                        <span className="text-muted-grey">Match Official</span>
                        <span className="font-medium text-charcoal">
                          {activeMatch.stats.referee || 'Appointed'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-grey">Weather / Arena</span>
                        <span className="font-medium text-charcoal">
                          {activeMatch.stats.weather || 'Standard Conditions'}
                        </span>
                      </div>
                    </div>
                  ) : activeTabMarkets.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-grey">
                      No markets available under this tab for this demo event. Switch to Main
                      Markets.
                    </p>
                  ) : (
                    activeTabMarkets.map((mkt) => (
                      <div key={mkt.id} className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-charcoal">{mkt.name}</span>
                          <span className="text-[11px] text-muted-grey">
                            {mkt.mutuallyExclusive ? '1 selection' : 'Multi'}
                          </span>
                        </div>
                        <div
                          className="grid gap-2"
                          style={{
                            gridTemplateColumns: `repeat(${Math.min(
                              mkt.options.length,
                              3
                            )}, minmax(0, 1fr))`,
                          }}
                        >
                          {mkt.options.map((opt) => {
                            const selId = `${activeMatch.id}__${mkt.id}__${opt.id}`;
                            const active = betSlip.some((s) => s.id === selId);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  toggleBetSelection(
                                    {
                                      id: selId,
                                      matchId: activeMatch.id,
                                      eventLabel: `${activeMatch.homeTeam.name} vs ${activeMatch.awayTeam.name}`,
                                      sport: activeMatch.sport,
                                      competition: activeMatch.competition,
                                      marketId: mkt.id,
                                      marketName: mkt.name,
                                      optionId: opt.id,
                                      outcomeLabel: opt.label,
                                      odds: opt.odds,
                                    },
                                    mkt.mutuallyExclusive
                                  );
                                  if (!active) {
                                    addToast(
                                      'success',
                                      'Added to Bet Slip',
                                      `${opt.label} @ ${formatOdds(opt.odds)}`
                                    );
                                  }
                                }}
                                className={clsx(
                                  'flex flex-col items-center justify-center rounded-btn border px-2.5 py-2.5 text-center transition-all min-h-[48px]',
                                  active
                                    ? 'border-forest bg-forest text-ivory'
                                    : 'border-warm-border bg-ivory/60 text-charcoal hover:border-sage'
                                )}
                              >
                                <span
                                  className={clsx(
                                    'w-full truncate text-[11px]',
                                    active ? 'text-champagne' : 'text-muted-grey'
                                  )}
                                >
                                  {opt.label}
                                </span>
                                <span className="mt-0.5 text-xs font-semibold tabular-nums">
                                  {formatOdds(opt.odds)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right: Desktop Persistent Bet Slip */}
          <div className="hidden xl:block xl:col-span-3">
            <div className="sticky top-24">
              <BetSlipPanel />
            </div>
          </div>
        </div>
      </div>

      {/* Tablet / Mobile Bottom Bet Slip Drawer */}
      <Drawer
        open={mobileSlipOpen}
        onClose={() => setMobileSlipOpen(false)}
        title="Demo Bet Slip"
        side="bottom"
      >
        <BetSlipPanel onPlaced={() => setMobileSlipOpen(false)} />
      </Drawer>
    </CustomerLayout>
  );
};

