import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, ShieldCheck, ArrowRight, RotateCcw, Check } from 'lucide-react';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { Button } from '@/components/common/Button';
import { ConfirmationDialog } from '@/components/common/Modal';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency } from '@/utils/formatters';

export const DemoAccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [resetOpen, setResetOpen] = React.useState(false);

  const setActiveRole = useAurelStore((s) => s.setActiveRole);
  const customers = useAurelStore((s) => s.customers);
  const agents = useAurelStore((s) => s.agents);
  const admin = useAurelStore((s) => s.admin);
  const currency = useAurelStore((s) => s.settings.currency);
  const resetDemoData = useAurelStore((s) => s.resetDemoData);
  const addToast = useAurelStore((s) => s.addToast);

  const alex = customers.find((c) => c.id === 'CUS-1001') || customers[0];
  const michael = agents.find((a) => a.id === 'AGT-101') || agents[0];

  const roles = [
    {
      key: 'customer' as const,
      title: 'Customer Account',
      identity: `${alex.name} (${alex.id})`,
      metric: `Demo Balance: ${formatCurrency(alex.walletBalance, currency)}`,
      description:
        'Explore live & upcoming sportsbook markets, add selections to the interactive bet slip, place simulated wagers, and submit internal deposit requests.',
      highlights: [
        'Two-column sportsbook & real-time bet slip math',
        'Internal deposit request workflow',
        'Full transaction ledger & responsible controls',
      ],
      icon: User,
      path: '/customer',
    },
    {
      key: 'agent' as const,
      title: 'Agent Account',
      identity: `${michael.name} (${michael.id})`,
      metric: `Agent Wallet: ${formatCurrency(michael.walletBalance, currency)}`,
      description:
        'Operate an agent desk: onboard new demo customers, review and approve/reject pending deposit requests, distribute demo credits, and monitor commissions.',
      highlights: [
        'Customer roster scoped strictly to assigned accounts',
        'Deposit approval & rejection with confirmation guards',
        'Illustrative commission analytics & wallet transfers',
      ],
      icon: Briefcase,
      path: '/agent',
    },
    {
      key: 'admin' as const,
      title: 'Super Administrator Account',
      identity: `${admin.name} (${admin.id})`,
      metric: `Treasury: ${formatCurrency(admin.platformTreasuryBalance, currency)}`,
      description:
        'Oversee the entire platform ecosystem: manage users, agents, hierarchy mapping, central treasury allocations, sports odds, commission rates, and CSV reports.',
      highlights: [
        'Platform KPIs & 5 interactive analytics charts',
        'Agent hierarchy & global deposit governance',
        'Live sports & odds management synced across portals',
      ],
      icon: ShieldCheck,
      path: '/admin',
    },
  ];

  const handleEnter = (role: 'customer' | 'agent' | 'admin', path: string, title: string) => {
    setActiveRole(role);
    addToast('info', `Entered ${title}`, 'All changes stay synchronized across roles.');
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <PublicHeader />

      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-champagne/40 bg-champagne-soft/60 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest">
              Interactive Product Demonstration
            </span>
            <h1 className="mt-4 font-heading text-3xl font-semibold text-charcoal sm:text-4xl">
              Select a Demo Perspective
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-muted-grey sm:text-base">
              Experience how AUREL connects customers, assigned agents, and platform
              administrators inside one synchronized local state environment.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {roles.map((r) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.key}
                  className="flex flex-col justify-between rounded-card-lg border border-warm-border bg-soft-white p-6 shadow-subtle transition-all duration-200 hover:-translate-y-0.5 hover:border-sage hover:shadow-card"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-card bg-forest text-champagne">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-ivory px-3 py-1 text-[11px] font-medium text-charcoal tabular-nums border border-warm-border">
                        {r.metric}
                      </span>
                    </div>

                    <h2 className="mt-5 font-heading text-xl font-semibold text-charcoal">
                      {r.title}
                    </h2>
                    <p className="mt-0.5 text-xs font-medium text-forest">{r.identity}</p>
                    <p className="mt-3 text-sm leading-relaxed text-muted-grey">
                      {r.description}
                    </p>

                    <ul className="mt-5 space-y-2 border-t border-warm-border pt-4">
                      {r.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-xs text-charcoal">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-2">
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => handleEnter(r.key, r.path, r.title)}
                    >
                      Enter Demo
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-card border border-warm-border bg-soft-white p-5 sm:flex-row">
            <div className="text-xs text-muted-grey">
              <strong className="text-charcoal">Synchronized Demo Persistence:</strong> Actions you
              take in one role persist across page refreshes and reflect immediately in the other
              portals.
            </div>
            <Button variant="secondary" size="sm" onClick={() => setResetOpen(true)}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Demo Data
            </Button>
          </div>
        </div>
      </main>

      <PublicFooter />

      <ConfirmationDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemoData();
          addToast('success', 'Demo Data Restored', 'All simulated accounts have been reset.');
        }}
        title="Reset Demo Dataset?"
        description="Restore all demo balances, deposit requests, bets, sports events, and logs to their initial baseline."
        confirmLabel="Reset Data"
        tone="warning"
      />
    </div>
  );
};

