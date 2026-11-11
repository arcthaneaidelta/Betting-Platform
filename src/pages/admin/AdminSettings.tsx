import React, { useState } from 'react';
import { Save, RotateCcw, Sliders } from 'lucide-react';
import { AdminLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { CustomSelect } from '@/components/common/CustomSelect';
import { ConfirmationDialog } from '@/components/common/Modal';
import { useAurelStore } from '@/store/useAurelStore';
import { CurrencyCode, PlatformSettings } from '@/types';

export const AdminSettings: React.FC = () => {
  const settings = useAurelStore((s) => s.settings);
  const updateSettings = useAurelStore((s) => s.updateSettings);
  const resetDemoData = useAurelStore((s) => s.resetDemoData);
  const addToast = useAurelStore((s) => s.addToast);

  const [platformName, setPlatformName] = useState(settings.platformName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [currency, setCurrency] = useState<CurrencyCode>(settings.currency);
  const [language, setLanguage] = useState<PlatformSettings['language']>(settings.language);
  const [maxDemoBetStake, setMaxDemoBetStake] = useState(String(settings.maxDemoBetStake));
  const [defaultDailyLimit, setDefaultDailyLimit] = useState(String(settings.defaultDailyLimit));
  const [defaultCommissionRate, setDefaultCommissionRate] = useState(
    String(settings.defaultCommissionRate)
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);
  const [resetOpen, setResetOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      platformName: platformName.trim() || 'AUREL',
      tagline: tagline.trim() || 'THE GAME, REIMAGINED.',
      currency,
      language,
      maxDemoBetStake: Math.max(100, Number(maxDemoBetStake) || 5000),
      defaultDailyLimit: Math.max(100, Number(defaultDailyLimit) || 1000),
      defaultCommissionRate: Math.max(0.5, Number(defaultCommissionRate) || 8),
      notificationsEnabled,
    });
    addToast('success', 'Platform Settings Saved', `Display currency: ${currency}, Language: ${language}.`);
  };

  return (
    <AdminLayout title="Platform Settings">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Global Platform Configuration
          </h1>
          <p className="mt-1 text-sm text-muted-grey">
            Control simulated branding labels, display currency conversion, responsible defaults,
            and demo reset options.
          </p>
        </div>

        <form
          onSubmit={handleSave}
          className="rounded-card-lg border border-warm-border bg-soft-white p-6 space-y-6"
        >
          <div className="flex items-center gap-2 text-sm font-semibold text-charcoal border-b border-warm-border pb-3">
            <Sliders className="h-4 w-4 text-forest" />
            Branding &amp; Localization
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Platform Wordmark
              </label>
              <input
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm focus:border-forest focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Brand Tagline
              </label>
              <input
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm focus:border-forest focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <CustomSelect
              label="Simulated Display Currency"
              value={currency}
              onChange={(val) => setCurrency(val as CurrencyCode)}
              options={[
                { value: 'USD', label: 'USD ($) — US Dollar' },
                { value: 'EUR', label: 'EUR (€) — Euro' },
                { value: 'GBP', label: 'GBP (£) — British Pound' },
              ]}
            />
            <CustomSelect
              label="Default Language"
              value={language}
              onChange={(val) => setLanguage(val as PlatformSettings['language'])}
              options={[
                { value: 'EN', label: 'English' },
                { value: 'FR', label: 'Français' },
                { value: 'ES', label: 'Español' },
                { value: 'DE', label: 'Deutsch' },
              ]}
            />
          </div>

          <div className="border-t border-warm-border pt-5">
            <p className="mb-4 text-sm font-semibold text-charcoal">
              Responsible Limits &amp; Commission Defaults
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-charcoal">
                  Max Demo Bet Stake
                </label>
                <input
                  type="number"
                  value={maxDemoBetStake}
                  onChange={(e) => setMaxDemoBetStake(e.target.value)}
                  className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm tabular-nums focus:border-forest focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-charcoal">
                  Default Daily Stake Limit
                </label>
                <input
                  type="number"
                  value={defaultDailyLimit}
                  onChange={(e) => setDefaultDailyLimit(e.target.value)}
                  className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm tabular-nums focus:border-forest focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-charcoal">
                  Default Commission (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={defaultCommissionRate}
                  onChange={(e) => setDefaultCommissionRate(e.target.value)}
                  className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm tabular-nums focus:border-forest focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-warm-border pt-4">
            <div>
              <p className="text-sm font-medium text-charcoal">Demo Toast Notifications</p>
              <p className="text-xs text-muted-grey">
                Show interactive event feedback across customer, agent, and admin actions.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notificationsEnabled}
              onClick={() => setNotificationsEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                notificationsEnabled ? 'bg-forest' : 'bg-warm-border'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-soft-white shadow transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-warm-border pt-5">
            <Button type="button" variant="danger" size="sm" onClick={() => setResetOpen(true)}>
              <RotateCcw className="h-4 w-4" />
              Reset All Demo Data
            </Button>

            <Button type="submit" variant="primary">
              <Save className="h-4 w-4" />
              Save Platform Settings
            </Button>
          </div>
        </form>
      </div>

      <ConfirmationDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={() => {
          resetDemoData();
          addToast('success', 'Demo Data Restored', 'All simulated platform state reset.');
        }}
        title="Reset Entire Demo State?"
        description="Restores initial customers, agents, balances, bets, deposit requests, and logs."
        confirmLabel="Confirm Reset"
        tone="danger"
      />
    </AdminLayout>
  );
};

