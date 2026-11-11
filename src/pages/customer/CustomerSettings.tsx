import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Bell, Globe } from 'lucide-react';
import { CustomerLayout } from '@/layouts/PortalWrappers';
import { Button } from '@/components/common/Button';
import { CustomSelect } from '@/components/common/CustomSelect';
import { useAurelStore } from '@/store/useAurelStore';
import { PlatformSettings } from '@/types';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Enter current demo password (min 6 chars)'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

export const CustomerSettings: React.FC = () => {
  const customers = useAurelStore((s) => s.customers);
  const activeCustomerId = useAurelStore((s) => s.activeCustomerId);
  const updateCustomerNotifications = useAurelStore((s) => s.updateCustomerNotifications);
  const settings = useAurelStore((s) => s.settings);
  const updateSettings = useAurelStore((s) => s.updateSettings);
  const addToast = useAurelStore((s) => s.addToast);

  const customer = customers.find((c) => c.id === activeCustomerId) || customers[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onPasswordSubmit = () => {
    addToast(
      'success',
      'Password Update Simulated',
      'Demo security confirmation completed without backend persistence.'
    );
    reset();
  };

  const togglePref = (key: keyof typeof customer.notificationPreferences) => {
    updateCustomerNotifications(customer.id, {
      [key]: !customer.notificationPreferences[key],
    });
    addToast('info', 'Preference Updated', 'Notification setting saved in demo state.');
  };

  return (
    <CustomerLayout title="Settings">
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-charcoal">
            Account Preferences &amp; Security
          </h1>
          <p className="mt-1 text-sm text-muted-grey">
            Manage notification toggles, interface language, and simulated security controls.
          </p>
        </div>

        {/* Notifications */}
        <div className="rounded-card border border-warm-border bg-soft-white p-6 space-y-4">
          <div className="flex items-center gap-2.5">
            <Bell className="h-4 w-4 text-forest" />
            <h2 className="font-heading text-base font-semibold text-charcoal">
              Notification Preferences
            </h2>
          </div>

          <div className="divide-y divide-warm-border">
            {[
              {
                key: 'betSettlement' as const,
                title: 'Simulated bet settlement alerts',
                desc: 'Receive demo notifications when a ticket status updates.',
              },
              {
                key: 'depositUpdates' as const,
                title: 'Deposit request status updates',
                desc: 'Notify when an agent or administrator reviews an internal request.',
              },
              {
                key: 'matchReminders' as const,
                title: 'Featured match kick-off alerts',
                desc: 'Highlight upcoming demo fixtures on your dashboard.',
              },
              {
                key: 'platformAnnouncements' as const,
                title: 'Platform announcements',
                desc: 'Updates regarding new simulated sportsbook features.',
              },
            ].map((item) => {
              const enabled = customer.notificationPreferences[item.key];
              return (
                <div key={item.key} className="flex items-center justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-charcoal">{item.title}</p>
                    <p className="text-xs text-muted-grey">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={enabled}
                    onClick={() => togglePref(item.key)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      enabled ? 'bg-forest' : 'bg-warm-border'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-soft-white shadow transition-transform ${
                        enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Language */}
          <div className="rounded-card border border-warm-border bg-soft-white p-6 space-y-4">
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 text-forest" />
              <h2 className="font-heading text-base font-semibold text-charcoal">
                Language &amp; Display
              </h2>
            </div>

            <CustomSelect
              label="Interface Language"
              value={settings.language}
              onChange={(val) => {
                updateSettings({ language: val as PlatformSettings['language'] });
                addToast('success', 'Language Updated', `Demo locale set to ${val}.`);
              }}
              options={[
                { value: 'EN', label: 'English (International)' },
                { value: 'FR', label: 'Français' },
                { value: 'ES', label: 'Español' },
                { value: 'DE', label: 'Deutsch' },
              ]}
            />
          </div>

          {/* Password UI Demo */}
          <form
            onSubmit={handleSubmit(onPasswordSubmit)}
            className="rounded-card border border-warm-border bg-soft-white p-6 space-y-3.5"
          >
            <div className="flex items-center gap-2.5">
              <Lock className="h-4 w-4 text-forest" />
              <h2 className="font-heading text-base font-semibold text-charcoal">
                Password Update (UI Demo)
              </h2>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal">
                Current Password <span className="text-error">*</span>
              </label>
              <input
                type="password"
                {...register('currentPassword')}
                placeholder="••••••••"
                className="h-10 w-full rounded-btn border border-warm-border bg-ivory/40 px-3 text-sm focus:border-forest focus:outline-none"
              />
              {errors.currentPassword && (
                <p className="mt-1 text-xs text-error">{errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal">
                New Password <span className="text-error">*</span>
              </label>
              <input
                type="password"
                {...register('newPassword')}
                placeholder="Min 8 characters"
                className="h-10 w-full rounded-btn border border-warm-border bg-ivory/40 px-3 text-sm focus:border-forest focus:outline-none"
              />
              {errors.newPassword && (
                <p className="mt-1 text-xs text-error">{errors.newPassword.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-charcoal">
                Confirm New Password <span className="text-error">*</span>
              </label>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="Repeat password"
                className="h-10 w-full rounded-btn border border-warm-border bg-ivory/40 px-3 text-sm focus:border-forest focus:outline-none"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-1 flex justify-end">
              <Button type="submit" variant="primary" size="sm">
                Update Password (Demo)
              </Button>
            </div>
          </form>
        </div>
      </div>
    </CustomerLayout>
  );
};

