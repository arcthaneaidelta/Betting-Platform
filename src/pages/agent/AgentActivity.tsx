import React, { useMemo } from 'react';
import {
  UserPlus,
  ArrowDownToLine,
  CheckCircle2,
  Wallet,
  Percent,
  Activity,
} from 'lucide-react';
import { AgentLayout } from '@/layouts/PortalWrappers';
import { Badge } from '@/components/common/Badge';
import { useAurelStore } from '@/store/useAurelStore';
import { formatDateTime } from '@/utils/formatters';
import { ActivityModule } from '@/types';

const MODULE_ICONS: Record<ActivityModule, React.FC<{ className?: string }>> = {
  Customers: UserPlus,
  Deposits: ArrowDownToLine,
  Wallets: Wallet,
  Commissions: Percent,
  Agents: CheckCircle2,
  Betting: Activity,
  Sports: Activity,
  Settings: Activity,
};

export const AgentActivity: React.FC = () => {
  const activeAgentId = useAurelStore((s) => s.activeAgentId);
  const activityLogs = useAurelStore((s) => s.activityLogs);

  const scopedLogs = useMemo(
    () => activityLogs.filter((l) => l.agentId === activeAgentId || l.actorId === activeAgentId),
    [activityLogs, activeAgentId]
  );

  return (
    <AgentLayout title="Agent Activity">
      <div className="max-w-4xl space-y-5">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Chronological Operations Feed
          </h1>
          <p className="mt-1 text-sm text-muted-grey">
            Live audit stream for customer onboarding, deposit approvals, credit distributions, and
            commissions.
          </p>
        </div>

        <div className="rounded-card border border-warm-border bg-soft-white divide-y divide-warm-border">
          {scopedLogs.map((log) => {
            const Icon = MODULE_ICONS[log.module] || Activity;
            return (
              <div key={log.id} className="flex items-start gap-4 p-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-btn bg-forest-light text-forest">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-charcoal">{log.action}</span>
                      <Badge tone="neutral">{log.module}</Badge>
                    </div>
                    <span className="text-xs text-muted-grey">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-grey">{log.description}</p>
                  <p className="mt-1.5 text-[11px] font-medium text-forest">
                    Actor: {log.actorName}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AgentLayout>
  );
};

