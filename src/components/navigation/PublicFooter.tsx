import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUp, Globe, ShieldCheck } from 'lucide-react';
import { AurelLogo } from '@/components/common/AurelLogo';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { CustomSelect } from '@/components/common/CustomSelect';
import { useAurelStore } from '@/store/useAurelStore';
import { PlatformSettings } from '@/types';

type LegalDocKey = 'terms' | 'privacy' | 'cookies' | 'disclaimer' | null;

const LEGAL_CONTENT: Record<
  Exclude<LegalDocKey, null>,
  { title: string; body: string[] }
> = {
  terms: {
    title: 'Terms & Conditions (Demo Specification)',
    body: [
      'AUREL is presented strictly as an interactive frontend product prototype to demonstrate interface architecture, customer sportsbook workflows, internal deposit review operations, and administrative governance.',
      'No real-money wagers, card transactions, bank transfers, or live settlement obligations occur within this demonstration environment.',
    ],
  },
  privacy: {
    title: 'Privacy Policy (Simulated Data Notice)',
    body: [
      'All personal names, account IDs, emails, phone numbers, and ledger records displayed in AUREL are entirely fictional demonstration data.',
      'Changes you make during exploration are stored solely inside your local browser storage and can be restored anytime via Reset Demo Data.',
    ],
  },
  cookies: {
    title: 'Cookie & Local Persistence Policy',
    body: [
      'This prototype uses local browser storage (localStorage) exclusively to preserve your simulated balances, bet slip selections, deposit requests, and settings across page reloads.',
      'No third-party advertising cookies or cross-site tracking technologies are included.',
    ],
  },
  disclaimer: {
    title: 'Product Prototype Disclaimer',
    body: [
      'Interactive product prototype. All users, events, odds, balances and transactions are simulated.',
      'No certifications, regulatory licenses, or live odds feeds are active or implied by this demonstration.',
    ],
  },
};

export const PublicFooter: React.FC = () => {
  const navigate = useNavigate();
  const [legalDoc, setLegalDoc] = useState<LegalDocKey>(null);

  const settings = useAurelStore((s) => s.settings);
  const updateSettings = useAurelStore((s) => s.updateSettings);
  const setActiveRole = useAurelStore((s) => s.setActiveRole);
  const addToast = useAurelStore((s) => s.addToast);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const enterPortal = (role: 'customer' | 'agent', path: string) => {
    setActiveRole(role);
    navigate(path);
  };

  return (
    <footer className="border-t border-warm-border bg-forest-dark text-ivory">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 */}
          <div className="space-y-4">
            <AurelLogo variant="light" />
            <p className="text-xs leading-relaxed text-sage-muted">
              AUREL is an integrated sports betting, internal wallet, and multi-tier agent
              management demonstration built with financial-grade clarity.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              {['LinkedIn', 'X / Twitter', 'Instagram'].map((network) => (
                <button
                  key={network}
                  type="button"
                  onClick={() =>
                    addToast('info', `${network} Placeholder`, 'Social channel links are simulated in this product demo.')
                  }
                  className="rounded-btn border border-soft-white/15 bg-soft-white/5 px-2.5 py-1.5 text-[11px] font-medium text-ivory/80 transition-colors hover:border-champagne/60 hover:text-champagne"
                >
                  {network}
                </button>
              ))}
            </div>
          </div>

          {/* Column 2 — Platform */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-champagne">
              Platform
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ivory/80">
              <li>
                <Link to="/sports" className="hover:text-champagne transition-colors">
                  Sports
                </Link>
              </li>
              <li>
                <Link to="/sports?status=live" className="hover:text-champagne transition-colors">
                  Live Events
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => enterPortal('customer', '/customer')}
                  className="hover:text-champagne transition-colors"
                >
                  Account Management
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => enterPortal('agent', '/agent')}
                  className="hover:text-champagne transition-colors"
                >
                  Agent Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3 — Company */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-champagne">
              Company
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ivory/80">
              <li>
                <Link to="/how-it-works" className="hover:text-champagne transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-champagne transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-champagne transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => enterPortal('customer', '/customer/responsible-betting')}
                  className="hover:text-champagne transition-colors"
                >
                  Responsible Betting
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4 — Legal */}
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-champagne">
              Legal &amp; Scope
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ivory/80">
              <li>
                <button
                  type="button"
                  onClick={() => setLegalDoc('terms')}
                  className="hover:text-champagne transition-colors"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalDoc('privacy')}
                  className="hover:text-champagne transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalDoc('cookies')}
                  className="hover:text-champagne transition-colors"
                >
                  Cookie Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setLegalDoc('disclaimer')}
                  className="hover:text-champagne transition-colors"
                >
                  Demo Disclaimer
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-soft-white/10 pt-7 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-xs text-sage-muted">
            <ShieldCheck className="h-4 w-4 text-champagne" />
            <span>© {new Date().getFullYear()} AUREL Platform Prototype. All simulated rights reserved.</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-ivory/80">
              <Globe className="h-3.5 w-3.5 text-champagne" />
              <div className="w-28">
                <CustomSelect
                  value={settings.language}
                  onChange={(val) => {
                    updateSettings({ language: val as PlatformSettings['language'] });
                    addToast('info', `Language set to ${val}`, 'Demo interface locale preference updated.');
                  }}
                  options={[
                    { value: 'EN', label: 'English' },
                    { value: 'FR', label: 'Français' },
                    { value: 'ES', label: 'Español' },
                    { value: 'DE', label: 'Deutsch' },
                  ]}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex h-11 items-center gap-1.5 rounded-btn border border-soft-white/15 bg-soft-white/5 px-3.5 text-xs font-medium text-ivory transition-colors hover:border-champagne/60 hover:text-champagne"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              Back to top
            </button>
          </div>
        </div>
      </div>

      <DisclaimerBanner dark />

      <Modal
        open={legalDoc !== null}
        onClose={() => setLegalDoc(null)}
        title={legalDoc ? LEGAL_CONTENT[legalDoc].title : ''}
        size="md"
        footer={
          <Button variant="primary" onClick={() => setLegalDoc(null)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 text-sm leading-relaxed text-muted-grey">
          {legalDoc &&
            LEGAL_CONTENT[legalDoc].body.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </Modal>
    </footer>
  );
};

