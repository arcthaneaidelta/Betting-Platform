import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Compass,
  Shield,
  SlidersHorizontal,
  Trophy,
  Users,
  Lock,
  FileText,
  Eye,
  HeartHandshake,
  Mail,
  Clock,
  Send,
  Layers,
} from 'lucide-react';
import heroStadiumImg from '@/assets/hero-stadium.jpg';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { Reveal } from '@/components/common/Reveal';
import { MatchCard } from '@/components/betting/MatchCard';
import { TeamCrest } from '@/components/betting/TeamCrest';
import { useAurelStore } from '@/store/useAurelStore';
import { SPORTS_CATEGORIES } from '@/data/mockData';
import { formatCurrency, formatMatchTime, formatOdds } from '@/utils/formatters';
import { SportKey } from '@/types';
import { clsx } from 'clsx';

const contactSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email address'),
  organization: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const MARKET_PREVIEW_KEYS = [
  { key: 'winner', label: 'Match Winner' },
  { key: 'dc', label: 'Double Chance' },
  { key: 'goals', label: 'Total Goals' },
  { key: 'btts', label: 'Both Teams to Score' },
  { key: 'cs', label: 'Correct Score' },
  { key: 'ou', label: 'Over / Under' },
] as const;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState<'all' | SportKey>('all');
  const [activeMarketPreview, setActiveMarketPreview] = useState<string>('winner');

  const matches = useAurelStore((s) => s.matches);
  const betSlip = useAurelStore((s) => s.betSlip);
  const toggleBetSelection = useAurelStore((s) => s.toggleBetSelection);
  const setPublicSlipOpen = useAurelStore((s) => s.setPublicSlipOpen);
  const setActiveRole = useAurelStore((s) => s.setActiveRole);
  const customers = useAurelStore((s) => s.customers);
  const agents = useAurelStore((s) => s.agents);
  const demoBets = useAurelStore((s) => s.demoBets);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const transactions = useAurelStore((s) => s.transactions);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const heroMatch = matches[0];
  const showcaseMatch = matches.find((m) => m.id === 'MCH-202') || matches[1] || matches[0];
  const alex = customers.find((c) => c.id === 'CUS-1001') || customers[0];
  const michael = agents.find((a) => a.id === 'AGT-101') || agents[0];

  const michaelCustomers = customers.filter((c) => c.agentId === michael.id);
  const michaelPendingDeposits = depositRequests.filter(
    (d) => d.agentId === michael.id && d.status === 'pending'
  );
  const alexOpenBets = demoBets.filter(
    (b) => b.customerId === alex.id && b.status === 'open'
  );
  const alexRecentTxns = transactions
    .filter((t) => t.accountId === alex.id)
    .slice(0, 3);

  const filteredMatches = useMemo(() => {
    const base =
      selectedSport === 'all'
        ? matches.filter((m) => m.featured)
        : matches.filter((m) => m.sport === selectedSport);
    return base.slice(0, 9);
  }, [matches, selectedSport]);

  const tickerMatches = useMemo(() => [...matches, ...matches], [matches]);

  const previewMarketData = useMemo(() => {
    if (!showcaseMatch) return null;
    const findOrFallback = (fragment: string, fallbackIdx = 0) =>
      showcaseMatch.markets.find((mkt) =>
        mkt.name.toLowerCase().includes(fragment)
      ) || showcaseMatch.markets[fallbackIdx];

    switch (activeMarketPreview) {
      case 'dc':
        return findOrFallback('double chance', 1);
      case 'goals':
        return findOrFallback('total goals', 2);
      case 'btts':
        return findOrFallback('both teams', 3);
      case 'cs':
        return findOrFallback('correct score', 4);
      case 'ou':
        return findOrFallback('over / under', 2);
      default:
        return findOrFallback('match winner', 0);
    }
  }, [showcaseMatch, activeMarketPreview]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onContactSubmit = () => {
    addToast(
      'success',
      'Demo Inquiry Received',
      'Thank you. This frontend inquiry form validates and simulates submission cleanly.'
    );
    reset();
  };

  const handleQuickOdd = (
    matchId: string,
    eventLabel: string,
    sport: SportKey,
    competition: string,
    marketId: string,
    marketName: string,
    mutuallyExclusive: boolean,
    optionId: string,
    label: string,
    odds: number
  ) => {
    const id = `${matchId}__${marketId}__${optionId}`;
    const exists = betSlip.some((s) => s.id === id);
    toggleBetSelection(
      {
        id,
        matchId,
        eventLabel,
        sport,
        competition,
        marketId,
        marketName,
        optionId,
        outcomeLabel: label,
        odds,
      },
      mutuallyExclusive
    );
    if (!exists) {
      addToast('success', 'Added to Demo Bet Slip', `${label} @ ${formatOdds(odds)}`);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-ivory text-charcoal">
      <PublicHeader transparentHero />

      {/* 1. HERO SECTION */}
      <section className="relative flex min-h-[680px] lg:min-h-[760px] items-center overflow-hidden bg-forest-dark pt-24 pb-16 text-ivory">
        {/* Local stadium visual with subtle CSS ambient movement */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <img
            src={heroStadiumImg}
            alt="Evening football stadium atmosphere"
            className="h-full w-full object-cover object-center opacity-55 animate-ambient-pan"
          />
          {/* Deep forest & vignette overlays */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(95deg, rgba(25, 42, 37, 0.94) 0%, rgba(25, 42, 37, 0.78) 48%, rgba(25, 42, 37, 0.56) 100%)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at center, transparent 45%, rgba(16, 28, 24, 0.72) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          {/* Left Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-champagne/30 bg-soft-white/5 px-3.5 py-1.5 text-[11px] font-medium tracking-[0.18em] text-champagne uppercase">
              The Next Level of Sports Entertainment
            </p>

            <h1 className="font-heading text-4xl font-semibold leading-[1.08] tracking-tight text-ivory sm:text-5xl lg:text-6xl">
              Every Moment.
              <br />
              <span className="text-champagne">Closer to the Game.</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-ivory/80 sm:text-lg">
              Experience a smarter way to follow sports, explore markets and manage your
              betting experience, all in one place.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button variant="champagne" size="lg" onClick={() => navigate('/sports')}>
                Explore Sports
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline-light"
                size="lg"
                onClick={() => navigate('/demo-access')}
              >
                Enter Demo
              </Button>
            </div>

            <div className="grid gap-3 pt-4 border-t border-soft-white/15 sm:grid-cols-3">
              {[
                'Intuitive betting experience',
                'Transparent account management',
                'Dedicated customer support',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-ivory/80">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-champagne" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Featured Floating Match Composition */}
          {heroMatch && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5"
            >
              <div className="rounded-card-lg border border-soft-white/15 bg-soft-white/95 p-6 text-charcoal shadow-elevated backdrop-blur-md">
                <div className="flex items-center justify-between gap-3 border-b border-warm-border pb-3.5">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-grey">
                      {heroMatch.competition}
                    </p>
                    <p className="mt-0.5 text-xs text-charcoal">
                      {formatMatchTime(heroMatch.startTime)} · Demo Fixture
                    </p>
                  </div>
                  <Badge tone="live">LIVE {heroMatch.minute}</Badge>
                </div>

                <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                  <div className="flex flex-col items-center text-center gap-2">
                    <TeamCrest
                      shortName={heroMatch.homeTeam.shortName}
                      color={heroMatch.homeTeam.primaryColor}
                      size="lg"
                    />
                    <span className="font-heading text-sm font-semibold text-charcoal">
                      {heroMatch.homeTeam.name}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="font-heading text-2xl font-semibold text-forest tabular-nums">
                      {heroMatch.score?.home ?? 0} : {heroMatch.score?.away ?? 0}
                    </span>
                    <span className="mt-1 text-[10px] uppercase tracking-widest text-muted-grey">
                      Simulated Live
                    </span>
                  </div>

                  <div className="flex flex-col items-center text-center gap-2">
                    <TeamCrest
                      shortName={heroMatch.awayTeam.shortName}
                      color={heroMatch.awayTeam.primaryColor}
                      size="lg"
                    />
                    <span className="font-heading text-sm font-semibold text-charcoal">
                      {heroMatch.awayTeam.name}
                    </span>
                  </div>
                </div>

                {heroMatch.markets[0] && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-grey">
                      <span>{heroMatch.markets[0].name}</span>
                      <span>Click odd to add to slip</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {heroMatch.markets[0].options.map((opt) => {
                        const selId = `${heroMatch.id}__${heroMatch.markets[0].id}__${opt.id}`;
                        const active = betSlip.some((s) => s.id === selId);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleQuickOdd(
                                heroMatch.id,
                                `${heroMatch.homeTeam.name} vs ${heroMatch.awayTeam.name}`,
                                heroMatch.sport,
                                heroMatch.competition,
                                heroMatch.markets[0].id,
                                heroMatch.markets[0].name,
                                true,
                                opt.id,
                                opt.label,
                                opt.odds
                              )
                            }
                            className={clsx(
                              'flex flex-col items-center rounded-btn border px-2 py-2.5 transition-all min-h-[50px]',
                              active
                                ? 'border-forest bg-forest text-ivory'
                                : 'border-warm-border bg-ivory/70 text-charcoal hover:border-sage hover:bg-forest-light/70'
                            )}
                          >
                            <span
                              className={clsx(
                                'text-[10px] font-medium truncate max-w-full',
                                active ? 'text-champagne' : 'text-muted-grey'
                              )}
                            >
                              {opt.label}
                            </span>
                            <span className="mt-0.5 text-sm font-semibold tabular-nums">
                              {formatOdds(opt.odds)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-warm-border text-xs">
                  <Link
                    to={`/matches/${heroMatch.id}`}
                    className="font-medium text-forest hover:underline"
                  >
                    Open full match markets
                  </Link>
                  {betSlip.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setPublicSlipOpen(true)}
                      className="font-medium text-champagne-dark hover:underline"
                    >
                      View Bet Slip ({betSlip.length})
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* 2. LIVE MATCH TICKER */}
      <div
        className="border-y border-warm-border bg-soft-white py-3 overflow-hidden"
        aria-label="Simulated match ticker"
      >
        <div className="flex items-center">
          <div className="hidden sm:flex shrink-0 items-center gap-2 border-r border-warm-border bg-soft-white px-4 py-1 text-[11px] font-semibold uppercase tracking-wider text-forest z-10">
            <span className="h-2 w-2 rounded-full bg-champagne" />
            Demo Match Center
          </div>
          <div className="overflow-hidden flex-1">
            <div className="ticker-track flex w-max animate-ticker items-center gap-6 px-4">
              {tickerMatches.map((m, idx) => {
                const firstOpt = m.markets[0]?.options || [];
                return (
                  <Link
                    key={`${m.id}-${idx}`}
                    to={`/matches/${m.id}`}
                    className="flex items-center gap-3 rounded-btn border border-warm-border bg-ivory/60 px-3.5 py-1.5 text-xs transition-colors hover:border-sage hover:bg-ivory"
                  >
                    <span className="font-semibold text-charcoal whitespace-nowrap">
                      {m.homeTeam.shortName}{' '}
                      {m.status === 'live' && m.score
                        ? `${m.score.home}-${m.score.away}`
                        : 'vs'}{' '}
                      {m.awayTeam.shortName}
                    </span>
                    <span
                      className={clsx(
                        'rounded px-1.5 py-0.5 text-[10px] font-medium',
                        m.status === 'live'
                          ? 'bg-forest text-champagne'
                          : 'bg-soft-white text-muted-grey border border-warm-border'
                      )}
                    >
                      {m.status === 'live' ? m.minute : 'Upcoming'}
                    </span>
                    <span className="text-muted-grey tabular-nums whitespace-nowrap">
                      {firstOpt.map((o) => formatOdds(o.odds)).join(' · ')}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SPORTS CATEGORIES & 4. FEATURED EVENTS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-grey">
                Sports &amp; Markets
              </p>
              <h2 className="mt-1.5 font-heading text-3xl font-semibold text-charcoal">
                Featured Events
              </h2>
              <p className="mt-1 text-sm text-muted-grey">
                The matches everyone is watching. Select any category to filter simulated fixtures.
              </p>
            </div>
            <Link
              to="/sports"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-forest hover:underline"
            >
              Browse all {matches.length} demo events
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {/* Category Strip */}
        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          <button
            type="button"
            onClick={() => setSelectedSport('all')}
            className={clsx(
              'flex flex-col items-start justify-between rounded-card border p-3.5 text-left transition-all min-h-[82px]',
              selectedSport === 'all'
                ? 'border-forest bg-forest text-ivory shadow-subtle'
                : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
            )}
          >
            <Trophy
              className={clsx(
                'h-4 w-4',
                selectedSport === 'all' ? 'text-champagne' : 'text-forest'
              )}
            />
            <div className="mt-2">
              <p className="text-xs font-semibold">All Featured</p>
              <p
                className={clsx(
                  'text-[11px] tabular-nums',
                  selectedSport === 'all' ? 'text-sage-muted' : 'text-muted-grey'
                )}
              >
                {matches.length} events
              </p>
            </div>
          </button>

          {SPORTS_CATEGORIES.map((cat) => {
            const count = matches.filter((m) => m.sport === cat.key).length;
            const active = selectedSport === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedSport(cat.key)}
                className={clsx(
                  'flex flex-col items-start justify-between rounded-card border p-3.5 text-left transition-all min-h-[82px]',
                  active
                    ? 'border-forest bg-forest text-ivory shadow-subtle'
                    : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
                )}
              >
                <CircleDot
                  className={clsx('h-4 w-4', active ? 'text-champagne' : 'text-forest')}
                />
                <div className="mt-2">
                  <p className="text-xs font-semibold truncate">{cat.label}</p>
                  <p
                    className={clsx(
                      'text-[11px] tabular-nums',
                      active ? 'text-sage-muted' : 'text-muted-grey'
                    )}
                  >
                    {count} {count === 1 ? 'event' : 'events'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Match Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      </section>

      {/* 5. BETTING MARKETS PREVIEW */}
      <section className="border-y border-warm-border bg-soft-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5 space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-grey">
                  Market Architecture
                </p>
                <h2 className="font-heading text-3xl font-semibold text-charcoal">
                  Precision Markets, Instant Slip Sync.
                </h2>
                <p className="text-sm leading-relaxed text-muted-grey">
                  Switch across market types below to preview live decimal odds structures.
                  Every selection connects directly to the interactive bet slip.
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {MARKET_PREVIEW_KEYS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveMarketPreview(item.key)}
                      className={clsx(
                        'rounded-btn border px-3.5 py-2 text-xs font-medium transition-colors min-h-[40px]',
                        activeMarketPreview === item.key
                          ? 'border-forest bg-forest text-ivory'
                          : 'border-warm-border bg-ivory/70 text-charcoal hover:border-sage'
                      )}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7">
                {showcaseMatch && previewMarketData && (
                  <div className="rounded-card-lg border border-warm-border bg-ivory/60 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-warm-border pb-4">
                      <div>
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-grey">
                          {showcaseMatch.competition}
                        </span>
                        <h3 className="mt-0.5 font-heading text-lg font-semibold text-charcoal">
                          {showcaseMatch.homeTeam.name} vs {showcaseMatch.awayTeam.name}
                        </h3>
                      </div>
                      <Badge tone="champagne">{previewMarketData.name}</Badge>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-3">
                      {previewMarketData.options.map((opt) => {
                        const selId = `${showcaseMatch.id}__${previewMarketData.id}__${opt.id}`;
                        const active = betSlip.some((s) => s.id === selId);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() =>
                              handleQuickOdd(
                                showcaseMatch.id,
                                `${showcaseMatch.homeTeam.name} vs ${showcaseMatch.awayTeam.name}`,
                                showcaseMatch.sport,
                                showcaseMatch.competition,
                                previewMarketData.id,
                                previewMarketData.name,
                                previewMarketData.mutuallyExclusive,
                                opt.id,
                                opt.label,
                                opt.odds
                              )
                            }
                            className={clsx(
                              'flex items-center justify-between rounded-card border p-4 text-left transition-all',
                              active
                                ? 'border-forest bg-forest text-ivory shadow-subtle'
                                : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
                            )}
                          >
                            <span className="text-xs font-medium">{opt.label}</span>
                            <span
                              className={clsx(
                                'text-sm font-semibold tabular-nums',
                                active ? 'text-champagne' : 'text-forest'
                              )}
                            >
                              {formatOdds(opt.odds)}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex items-center justify-between text-xs text-muted-grey">
                      <span>Simulated odds demonstration</span>
                      <Link
                        to={`/matches/${showcaseMatch.id}`}
                        className="font-medium text-forest hover:underline"
                      >
                        Explore all {showcaseMatch.markets.length} markets →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-grey">
              Structured Workflow
            </p>
            <h2 className="mt-1.5 font-heading text-3xl font-semibold text-charcoal">
              How AUREL Operates
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Explore',
                desc: 'Find your favorite sports and upcoming matches.',
                icon: Compass,
              },
              {
                num: '02',
                title: 'Select',
                desc: 'Explore available markets and add your selections to your bet slip.',
                icon: SlidersHorizontal,
              },
              {
                num: '03',
                title: 'Manage',
                desc: 'Keep track of your account, betting activity and available balance.',
                icon: Layers,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="relative rounded-card border border-warm-border bg-soft-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xs font-semibold tracking-widest text-champagne-dark">
                      {step.num}
                    </span>
                    <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-forest-light text-forest">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-5 font-heading text-xl font-semibold text-charcoal">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-grey">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </Reveal>
      </section>

      {/* 7. ACCOUNT MANAGEMENT PREVIEW (CUSTOMER) */}
      <section className="border-t border-warm-border bg-soft-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5 space-y-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-grey">
                  Customer Portal
                </p>
                <h2 className="font-heading text-3xl font-semibold text-charcoal">
                  Transparent Account &amp; Wallet Clarity.
                </h2>
                <p className="text-sm leading-relaxed text-muted-grey">
                  Customers track simulated balances, active tickets, internal deposit requests,
                  and a complete transaction ledger without clutter.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    onClick={() => {
                      setActiveRole('customer');
                      navigate('/customer');
                    }}
                  >
                    Explore the Experience
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-card-lg border border-warm-border bg-ivory p-6 shadow-card">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-warm-border pb-4">
                    <div>
                      <p className="text-xs text-muted-grey">Customer Demo · {alex.id}</p>
                      <h3 className="font-heading text-lg font-semibold text-charcoal">
                        {alex.name}
                      </h3>
                    </div>
                    <div className="rounded-card border border-forest/15 bg-forest px-4 py-2.5 text-ivory">
                      <p className="text-[10px] uppercase tracking-wider text-champagne">
                        Available Demo Balance
                      </p>
                      <p className="font-heading text-xl font-semibold tabular-nums">
                        {formatCurrency(alex.walletBalance, currency)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-card border border-warm-border bg-soft-white p-3.5">
                      <p className="text-[11px] text-muted-grey">Open Bets</p>
                      <p className="mt-1 font-heading text-lg font-semibold text-charcoal tabular-nums">
                        {alexOpenBets.length}
                      </p>
                    </div>
                    <div className="rounded-card border border-warm-border bg-soft-white p-3.5">
                      <p className="text-[11px] text-muted-grey">Assigned Agent</p>
                      <p className="mt-1 text-sm font-semibold text-charcoal">{michael.name}</p>
                    </div>
                    <div className="rounded-card border border-warm-border bg-soft-white p-3.5">
                      <p className="text-[11px] text-muted-grey">Account Status</p>
                      <div className="mt-1">
                        <Badge tone={statusToBadgeTone(alex.status)}>{alex.status}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-card border border-warm-border bg-soft-white overflow-hidden">
                    <div className="border-b border-warm-border px-4 py-2.5 text-xs font-semibold text-charcoal">
                      Recent Activity Preview
                    </div>
                    <div className="divide-y divide-warm-border">
                      {alexRecentTxns.map((txn) => (
                        <div
                          key={txn.id}
                          className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium text-charcoal">{txn.description}</p>
                            <p className="text-[11px] text-muted-grey tabular-nums">
                              {txn.reference}
                            </p>
                          </div>
                          <span
                            className={clsx(
                              'shrink-0 font-semibold tabular-nums',
                              txn.amount >= 0 ? 'text-success' : 'text-charcoal'
                            )}
                          >
                            {formatCurrency(txn.amount, currency, { showSign: true })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 8. AGENT MANAGEMENT PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="order-2 lg:order-1 lg:col-span-7">
              <div className="rounded-card-lg border border-warm-border bg-soft-white p-6 shadow-card">
                <div className="flex items-center justify-between border-b border-warm-border pb-4">
                  <div>
                    <p className="text-xs text-muted-grey">Agent Operations · {michael.id}</p>
                    <h3 className="font-heading text-lg font-semibold text-charcoal">
                      {michael.name} — {michael.region}
                    </h3>
                  </div>
                  <Badge tone="forest">Rate {michael.commissionRate}%</Badge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-card border border-warm-border bg-ivory/60 p-3.5">
                    <p className="text-[11px] text-muted-grey">Assigned Users</p>
                    <p className="mt-1 font-heading text-lg font-semibold tabular-nums">
                      {michaelCustomers.length}
                    </p>
                  </div>
                  <div className="rounded-card border border-warm-border bg-ivory/60 p-3.5">
                    <p className="text-[11px] text-muted-grey">Agent Wallet</p>
                    <p className="mt-1 font-heading text-lg font-semibold text-forest tabular-nums">
                      {formatCurrency(michael.walletBalance, currency)}
                    </p>
                  </div>
                  <div className="rounded-card border border-warm-border bg-ivory/60 p-3.5">
                    <p className="text-[11px] text-muted-grey">Pending Requests</p>
                    <p className="mt-1 font-heading text-lg font-semibold text-warning tabular-nums">
                      {michaelPendingDeposits.length}
                    </p>
                  </div>
                  <div className="rounded-card border border-warm-border bg-ivory/60 p-3.5">
                    <p className="text-[11px] text-muted-grey">Illustrative Comm.</p>
                    <p className="mt-1 font-heading text-lg font-semibold text-success tabular-nums">
                      {formatCurrency(michael.totalCommissionEarned, currency)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-charcoal">
                    Pending Assigned Deposit Requests
                  </p>
                  {michaelPendingDeposits.slice(0, 2).map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between rounded-btn border border-warm-border bg-ivory/50 px-3.5 py-2.5 text-xs"
                    >
                      <div>
                        <span className="font-medium text-charcoal">{req.customerName}</span>
                        <span className="ml-2 text-muted-grey tabular-nums">
                          ({req.reference})
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-charcoal tabular-nums">
                          {formatCurrency(req.amount, currency)}
                        </span>
                        <Badge tone="warning">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 lg:col-span-5 space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-grey">
                Agent Operations
              </p>
              <h2 className="font-heading text-3xl font-semibold text-charcoal">
                One Platform. Complete Control.
              </h2>
              <p className="text-sm leading-relaxed text-muted-grey">
                Manage customer relationships, monitor account activity and maintain a clear
                overview of your agent operations.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  onClick={() => {
                    setActiveRole('agent');
                    navigate('/agent');
                  }}
                >
                  Explore Agent Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setActiveRole('admin');
                    navigate('/admin');
                  }}
                >
                  Super Admin View
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 9. SECURITY & TRUST */}
      <section className="border-t border-warm-border bg-soft-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-grey">
                Platform Architecture
              </p>
              <h2 className="mt-1.5 font-heading text-3xl font-semibold text-charcoal">
                Designed Around Operational Clarity
              </h2>
              <p className="mt-2 text-sm text-muted-grey">
                Structured workflows connect customers, assigned agents, and super administrators
                with complete audit visibility.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: 'Role-based access',
                  desc: 'Dedicated interfaces isolate customer views, agent customer rosters, and platform-wide administration.',
                  icon: Shield,
                },
                {
                  title: 'Structured account management',
                  desc: 'Onboard, search, suspend, or reassign accounts with consistent state updates.',
                  icon: Users,
                },
                {
                  title: 'Transaction history',
                  desc: 'Every simulated bet, deposit approval, and wallet adjustment writes a traceable ledger row.',
                  icon: FileText,
                },
                {
                  title: 'Operational transparency',
                  desc: 'Synchronized activity logs record actions across agents and administrators.',
                  icon: Eye,
                },
                {
                  title: 'Secure account workflows',
                  desc: 'Confirmation steps and duplicate-approval guards protect simulated balance integrity.',
                  icon: Lock,
                },
                {
                  title: 'Responsible betting controls',
                  desc: 'Demonstrates stake limit configurations, cooling-off periods, and self-exclusion toggles.',
                  icon: HeartHandshake,
                },
              ].map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="rounded-card border border-warm-border bg-ivory/45 p-5"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-btn bg-forest-light text-forest">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="mt-4 font-heading text-base font-semibold text-charcoal">
                      {feat.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-grey">{feat.desc}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </section>

      {/* 10. FINAL CTA */}
      <section className="bg-forest py-16 text-ivory">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-champagne">
              Interactive Demonstration
            </p>
            <h2 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl">
              Your Game. Your Experience.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ivory/80 sm:text-base">
              Discover a more organized, intuitive and connected sports betting experience.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Button variant="champagne" size="lg" onClick={() => navigate('/sports')}>
                Explore the Platform
              </Button>
              <Button variant="outline-light" size="lg" onClick={() => navigate('/demo-access')}>
                Access Demo
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 11. CONTACT SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-grey">
                Client Presentation Inquiries
              </p>
              <h2 className="font-heading text-3xl font-semibold text-charcoal">
                Discuss This Product Architecture
              </h2>
              <p className="text-sm leading-relaxed text-muted-grey">
                Have questions about how AUREL&apos;s customer sportsbook, agent workflow, or
                administrator control center could be tailored? Send a demo inquiry below.
              </p>

              <div className="space-y-3 pt-2 text-sm">
                <div className="flex items-center gap-3 rounded-card border border-warm-border bg-soft-white p-3.5">
                  <Mail className="h-4 w-4 text-forest shrink-0" />
                  <div>
                    <p className="text-xs text-muted-grey">Demo Concierge Email (Placeholder)</p>
                    <p className="font-medium text-charcoal">concierge@aurel-demo.example</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-card border border-warm-border bg-soft-white p-3.5">
                  <Clock className="h-4 w-4 text-forest shrink-0" />
                  <div>
                    <p className="text-xs text-muted-grey">Simulated Support Availability</p>
                    <p className="font-medium text-charcoal">Mon–Sun · 08:00 – 22:00 UTC</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit(onContactSubmit)}
                className="rounded-card-lg border border-warm-border bg-soft-white p-6 space-y-4 shadow-subtle"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-charcoal">
                      Full Name <span className="text-error">*</span>
                    </label>
                    <input
                      {...register('name')}
                      placeholder="Alex Mercer"
                      className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-error">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-charcoal">
                      Email Address <span className="text-error">*</span>
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="partner@company.example"
                      className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-error">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-charcoal">
                    Organization (Optional)
                  </label>
                  <input
                    {...register('organization')}
                    placeholder="Sports Entertainment Group"
                    className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-charcoal">
                    Message <span className="text-error">*</span>
                  </label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder="Tell us which aspect of the customer, agent, or admin portal you would like to explore..."
                    className="w-full rounded-btn border border-warm-border bg-ivory/40 p-3.5 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-error">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <p className="text-[11px] text-muted-grey">
                    Frontend validation demonstration only.
                  </p>
                  <Button type="submit" variant="primary" disabled={isSubmitting}>
                    <Send className="h-4 w-4" />
                    Send Demo Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Reveal>
      </section>

      <PublicFooter />
    </div>
  );
};
