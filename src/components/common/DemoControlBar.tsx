import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  User,
  Briefcase,
  ShieldCheck,
  Globe,
  RotateCcw,
  Info,
  Check,
} from 'lucide-react';
import { useAurelStore } from '@/store/useAurelStore';
import { Role } from '@/types';
import { ConfirmationDialog, Modal } from './Modal';
import { Button } from './Button';

interface DemoControlBarProps {
  lightText?: boolean;
}

export const DemoControlBar: React.FC<DemoControlBarProps> = ({ lightText = false }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeRole = useAurelStore((s) => s.activeRole);
  const setActiveRole = useAurelStore((s) => s.setActiveRole);
  const resetDemoData = useAurelStore((s) => s.resetDemoData);
  const addToast = useAurelStore((s) => s.addToast);
  const demoLimitationsModalOpen = useAurelStore((s) => s.demoLimitationsModalOpen);
  const setDemoLimitationsModalOpen = useAurelStore((s) => s.setDemoLimitationsModalOpen);

  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  const roleLabels: Record<Role, string> = {
    public: 'Public Website',
    customer: 'Customer: Alex',
    agent: 'Agent: Michael',
    admin: 'Super Admin',
  };

  const switchRole = (role: Role, path: string) => {
    setActiveRole(role);
    setOpen(false);
    navigate(path);
    addToast('info', `Switched to ${roleLabels[role]}`, 'Viewing interactive simulated environment.');
  };

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors ${
            lightText
              ? 'border-soft-white/25 bg-soft-white/10 text-ivory hover:bg-soft-white/20'
              : 'border-warm-border bg-ivory text-charcoal hover:border-sage hover:bg-soft-white'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-champagne" />
          <span className="hidden sm:inline">Interactive Demo</span>
          <span className="opacity-60 hidden md:inline">·</span>
          <span className="hidden md:inline font-semibold">{roleLabels[activeRole]}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-card-lg border border-warm-border bg-soft-white shadow-elevated">
            <div className="border-b border-warm-border bg-ivory/60 px-4 py-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-grey">
                Demo Environment Switcher
              </p>
              <p className="mt-0.5 text-xs text-charcoal">
                Switch perspectives with synchronized local state.
              </p>
            </div>

            <div className="p-2 space-y-1">
              <button
                type="button"
                onClick={() => switchRole('customer', '/customer')}
                className={`flex w-full items-center justify-between rounded-btn px-3 py-2.5 text-left text-xs transition-colors ${
                  activeRole === 'customer'
                    ? 'bg-forest-light text-forest font-medium'
                    : 'text-charcoal hover:bg-ivory'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <User className="h-4 w-4 text-forest" />
                  <span>
                    <span className="block font-medium">Customer Portal</span>
                    <span className="text-[11px] text-muted-grey">Alex Mercer (CUS-1001)</span>
                  </span>
                </span>
                {activeRole === 'customer' && <Check className="h-3.5 w-3.5 text-forest" />}
              </button>

              <button
                type="button"
                onClick={() => switchRole('agent', '/agent')}
                className={`flex w-full items-center justify-between rounded-btn px-3 py-2.5 text-left text-xs transition-colors ${
                  activeRole === 'agent'
                    ? 'bg-forest-light text-forest font-medium'
                    : 'text-charcoal hover:bg-ivory'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Briefcase className="h-4 w-4 text-forest" />
                  <span>
                    <span className="block font-medium">Agent Portal</span>
                    <span className="text-[11px] text-muted-grey">Michael Vance (AGT-101)</span>
                  </span>
                </span>
                {activeRole === 'agent' && <Check className="h-3.5 w-3.5 text-forest" />}
              </button>

              <button
                type="button"
                onClick={() => switchRole('admin', '/admin')}
                className={`flex w-full items-center justify-between rounded-btn px-3 py-2.5 text-left text-xs transition-colors ${
                  activeRole === 'admin'
                    ? 'bg-forest-light text-forest font-medium'
                    : 'text-charcoal hover:bg-ivory'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-forest" />
                  <span>
                    <span className="block font-medium">Super Administrator</span>
                    <span className="text-[11px] text-muted-grey">Elena Rostova (ADM-001)</span>
                  </span>
                </span>
                {activeRole === 'admin' && <Check className="h-3.5 w-3.5 text-forest" />}
              </button>
            </div>

            <div className="border-t border-warm-border p-2 space-y-1">
              <button
                type="button"
                onClick={() => switchRole('public', '/')}
                className="flex w-full items-center gap-2.5 rounded-btn px-3 py-2 text-xs text-charcoal transition-colors hover:bg-ivory"
              >
                <Globe className="h-3.5 w-3.5 text-muted-grey" />
                Return to Public Website
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setDemoLimitationsModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-btn px-3 py-2 text-xs text-charcoal transition-colors hover:bg-ivory"
              >
                <Info className="h-3.5 w-3.5 text-muted-grey" />
                View Demo Scope &amp; Rules
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setResetConfirmOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-btn px-3 py-2 text-xs text-error transition-colors hover:bg-error-bg/70"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Demo Data
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={() => {
          resetDemoData();
          addToast(
            'success',
            'Demo data restored',
            'All simulated balances, bets, deposits, and ledger entries have been reset.'
          );
        }}
        title="Reset Simulated Demo Data?"
        description="This will restore all demo customer balances, agent allocations, deposit requests, bets, sports events, and audit logs back to the initial demonstration baseline."
        confirmLabel="Reset Demo Data"
        tone="warning"
      />

      <Modal
        open={demoLimitationsModalOpen}
        onClose={() => setDemoLimitationsModalOpen(false)}
        title="Interactive Prototype Scope & Simulation Notes"
        subtitle="AUREL Presentation Architecture"
        size="md"
        footer={
          <Button variant="primary" onClick={() => setDemoLimitationsModalOpen(false)}>
            Understood
          </Button>
        }
      >
        <div className="space-y-4 text-sm text-charcoal">
          <div className="rounded-card border border-champagne/40 bg-champagne-soft/60 p-4 text-xs leading-relaxed text-charcoal">
            <strong>Presentation-Only Prototype:</strong> AUREL demonstrates complete product
            workflows—public sportsbook discovery, customer wagering, internal deposit requests,
            agent operations, and super administrator governance—entirely through local client
            state and <code className="rounded bg-soft-white px-1 py-0.5">localStorage</code>{' '}
            persistence.
          </div>

          <ul className="space-y-2.5 text-xs leading-relaxed text-muted-grey">
            <li className="flex gap-2">
              <span className="font-semibold text-forest">01.</span>
              <span>
                <strong>No Real-Money Transactions:</strong> All wallet balances, deposits, payouts,
                and agent commissions are simulated demo figures. No payment gateways or banking
                rails are connected.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-forest">02.</span>
              <span>
                <strong>Cross-Portal Consistency:</strong> Submitting a deposit as Alex, approving it
                as Michael (or Super Admin Elena), or creating a new sports fixture updates every
                portal ledger, analytics chart, and dashboard immediately.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-forest">03.</span>
              <span>
                <strong>Simulated Sports Feeds:</strong> All teams, competitions, live scores, and
                decimal odds are fictional demo records controllable by the Super Administrator.
              </span>
            </li>
          </ul>
        </div>
      </Modal>
    </>
  );
};

