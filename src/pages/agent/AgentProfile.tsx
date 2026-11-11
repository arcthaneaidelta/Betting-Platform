import React from 'react';
import { Briefcase, Mail, Phone, MapPin, Percent } from 'lucide-react';
import { AgentLayout } from '@/layouts/PortalWrappers';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { useAurelStore } from '@/store/useAurelStore';
import { formatShortDate } from '@/utils/formatters';

export const AgentProfile: React.FC = () => {
  const agents = useAurelStore((s) => s.agents);
  const activeAgentId = useAurelStore((s) => s.activeAgentId);

  const agent = agents.find((a) => a.id === activeAgentId) || agents[0];

  return (
    <AgentLayout title="Agent Profile">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">Agent Profile</h1>
          <p className="mt-1 text-sm text-muted-grey">
            Simulated agent credentials, territory assignment, and commission configuration.
          </p>
        </div>

        <div className="rounded-card-lg border border-warm-border bg-soft-white p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-warm-border pb-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-card bg-forest text-champagne">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-semibold text-charcoal">{agent.name}</h2>
                <p className="text-xs text-muted-grey">@{agent.username} · Joined {formatShortDate(agent.joinedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopyIdButton value={agent.id} />
              <Badge tone={statusToBadgeTone(agent.status)}>{agent.status}</Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 text-sm">
            <div className="flex items-center gap-3 rounded-card border border-warm-border bg-ivory/45 p-4">
              <Mail className="h-4 w-4 text-forest" />
              <div>
                <p className="text-[11px] text-muted-grey">Email Address</p>
                <p className="font-medium text-charcoal">{agent.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-card border border-warm-border bg-ivory/45 p-4">
              <Phone className="h-4 w-4 text-forest" />
              <div>
                <p className="text-[11px] text-muted-grey">Desk Contact</p>
                <p className="font-medium text-charcoal">{agent.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-card border border-warm-border bg-ivory/45 p-4">
              <MapPin className="h-4 w-4 text-forest" />
              <div>
                <p className="text-[11px] text-muted-grey">Assigned Region</p>
                <p className="font-medium text-charcoal">{agent.region}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-card border border-warm-border bg-ivory/45 p-4">
              <Percent className="h-4 w-4 text-forest" />
              <div>
                <p className="text-[11px] text-muted-grey">Configured Commission Rate</p>
                <p className="font-semibold text-forest tabular-nums">{agent.commissionRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AgentLayout>
  );
};

