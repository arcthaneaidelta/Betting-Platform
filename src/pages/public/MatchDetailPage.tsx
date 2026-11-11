import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, UserCheck, Cloud, Ticket } from 'lucide-react';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { BetSlipPanel } from '@/components/betting/BetSlipPanel';
import { TeamCrest } from '@/components/betting/TeamCrest';
import { Badge } from '@/components/common/Badge';
import { Drawer } from '@/components/common/Drawer';
import { useAurelStore } from '@/store/useAurelStore';
import { formatMatchTime, formatOdds } from '@/utils/formatters';
import { MarketTab } from '@/types';
import { clsx } from 'clsx';

const TABS: { key: MarketTab; label: string }[] = [
  { key: 'main', label: 'Main Markets' },
  { key: 'goals', label: 'Goals / Totals' },
  { key: 'corners', label: 'Corners' },
  { key: 'players', label: 'Player Markets' },
  { key: 'info', label: 'Match Information' },
];

export const MatchDetailPage: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [activeTab, setActiveTab] = useState<MarketTab>('main');
  const [slipDrawerOpen, setSlipDrawerOpen] = useState(false);

  const matches = useAurelStore((s) => s.matches);
  const betSlip = useAurelStore((s) => s.betSlip);
  const toggleBetSelection = useAurelStore((s) => s.toggleBetSelection);
  const addToast = useAurelStore((s) => s.addToast);

  const match = matches.find((m) => m.id === matchId) || matches[0];

  const tabMarkets = useMemo(() => {
    if (!match || activeTab === 'info') return [];
    const exact = match.markets.filter((m) => m.category === activeTab);
    return exact;
  }, [match, activeTab]);

  if (!match) {
    return null;
  }

  const eventLabel = `${match.homeTeam.name} vs ${match.awayTeam.name}`;

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <PublicHeader />

      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/sports"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-grey hover:text-forest"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to all sports
          </Link>

          {/* Match Hero Card */}
          <div className="mt-4 rounded-card-lg border border-warm-border bg-forest p-6 text-ivory sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-champagne">
                  {match.competition}
                </p>
                <p className="mt-1 text-xs text-sage-muted">
                  {formatMatchTime(match.startTime)} · Simulated Fixture ({match.id})
                </p>
              </div>
              {match.status === 'live' ? (
                <Badge tone="champagne">LIVE · {match.minute}</Badge>
              ) : (
                <Badge tone="neutral">{match.status}</Badge>
              )}
            </div>

            <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex items-center gap-3.5">
                <TeamCrest
                  shortName={match.homeTeam.shortName}
                  color={match.homeTeam.primaryColor}
                  size="lg"
                />
                <div>
                  <p className="font-heading text-lg font-semibold sm:text-2xl">
                    {match.homeTeam.name}
                  </p>
                  <p className="text-xs text-sage-muted">Home Side</p>
                </div>
              </div>

              <div className="px-4 text-center">
                {match.status === 'live' && match.score ? (
                  <p className="font-heading text-3xl font-semibold text-champagne tabular-nums sm:text-4xl">
                    {match.score.home} : {match.score.away}
                  </p>
                ) : (
                  <p className="font-heading text-xl font-medium text-champagne">VS</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3.5 text-right">
                <div>
                  <p className="font-heading text-lg font-semibold sm:text-2xl">
                    {match.awayTeam.name}
                  </p>
                  <p className="text-xs text-sage-muted">Away Side</p>
                </div>
                <TeamCrest
                  shortName={match.awayTeam.shortName}
                  color={match.awayTeam.primaryColor}
                  size="lg"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-12">
            {/* Markets Column */}
            <div className="xl:col-span-8 space-y-5">
              {/* Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setActiveTab(t.key)}
                    className={clsx(
                      'shrink-0 rounded-btn border px-4 py-2 text-xs font-medium transition-colors',
                      activeTab === t.key
                        ? 'border-forest bg-forest text-ivory'
                        : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {activeTab === 'info' ? (
                <div className="rounded-card border border-warm-border bg-soft-white p-6 space-y-5">
                  <h2 className="font-heading text-lg font-semibold text-charcoal">
                    Simulated Match Information &amp; Statistics
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-card border border-warm-border bg-ivory/50 p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-grey">
                        <MapPin className="h-3.5 w-3.5 text-forest" />
                        Venue
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-charcoal">
                        {match.stats.venue}
                      </p>
                    </div>
                    <div className="rounded-card border border-warm-border bg-ivory/50 p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-grey">
                        <UserCheck className="h-3.5 w-3.5 text-forest" />
                        Match Official
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-charcoal">
                        {match.stats.referee || 'Appointed Official'}
                      </p>
                    </div>
                    <div className="rounded-card border border-warm-border bg-ivory/50 p-4">
                      <div className="flex items-center gap-2 text-xs text-muted-grey">
                        <Cloud className="h-3.5 w-3.5 text-forest" />
                        Conditions
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-charcoal">
                        {match.stats.weather || 'Standard Match Conditions'}
                      </p>
                    </div>
                  </div>

                  {match.stats.possessionHome !== undefined && (
                    <div className="space-y-3 border-t border-warm-border pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-grey">
                        Simulated Live Telemetry
                      </p>
                      {[
                        {
                          label: 'Possession %',
                          home: match.stats.possessionHome,
                          away: match.stats.possessionAway ?? 50,
                        },
                        {
                          label: 'Total Shots',
                          home: match.stats.shotsHome ?? 0,
                          away: match.stats.shotsAway ?? 0,
                        },
                        {
                          label: 'Corners Won',
                          home: match.stats.cornersHome ?? 0,
                          away: match.stats.cornersAway ?? 0,
                        },
                      ].map((stat) => {
                        const total = Math.max(1, stat.home + stat.away);
                        const homePct = Math.round((stat.home / total) * 100);
                        return (
                          <div key={stat.label} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-medium tabular-nums">
                              <span>{stat.home}</span>
                              <span className="text-muted-grey">{stat.label}</span>
                              <span>{stat.away}</span>
                            </div>
                            <div className="flex h-2 overflow-hidden rounded-full bg-ivory">
                              <div
                                className="bg-forest"
                                style={{ width: `${homePct}%` }}
                              />
                              <div className="flex-1 bg-champagne" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : tabMarkets.length === 0 ? (
                <div className="rounded-card border border-warm-border bg-soft-white p-8 text-center text-sm text-muted-grey">
                  No additional markets under this category for the selected demo fixture. Explore
                  Main Markets or Match Information.
                </div>
              ) : (
                <div className="space-y-4">
                  {tabMarkets.map((mkt) => (
                    <div
                      key={mkt.id}
                      className="rounded-card border border-warm-border bg-soft-white p-5"
                    >
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-warm-border">
                        <h3 className="font-heading text-sm font-semibold text-charcoal">
                          {mkt.name}
                        </h3>
                        <span className="text-[11px] text-muted-grey">
                          {mkt.mutuallyExclusive ? 'Single selection' : 'Multiple selections'}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                        {mkt.options.map((opt) => {
                          const selId = `${match.id}__${mkt.id}__${opt.id}`;
                          const active = betSlip.some((s) => s.id === selId);
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                toggleBetSelection(
                                  {
                                    id: selId,
                                    matchId: match.id,
                                    eventLabel,
                                    sport: match.sport,
                                    competition: match.competition,
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
                                    'Added to Demo Bet Slip',
                                    `${opt.label} @ ${formatOdds(opt.odds)}`
                                  );
                                }
                              }}
                              className={clsx(
                                'flex items-center justify-between rounded-btn border px-3.5 py-3 text-xs transition-all min-h-[44px]',
                                active
                                  ? 'border-forest bg-forest text-ivory'
                                  : 'border-warm-border bg-ivory/60 text-charcoal hover:border-sage'
                              )}
                            >
                              <span className="font-medium truncate mr-2">{opt.label}</span>
                              <span
                                className={clsx(
                                  'font-semibold tabular-nums',
                                  active ? 'text-champagne' : 'text-forest'
                                )}
                              >
                                {formatOdds(opt.odds)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Bet Slip */}
            <div className="hidden xl:block xl:col-span-4">
              <div className="sticky top-24">
                <BetSlipPanel isPublicContext />
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-4 right-4 z-30 xl:hidden">
        <button
          type="button"
          onClick={() => setSlipDrawerOpen(true)}
          className="inline-flex h-12 items-center gap-2 rounded-full border border-forest bg-forest px-5 text-sm font-medium text-ivory shadow-elevated"
        >
          <Ticket className="h-4 w-4 text-champagne" />
          <span>Bet Slip ({betSlip.length})</span>
        </button>
      </div>

      <Drawer
        open={slipDrawerOpen}
        onClose={() => setSlipDrawerOpen(false)}
        title="Demo Bet Slip"
        side="bottom"
      >
        <BetSlipPanel isPublicContext onPlaced={() => setSlipDrawerOpen(false)} />
      </Drawer>

      <PublicFooter />
    </div>
  );
};

