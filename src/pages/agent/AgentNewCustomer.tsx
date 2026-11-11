import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { AgentLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { CustomSelect } from '@/components/common/CustomSelect';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency } from '@/utils/formatters';
import { AccountStatus } from '@/types';

const newCustomerSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Letters, numbers, dots or underscores only'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(6, 'Phone number placeholder is required'),
  initialBalance: z.coerce.number().min(0, 'Cannot be negative'),
  status: z.enum(['active', 'suspended']),
});

type NewCustomerValues = z.infer<typeof newCustomerSchema>;

export const AgentNewCustomer: React.FC = () => {
  const navigate = useNavigate();

  const agents = useAurelStore((s) => s.agents);
  const activeAgentId = useAurelStore((s) => s.activeAgentId);
  const createCustomer = useAurelStore((s) => s.createCustomer);
  const currency = useAurelStore((s) => s.settings.currency);
  const addToast = useAurelStore((s) => s.addToast);

  const agent = agents.find((a) => a.id === activeAgentId) || agents[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewCustomerValues>({
    resolver: zodResolver(newCustomerSchema),
    defaultValues: {
      initialBalance: 250,
      status: 'active',
    },
  });

  const selectedStatus = watch('status');

  const onSubmit = (values: NewCustomerValues) => {
    const res = createCustomer(
      {
        ...values,
        agentId: agent.id,
      },
      'agent',
      agent.id
    );
    if (!res.ok) {
      addToast('error', 'Unable to Create Customer', res.message);
      return;
    }
    addToast('success', 'Customer Onboarded', res.message);
    navigate('/agent/customers');
  };

  return (
    <AgentLayout title="Add Customer">
      <div className="max-w-2xl space-y-6">
        <div>
          <button
            type="button"
            onClick={() => navigate('/agent/customers')}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-grey hover:text-forest"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Customers
          </button>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-charcoal">
            Onboard New Demo Customer
          </h1>
          <p className="mt-1 text-sm text-muted-grey">
            Customer will be assigned directly to {agent.name} ({agent.id}). Available agent
            wallet liquidity: {formatCurrency(agent.walletBalance, currency)}.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-card-lg border border-warm-border bg-soft-white p-6 space-y-4 shadow-subtle"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Full Name <span className="text-error">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="e.g. Julian Mercer"
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm focus:border-forest focus:bg-soft-white focus:outline-none"
              />
              {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Username <span className="text-error">*</span>
              </label>
              <input
                {...register('username')}
                placeholder="julian.m"
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm focus:border-forest focus:bg-soft-white focus:outline-none"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-error">{errors.username.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Email Address <span className="text-error">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="julian@aurel-demo.example"
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm focus:border-forest focus:bg-soft-white focus:outline-none"
              />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Phone Number <span className="text-error">*</span>
              </label>
              <input
                {...register('phone')}
                placeholder="+44 7700 900321"
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm focus:border-forest focus:bg-soft-white focus:outline-none"
              />
              {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Initial Demo Balance ({currency})
              </label>
              <input
                type="number"
                step="10"
                {...register('initialBalance')}
                className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm font-semibold tabular-nums focus:border-forest focus:bg-soft-white focus:outline-none"
              />
              {errors.initialBalance && (
                <p className="mt-1 text-xs text-error">{errors.initialBalance.message}</p>
              )}
              <p className="mt-1 text-[11px] text-muted-grey">
                Funded from your simulated agent wallet if &gt; 0.
              </p>
            </div>

            <CustomSelect
              label="Account Status"
              value={selectedStatus}
              onChange={(val) => setValue('status', val as AccountStatus)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </div>

          <div className="flex justify-end gap-2.5 border-t border-warm-border pt-4">
            <Button variant="secondary" onClick={() => navigate('/agent/customers')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              <UserPlus className="h-4 w-4" />
              Create Demo Customer
            </Button>
          </div>
        </form>
      </div>
    </AgentLayout>
  );
};

