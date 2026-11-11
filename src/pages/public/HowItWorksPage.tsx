import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Layers, SlidersHorizontal, Sparkles, ShieldCheck } from 'lucide-react';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const HowItWorksPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <PublicHeader />

      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Intro */}
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-grey">
              Ecosystem Architecture
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-charcoal sm:text-4xl">
              How AUREL Connects Every Tier of the Platform
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-grey">
              From public match discovery to customer wagering, agent-assisted internal deposit
              approvals, and super administrator oversight, every action updates one unified ledger.
            </p>
          </div>

          {/* 3 Steps */}
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Explore',
                desc: 'Find your favorite sports and upcoming matches across Football, Basketball, Tennis, Cricket, Volleyball, and Hockey.',
                icon: Compass,
              },
              {
                num: '02',
                title: 'Select',
                desc: 'Explore available markets and add single or multiple selections to your live interactive bet slip.',
                icon: SlidersHorizontal,
              },
              {
                num: '03',
                title: 'Manage',
                desc: 'Submit simulated deposit requests for agent review, track settled wagers, and inspect full balance histories.',
                icon: Layers,
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="rounded-card-lg border border-warm-border bg-soft-white p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xs font-semibold tracking-widest text-champagne-dark">
                      {step.num}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-forest-light text-forest">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h2 className="mt-4 font-heading text-xl font-semibold text-charcoal">
                    {step.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-grey">{step.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Promotions Preview Section */}
          <section id="promotions" className="scroll-mt-24 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-warm-border pb-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-grey">
                  Illustrative Engagement
                </p>
                <h2 className="mt-1 font-heading text-2xl font-semibold text-charcoal">
                  Simulated Demo Promotions
                </h2>
              </div>
              <Badge tone="champagne">Demo Showcase Only</Badge>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {[
                {
                  title: 'Welcome Demo Allocation',
                  tag: 'New Demo Accounts',
                  desc: 'New simulated accounts created via the onboarding flow receive $500.00 in demo credits for testing bet slips.',
                },
                {
                  title: 'Accumulator Market Preview',
                  tag: 'Multi-Selection Mode',
                  desc: 'Combine two or more selections in the interactive bet slip to preview combined decimal odds calculations.',
                },
                {
                  title: 'Agent-Assisted Reloads',
                  tag: 'Internal Workflow',
                  desc: 'Submit a manual or agent-assisted deposit request from the Customer Portal and approve it inside the Agent Portal.',
                },
              ].map((promo) => (
                <div
                  key={promo.title}
                  className="flex flex-col justify-between rounded-card border border-warm-border bg-soft-white p-6"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-forest">
                      <Sparkles className="h-4 w-4 text-champagne-dark" />
                      {promo.tag}
                    </div>
                    <h3 className="mt-3 font-heading text-lg font-semibold text-charcoal">
                      {promo.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-grey">{promo.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/demo-access')}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline"
                  >
                    Try in Demo Portal
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="flex flex-col items-start justify-between gap-6 rounded-card-lg bg-forest p-8 text-ivory sm:flex-row sm:items-center">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-champagne">
                <ShieldCheck className="h-4 w-4" />
                Zero Real-Money Wagering
              </div>
              <h3 className="font-heading text-2xl font-semibold">
                Ready to experience all three portals?
              </h3>
            </div>
            <Button variant="champagne" size="lg" onClick={() => navigate('/demo-access')}>
              Enter Interactive Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

