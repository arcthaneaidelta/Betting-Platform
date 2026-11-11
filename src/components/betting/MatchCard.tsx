import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Clock } from 'lucide-react';
import { Match } from '@/types';
import { useAurelStore } from '@/store/useAurelStore';
import { formatMatchTime, formatOdds } from '@/utils/formatters';
import { Badge } from '@/components/common/Badge';
import { TeamCrest } from './TeamCrest';
import { clsx } from 'clsx';

interface MatchCardProps {
  match: Match;
  detailHref?: string;
  onSelectMatch?: (match: Match) => void;
  compact?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  detailHref,
  onSelectMatch,
  compact = false,
}) => {
  const betSlip = useAurelStore((s) => s.betSlip);
  const toggleBetSelection = useAurelStore((s) => s.toggleBetSelection);
  const addToast = useAurelStore((s) => s.addToast);

  const primaryMarket = match.markets[0];
  const eventLabel = `${match.homeTeam.name} vs ${match.awayTeam.name}`;

  const handleOddClick = (optionId: string, label: string, odds: number) => {
    if (!primaryMarket) return;
    const id = `${match.id}__${primaryMarket.id}__${optionId}`;
    const alreadySelected = betSlip.some((s) => s.id === id);

    toggleBetSelection(
      {
        id,
        matchId: match.id,
        eventLabel,
        sport: match.sport,
        competition: match.competition,
        marketId: primaryMarket.id,
        marketName: primaryMarket.name,
        optionId,
        outcomeLabel: label,
        odds,
      },
      primaryMarket.mutuallyExclusive
    );

    if (!alreadySelected) {
      addToast('success', 'Added to Bet Slip', `${label} @ ${formatOdds(odds)}`);
    }
  };

  return (
    <article className="group flex flex-col justify-between rounded-card border border-warm-border bg-soft-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sage/70 hover:shadow-card">
      {/* Top Meta */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-grey">
            {match.competition}
          </span>
          {match.status === 'live' ? (
            <Badge tone="live">LIVE {match.minute || ''}</Badge>
          ) : (
            <Badge tone="neutral">
              <Clock className="h-3 w-3" />
              {formatMatchTime(match.startTime)}
            </Badge>
          )}
        </div>

        {/* Teams & Score */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TeamCrest
                shortName={match.homeTeam.shortName}
                color={match.homeTeam.primaryColor}
                size={compact ? 'sm' : 'md'}
              />
              <span className="truncate font-heading text-sm font-semibold text-charcoal">
                {match.homeTeam.name}
              </span>
            </div>
            {match.status === 'live' && match.score !== undefined && (
              <span className="font-heading text-base font-semibold text-forest tabular-nums">
                {match.score.home}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <TeamCrest
                shortName={match.awayTeam.shortName}
                color={match.awayTeam.primaryColor}
                size={compact ? 'sm' : 'md'}
              />
              <span className="truncate font-heading text-sm font-semibold text-charcoal">
                {match.awayTeam.name}
              </span>
            </div>
            {match.status === 'live' && match.score !== undefined && (
              <span className="font-heading text-base font-semibold text-forest tabular-nums">
                {match.score.away}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Odds Strip & Details */}
      <div className="mt-5 pt-4 border-t border-warm-border/70">
        {primaryMarket && (
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${Math.min(primaryMarket.options.length, 3)}, minmax(0, 1fr))`,
            }}
          >
            {primaryMarket.options.slice(0, 3).map((opt) => {
              const selId = `${match.id}__${primaryMarket.id}__${opt.id}`;
              const isSelected = betSlip.some((s) => s.id === selId);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleOddClick(opt.id, opt.label, opt.odds)}
                  className={clsx(
                    'flex flex-col items-center justify-center rounded-btn border px-2 py-2 text-center transition-all duration-150 min-h-[46px]',
                    isSelected
                      ? 'border-forest bg-forest text-ivory shadow-subtle'
                      : 'border-warm-border bg-ivory/60 text-charcoal hover:border-sage hover:bg-forest-light/60'
                  )}
                >
                  <span
                    className={clsx(
                      'w-full truncate text-[10px] font-medium',
                      isSelected ? 'text-champagne' : 'text-muted-grey'
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
        )}

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-grey">
            +{match.markets.length} {match.markets.length === 1 ? 'market' : 'markets'}
          </span>
          {onSelectMatch ? (
            <button
              type="button"
              onClick={() => onSelectMatch(match)}
              className="inline-flex items-center gap-1 font-medium text-forest hover:underline"
            >
              Match details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <Link
              to={detailHref || `/matches/${match.id}`}
              className="inline-flex items-center gap-1 font-medium text-forest hover:underline"
            >
              Match details
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
};

