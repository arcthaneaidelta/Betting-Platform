import React, { useState } from 'react';
import { LifeBuoy, Send, ShieldCheck } from 'lucide-react';
import { AgentLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { CustomSelect } from '@/components/common/CustomSelect';
import { useAurelStore } from '@/store/useAurelStore';

export const AgentSupport: React.FC = () => {
  const [category, setCategory] = useState('allocation');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const addToast = useAurelStore((s) => s.addToast);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      addToast('warning', 'Missing Details', 'Enter both a subject and message.');
      return;
    }
    addToast(
      'success',
      'Operational Ticket Simulated',
      'Support inquiry routed to Super Administrator demo desk.'
    );
    setSubject('');
    setMessage('');
  };

  return (
    <AgentLayout title="Agent Support">
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Agent Operations Support Desk
          </h1>
          <p className="mt-1 text-sm text-muted-grey">
            Request simulated treasury top-ups or report operational questions to platform
            administrators.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-card-lg border border-warm-border bg-soft-white p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-forest">
            <LifeBuoy className="h-4 w-4" />
            Internal Agent Escalation Form (Demo)
          </div>

          <CustomSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={[
              { value: 'allocation', label: 'Demo Treasury Allocation Request' },
              { value: 'customer', label: 'Customer Account Escalation' },
              { value: 'commission', label: 'Commission Rate Inquiry' },
            ]}
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Request additional Western Europe demo liquidity"
              className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm focus:border-forest focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the operational assistance required..."
              className="w-full rounded-btn border border-warm-border bg-ivory/40 p-3.5 text-sm focus:border-forest focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-grey">
              <ShieldCheck className="h-4 w-4 text-forest" />
              Simulated internal workflow
            </span>
            <Button type="submit" variant="primary">
              <Send className="h-4 w-4" />
              Submit Demo Ticket
            </Button>
          </div>
        </form>
      </div>
    </AgentLayout>
  );
};

