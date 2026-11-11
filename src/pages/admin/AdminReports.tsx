import React, { useMemo, useState } from 'react';
import { Download, FileBarChart2 } from 'lucide-react';
import { AdminLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { CustomSelect } from '@/components/common/CustomSelect';
import { useAurelStore } from '@/store/useAurelStore';
import { exportToCsv, formatCurrency, formatShortDate } from '@/utils/formatters';
import { clsx } from 'clsx';

type ReportKey =
  | 'users'
  | 'agents'
  | 'deposits'
  | 'wallets'
  | 'transactions'
  | 'betting'
  | 'commissions';

const REPORT_TABS: { key: ReportKey; label: string }[] = [
  { key: 'users', label: 'User Growth' },
  { key: 'agents', label: 'Agent Performance' },
  { key: 'deposits', label: 'Deposit Report' },
  { key: 'wallets', label: 'Wallet Report' },
  { key: 'transactions', label: 'Transaction Report' },
  { key: 'betting', label: 'Betting Activity' },
  { key: 'commissions', label: 'Commission Report' },
];

export const AdminReports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportKey>('agents');
  const [dateRange, setDateRange] = useState('all');

  const customers = useAurelStore((s) => s.customers);
  const agents = useAurelStore((s) => s.agents);
  const depositRequests = useAurelStore((s) => s.depositRequests);
  const transactions = useAurelStore((s) => s.transactions);
  const demoBets = useAurelStore((s) => s.demoBets);
  const commissions = useAurelStore((s) => s.commissions);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const withinDate = (iso: string) => {
    if (dateRange === 'all') return true;
    const diff = (Date.now() - new Date(iso).getTime()) / 86400000;
    return dateRange === '7d' ? diff <= 7 : diff <= 30;
  };

  const reportRows = useMemo(() => {
    switch (activeReport) {
      case 'users':
        return customers
          .filter((c) => withinDate(c.registeredAt))
          .map((c) => ({
            ID: c.id,
            Customer: c.name,
            AgentID: c.agentId,
            Registered: formatShortDate(c.registeredAt),
            Balance: formatCurrency(c.walletBalance, currency),
            Status: c.status,
          }));
      case 'agents':
        return agents.map((a) => ({
          AgentID: a.id,
          AgentName: a.name,
          Region: a.region,
          AssignedUsers: customers.filter((c) => c.agentId === a.id).length,
          AvailableWallet: formatCurrency(a.walletBalance, currency),
          CommissionRate: `${a.commissionRate}%`,
          CommissionEarned: formatCurrency(a.totalCommissionEarned, currency),
        }));
      case 'deposits':
        return depositRequests
          .filter((d) => withinDate(d.submittedAt))
          .map((d) => ({
            Reference: d.reference,
            Customer: d.customerName,
            Agent: d.agentName,
            Method: d.method,
            Amount: formatCurrency(d.amount, currency),
            Status: d.status,
            Date: formatShortDate(d.submittedAt),
          }));
      case 'wallets':
        return [
          ...agents.map((a) => ({
            AccountID: a.id,
            Name: a.name,
            Tier: 'Agent Wallet',
            Balance: formatCurrency(a.walletBalance, currency),
            Status: a.status,
          })),
          ...customers.map((c) => ({
            AccountID: c.id,
            Name: c.name,
            Tier: 'Customer Wallet',
            Balance: formatCurrency(c.walletBalance, currency),
            Status: c.status,
          })),
        ];
      case 'transactions':
        return transactions
          .filter((t) => withinDate(t.createdAt))
          .map((t) => ({
            Reference: t.reference,
            Account: t.accountName,
            Category: t.type,
            Amount: formatCurrency(t.amount, currency, { showSign: true }),
            NewBalance: formatCurrency(t.newBalance, currency),
            Status: t.status,
          }));
      case 'betting':
        return demoBets
          .filter((b) => withinDate(b.placedAt))
          .map((b) => ({
            BetRef: b.reference,
            Customer: b.customerName,
            Sport: b.sport,
            Stake: formatCurrency(b.stake, currency),
            PotentialReturn: formatCurrency(b.potentialReturn, currency),
            Status: b.status,
          }));
      case 'commissions':
        return commissions
          .filter((c) => withinDate(c.createdAt))
          .map((c) => ({
            Reference: c.reference,
            Agent: c.agentName,
            Customer: c.customerName,
            BaseAmount: formatCurrency(c.baseAmount, currency),
            Rate: `${c.rate}%`,
            Commission: formatCurrency(c.amount, currency),
            Status: c.status,
          }));
    }
  }, [activeReport, dateRange, customers, agents, depositRequests, transactions, demoBets, commissions, currency]);

  const headers = reportRows.length > 0 ? Object.keys(reportRows[0]) : [];

  const handleExport = () => {
    exportToCsv(`aurel-${activeReport}-report.csv`, reportRows);
    addToast('success', 'Report Exported', `Exported ${reportRows.length} rows to CSV.`);
  };

  return (
    <AdminLayout title="Reporting Center">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-heading text-2xl font-semibold text-charcoal">
              Operational Reporting Center
            </h1>
            <p className="mt-1 text-sm text-muted-grey">
              Generate interactive reports from live simulated data and export directly to CSV.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            disabled={reportRows.length === 0}
          >
            <Download className="h-4 w-4" />
            Export {REPORT_TABS.find((r) => r.key === activeReport)?.label} CSV
          </Button>
        </div>

        {/* Report Selector + Date Filter */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {REPORT_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveReport(tab.key)}
                className={clsx(
                  'shrink-0 rounded-btn border px-3.5 py-2 text-xs font-medium transition-colors',
                  activeReport === tab.key
                    ? 'border-forest bg-forest text-ivory'
                    : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="w-48 shrink-0">
            <CustomSelect
              value={dateRange}
              onChange={setDateRange}
              options={[
                { value: 'all', label: 'All Dates' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' },
              ]}
            />
          </div>
        </div>

        {/* Report Preview Table */}
        <div className="rounded-card border border-warm-border bg-soft-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-warm-border px-5 py-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal">
              <FileBarChart2 className="h-4 w-4 text-forest" />
              {REPORT_TABS.find((r) => r.key === activeReport)?.label} ({reportRows.length} rows)
            </div>
            <span className="text-[11px] text-muted-grey">Simulated local dataset</span>
          </div>

          {reportRows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-grey">
              No records fall within the selected date range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-warm-border bg-ivory/70 text-[11px] font-semibold uppercase tracking-wider text-muted-grey">
                  <tr>
                    {headers.map((h) => (
                      <th key={h} className="px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-border">
                  {reportRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-ivory/40">
                      {headers.map((h) => (
                        <td
                          key={h}
                          className="px-4 py-3 text-xs text-charcoal tabular-nums whitespace-nowrap"
                        >
                          {String((row as Record<string, unknown>)[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

