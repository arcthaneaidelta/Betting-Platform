import React, { useState } from 'react';
import { ShieldCheck, Clock, AlertTriangle, LifeBuoy, CheckCircle2 } from 'lucide-react';
import { CustomerLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { ConfirmationDialog } from '@/components/common/Modal';
import { CustomSelect } from '@/components/common/CustomSelect';
import { useAurelStore } from '@/store/useAurelStore';

export const CustomerResponsibleBetting: React.FC = () => {
  const customers = useAurelStore((s) => s.customers);
  const activeCustomerId = useAurelStore((s) => s.activeCustomerId);
  const updateCustomerResponsibleSettings = useAurelStore(
    (s) => s.updateCustomerResponsibleSettings
  );
  const addToast = useAurelStore((s) => s.addToast);

  const customer = customers.find((c) => c.id === activeCustomerId) || customers[0];

  const [dailyStakeLimit, setDailyStakeLimit] = useState(
    String(customer.responsibleSettings.dailyStakeLimit)
  );
  const [weeklyDepositLimit, setWeeklyDepositLimit] = useState(
    String(customer.responsibleSettings.weeklyDepositLimit)
  );
  const [coolingPeriod, setCoolingPeriod] = useState('none');
  const [selfExcludeConfirm, setSelfExcludeConfirm] = useState(false);

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    const daily = Math.max(50, Number(dailyStakeLimit) || 500);
    const weekly = Math.max(100, Number(weeklyDepositLimit) || 2000);
    updateCustomerResponsibleSettings(customer.id, {
      dailyStakeLimit: daily,
      weeklyDepositLimit: weekly,
    });
    addToast(
      'success',
      'Simulated Limits Updated',
      `Daily demo stake limit set to $${daily.toFixed(2)}.`
    );
  };

  const handleApplyCoolingOff = () => {
    if (coolingPeriod === 'none') {
      updateCustomerResponsibleSettings(customer.id, { coolingOffUntil: undefined });
      addToast('info', 'Cooling-off Cleared', 'Simulated cooling-off period removed.');
      return;
    }
    const days = Number(coolingPeriod);
    const until = new Date(Date.now() + days * 86400000).toLocaleDateString();
    updateCustomerResponsibleSettings(customer.id, { coolingOffUntil: until });
    addToast('warning', 'Simulated Cooling-Off Applied', `Demo cooling-off active until ${until}.`);
  };

  return (
    <CustomerLayout title="Responsible Betting (Demo)">
      <div className="max-w-4xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Responsible Betting Controls
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Simulated account safeguards demonstrating stake limits, cooling-off periods, and
              self-exclusion toggles.
            </p>
          </div>
          <Badge tone="champagne">Simulated Controls</Badge>
        </div>

        {/* Session Summary */}
        <div className="rounded-card border border-warm-border bg-soft-white p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-forest-light text-forest">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal">Active Demo Session</p>
              <p className="text-xs text-muted-grey">
                Current simulated daily stake limit: $
                {customer.responsibleSettings.dailyStakeLimit.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-success">
            <CheckCircle2 className="h-4 w-4" />
            Session reminders enabled
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Limit Config */}
          <form
            onSubmit={handleSaveLimits}
            className="rounded-card border border-warm-border bg-soft-white p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-forest" />
              <h2 className="font-heading text-base font-semibold text-charcoal">
                Spending &amp; Stake Limits (Simulated)
              </h2>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Daily Demo Stake Limit (USD)
              </label>
              <input
                type="number"
                min={50}
                value={dailyStakeLimit}
                onChange={(e) => setDailyStakeLimit(e.target.value)}
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm font-semibold tabular-nums focus:border-forest focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-muted-grey">
                Enforced directly inside the interactive Bet Slip demo.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Weekly Demo Deposit Cap (USD)
              </label>
              <input
                type="number"
                min={100}
                value={weeklyDepositLimit}
                onChange={(e) => setWeeklyDepositLimit(e.target.value)}
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm font-semibold tabular-nums focus:border-forest focus:outline-none"
              />
            </div>

            <Button type="submit" variant="primary" size="sm">
              Save Demo Limits
            </Button>
          </form>

          {/* Cooling-off & Self-exclusion */}
          <div className="space-y-5">
            <div className="rounded-card border border-warm-border bg-soft-white p-6 space-y-4">
              <h2 className="font-heading text-base font-semibold text-charcoal">
                Cooling-Off Period (Demo)
              </h2>
              <CustomSelect
                value={coolingPeriod}
                onChange={setCoolingPeriod}
                options={[
                  { value: 'none', label: 'No active cooling-off' },
                  { value: '1', label: '24 Hours (Simulated)' },
                  { value: '7', label: '7 Days (Simulated)' },
                  { value: '30', label: '30 Days (Simulated)' },
                ]}
              />
              {customer.responsibleSettings.coolingOffUntil && (
                <p className="text-xs text-warning">
                  Active until {customer.responsibleSettings.coolingOffUntil}
                </p>
              )}
              <Button variant="secondary" size="sm" onClick={handleApplyCoolingOff}>
                Apply Cooling-Off Demo
              </Button>
            </div>

            <div className="rounded-card border border-error/25 bg-soft-white p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-error">
                  <AlertTriangle className="h-4 w-4" />
                  <h2 className="font-heading text-base font-semibold">
                    Self-Exclusion Demonstration
                  </h2>
                </div>
                <Badge tone={customer.responsibleSettings.selfExcluded ? 'error' : 'neutral'}>
                  {customer.responsibleSettings.selfExcluded ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs leading-relaxed text-muted-grey">
                Enabling self-exclusion blocks simulated bet placements on this account until toggled
                back off in this demo control.
              </p>
              <Button
                variant={customer.responsibleSettings.selfExcluded ? 'secondary' : 'danger'}
                size="sm"
                onClick={() => {
                  if (customer.responsibleSettings.selfExcluded) {
                    updateCustomerResponsibleSettings(customer.id, { selfExcluded: false });
                    addToast('info', 'Demo Self-Exclusion Lifted', 'Simulated betting re-enabled.');
                  } else {
                    setSelfExcludeConfirm(true);
                  }
                }}
              >
                {customer.responsibleSettings.selfExcluded
                  ? 'Deactivate Demo Self-Exclusion'
                  : 'Activate Demo Self-Exclusion'}
              </Button>
            </div>
          </div>
        </div>

        {/* Help Resources */}
        <div className="rounded-card border border-warm-border bg-ivory/70 p-5 flex items-start gap-3.5">
          <LifeBuoy className="h-5 w-5 text-forest shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-muted-grey">
            <p className="font-semibold text-charcoal">Support &amp; Guidance Resources (Demo)</p>
            <p className="mt-1">
              In a production deployment, this section links to independent support organizations,
              account advisors, and session monitoring tools. All features on this page are strictly
              simulated for client presentation.
            </p>
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={selfExcludeConfirm}
        onClose={() => setSelfExcludeConfirm(false)}
        onConfirm={() => {
          updateCustomerResponsibleSettings(customer.id, { selfExcluded: true });
          addToast(
            'warning',
            'Demo Self-Exclusion Active',
            'Bet slip placements are now blocked for Alex Mercer until deactivated.'
          );
        }}
        title="Activate Demo Self-Exclusion?"
        description="This simulated safeguard immediately blocks placing demo bets from Alex's account."
        confirmLabel="Confirm Demo Self-Exclusion"
        tone="danger"
      />
    </CustomerLayout>
  );
};

