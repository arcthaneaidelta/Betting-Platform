import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, UserCheck } from 'lucide-react';
import { CustomerLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { Badge, statusToBadgeTone } from '@/components/common/Badge';
import { CopyIdButton } from '@/components/common/CopyIdButton';
import { useAurelStore } from '@/store/useAurelStore';
import { formatShortDate } from '@/utils/formatters';

const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(6, 'Phone placeholder required'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const CustomerProfile: React.FC = () => {
  const customers = useAurelStore((s) => s.customers);
  const agents = useAurelStore((s) => s.agents);
  const activeCustomerId = useAurelStore((s) => s.activeCustomerId);
  const updateCustomer = useAurelStore((s) => s.updateCustomer);
  const addToast = useAurelStore((s) => s.addToast);

  const customer = customers.find((c) => c.id === activeCustomerId) || customers[0];
  const assignedAgent = agents.find((a) => a.id === customer.agentId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    const res = updateCustomer(customer.id, values, 'customer', customer.name);
    if (res.ok) {
      addToast('success', 'Changes Saved', 'Demo customer profile details updated.');
    }
  };

  return (
    <CustomerLayout title="Customer Profile">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">Account Profile</h1>
          <p className="mt-1 text-sm text-muted-grey">
            Mock identity details, account identifier, and assigned agent mapping.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Account Identity Card */}
          <div className="rounded-card border border-warm-border bg-soft-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-forest text-champagne font-heading font-semibold">
                {customer.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <Badge tone={statusToBadgeTone(customer.status)}>{customer.status}</Badge>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold text-charcoal">{customer.name}</h2>
              <p className="text-xs text-muted-grey">@{customer.username}</p>
            </div>

            <dl className="space-y-2.5 border-t border-warm-border pt-4 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-muted-grey">Account ID</dt>
                <dd>
                  <CopyIdButton value={customer.id} />
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-grey">Registered</dt>
                <dd className="font-medium text-charcoal">
                  {formatShortDate(customer.registeredAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-muted-grey">Assigned Agent</dt>
                <dd className="inline-flex items-center gap-1 font-medium text-forest">
                  <UserCheck className="h-3.5 w-3.5" />
                  {assignedAgent?.name || customer.agentId}
                </dd>
              </div>
            </dl>
          </div>

          {/* Editable Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="md:col-span-2 rounded-card border border-warm-border bg-soft-white p-6 space-y-4"
          >
            <h3 className="font-heading text-base font-semibold text-charcoal">
              Personal Information (Mock Identity)
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-charcoal">
                  Full Name <span className="text-error">*</span>
                </label>
                <input
                  {...register('name')}
                  className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
                />
                {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-charcoal">Username</label>
                <input
                  value={customer.username}
                  disabled
                  className="h-11 w-full rounded-btn border border-warm-border bg-ivory px-3.5 text-sm text-muted-grey cursor-not-allowed"
                />
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
                  className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-error">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-charcoal">
                  Phone Placeholder <span className="text-error">*</span>
                </label>
                <input
                  {...register('phone')}
                  className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-error">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary">
                <Save className="h-4 w-4" />
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </CustomerLayout>
  );
};

