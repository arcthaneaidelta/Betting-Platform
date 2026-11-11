import React, { useState } from 'react';
import { Percent, Save, Calculator } from 'lucide-react';
import { AdminLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

export const AdminCommissions: React.FC = () => {
  const settings = useAurelStore((s) => s.settings);
  const agents = useAurelStore((s) => s.agents);
  const commissions = useAurelStore((s) => s.commissions);
  const updateDefaultCommissionRate = useAurelStore((s) => s.updateDefaultCommissionRate);
  const updateAgentCommissionRate = useAurelStore((s) => s.updateAgentCommissionRate);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const [defaultRate, setDefaultRate] = useState(String(settings.defaultCommissionRate));
  const [agentRates, setAgentRates] = useState<Record<string, string>>(
    Object.fromEntries(agents.map((a) => [a.id, String(a.commissionRate)]))
  );
  const [sampleBase, setSampleBase] = useState('1000');

  const handleSaveDefault = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = Math.max(0.5, Math.min(35, Number(defaultRate) || 8));
    updateDefaultCommissionRate(rate);
    addToast(
      'success',
      'Default Commission Rate Saved',
      `Future fallback commissions calculated at ${rate.toFixed(1)}%.`
    );
  };

  const handleSaveAgentRate = (agentId: string, name: string) => {
    const rate = Math.max(0.5, Math.min(35, Number(agentRates[agentId]) || 8));
    updateAgentCommissionRate(agentId, rate);
    addToast(
      'success',
      `Updated ${name}`,
      `Future simulated commissions for ${name} set to ${rate.toFixed(1)}%.`
    );
  };

  const calcBase = Number(sampleBase) || 0;
  const calcRate = Number(defaultRate) || settings.defaultCommissionRate;
  const calcOutput = (calcBase * calcRate) / 100;

  return (
    <AdminLayout title="Commission Settings">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Commission Configuration (Illustrative)
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Configure default and per-agent illustrative commission percentages. Changes affect
              all future simulated deposit approvals.
            </p>
          </div>
          <Badge tone="champagne">Simulated Model</Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Default Rate + Calculator */}
          <div className="lg:col-span-5 space-y-5">
            <form
              onSubmit={handleSaveDefault}
              className="rounded-card border border-warm-border bg-soft-white p-6 space-y-4"
            >
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-forest" />
                <h2 className="font-heading text-base font-semibold text-charcoal">
                  Default Platform Commission Rate
                </h2>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-charcoal">
                  Default Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="35"
                  value={defaultRate}
                  onChange={(e) => setDefaultRate(e.target.value)}
                  className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm font-semibold tabular-nums focus:border-forest focus:outline-none"
                />
              </div>
              <Button type="submit" variant="primary" size="sm">
                <Save className="h-4 w-4" />
                Save Default Rate
              </Button>
            </form>

            <div className="rounded-card border border-warm-border bg-forest p-6 text-ivory space-y-4">
              <div className="flex items-center gap-2 text-champagne text-xs font-semibold uppercase tracking-wider">
                <Calculator className="h-4 w-4" />
                Commission Calculation Example
              </div>
              <div>
                <label className="mb-1 block text-xs text-sage-muted">
                  Sample Approved Deposit ({currency})
                </label>
                <input
                  type="number"
                  value={sampleBase}
                  onChange={(e) => setSampleBase(e.target.value)}
                  className="h-10 w-full rounded-btn border border-soft-white/20 bg-soft-white/10 px-3 text-sm font-semibold text-ivory tabular-nums focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-between border-t border-soft-white/15 pt-3 text-sm">
                <span className="text-sage-muted">At {calcRate}% rate:</span>
                <span className="font-heading text-xl font-semibold text-champagne tabular-nums">
                  {formatCurrency(calcOutput, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Individual Agent Rates */}
          <div className="lg:col-span-7 rounded-card border border-warm-border bg-soft-white p-6 space-y-4">
            <h2 className="font-heading text-base font-semibold text-charcoal">
              Individual Agent Commission Rates
            </h2>
            <div className="divide-y divide-warm-border">
              {agents.map((ag) => (
                <div
                  key={ag.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-3.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{ag.name}</p>
                    <p className="text-xs text-muted-grey">
                      {ag.id} · {ag.region} · Earned:{' '}
                      {formatCurrency(ag.totalCommissionEarned, currency)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative w-24">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="35"
                        value={agentRates[ag.id] ?? String(ag.commissionRate)}
                        onChange={(e) =>
                          setAgentRates((prev) => ({ ...prev, [ag.id]: e.target.value }))
                        }
                        className="h-10 w-full rounded-btn border border-warm-border bg-ivory/40 px-3 pr-7 text-sm font-semibold tabular-nums focus:border-forest focus:outline-none"
                      />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-grey">
                        %
                      </span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSaveAgentRate(ag.id, ag.name)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commission History Table */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          <div className="border-b border-warm-border px-5 py-4">
            <h2 className="font-heading text-base font-semibold text-charcoal">
              Illustrative Commission Ledger
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                <tr>
                  <th className="px-4 py-3">Commission Ref</th>
                  <th className="px-4 py-3">Agent</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Activity Ref</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-border">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-ivory/40">
                    <td className="px-4 py-3.5">
                      <CopyIdButton value={c.reference} />
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium">{c.agentName}</td>
                    <td className="px-4 py-3.5 text-xs text-muted-grey">{c.customerName}</td>
                    <td className="px-4 py-3.5 font-mono text-xs">{c.activityReference}</td>
                    <td className="px-4 py-3.5 text-right text-xs tabular-nums">{c.rate}%</td>
                    <td className="px-4 py-3.5 text-right text-xs font-semibold text-success tabular-nums">
                      {formatCurrency(c.amount, currency)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-grey whitespace-nowrap">
                      {formatDateTime(c.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Badge tone={statusToBadgeTone(c.status)}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

