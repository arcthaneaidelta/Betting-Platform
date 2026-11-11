import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Clock, MessageSquare, Send } from 'lucide-react';
import { PublicHeader } from '@/components/navigation/PublicHeader';
import { PublicFooter } from '@/components/navigation/PublicFooter';
import { Button } from '@/components/common/Button';
import { useAurelStore } from '@/store/useAurelStore';

const contactSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Enter a valid email address'),
  subject: z.string().min(3, 'Please enter a subject'),
  message: z.string().min(10, 'Please enter at least 10 characters'),
});

type ContactValues = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const addToast = useAurelStore((s) => s.addToast);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = () => {
    addToast(
      'success',
      'Inquiry Submitted (Demo)',
      'Your contact request has been simulated cleanly.'
    );
    reset();
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col">
      <PublicHeader />

      <main className="flex-1 pt-24 pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-grey">
              Help Center &amp; Demo Concierge
            </p>
            <h1 className="mt-2 font-heading text-3xl font-semibold text-charcoal sm:text-4xl">
              Contact &amp; Presentation Support
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-grey">
              Reach out regarding the AUREL product demonstration, interface architecture, or
              role-based workflows. All details shown below are clearly marked demo placeholders.
            </p>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-card border border-warm-border bg-soft-white p-5">
                <Mail className="h-5 w-5 text-forest" />
                <h2 className="mt-3 font-heading text-sm font-semibold text-charcoal">
                  Demo Concierge Email
                </h2>
                <p className="mt-1 text-sm text-muted-grey">concierge@aurel-demo.example</p>
              </div>
              <div className="rounded-card border border-warm-border bg-soft-white p-5">
                <Clock className="h-5 w-5 text-forest" />
                <h2 className="mt-3 font-heading text-sm font-semibold text-charcoal">
                  Simulated Support Desk Hours
                </h2>
                <p className="mt-1 text-sm text-muted-grey">Monday – Sunday · 08:00 – 22:00 UTC</p>
              </div>
              <div className="rounded-card border border-warm-border bg-soft-white p-5">
                <MessageSquare className="h-5 w-5 text-forest" />
                <h2 className="mt-3 font-heading text-sm font-semibold text-charcoal">
                  Agent Operations Desk
                </h2>
                <p className="mt-1 text-sm text-muted-grey">
                  Agents inside the portal can also submit operational support tickets directly.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="rounded-card-lg border border-warm-border bg-soft-white p-6 space-y-4 shadow-subtle"
              >
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-charcoal">
                    Your Name <span className="text-error">*</span>
                  </label>
                  <input
                    {...register('name')}
                    placeholder="Alex Mercer"
                    className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-error">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-charcoal">
                    Email Address <span className="text-error">*</span>
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="name@company.example"
                    className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-error">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-charcoal">
                    Subject <span className="text-error">*</span>
                  </label>
                  <input
                    {...register('subject')}
                    placeholder="Walkthrough inquiry for Agent Operations"
                    className="h-11 w-full rounded-btn border border-warm-border bg-ivory/40 px-3.5 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-error">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-charcoal">
                    Message <span className="text-error">*</span>
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    placeholder="Share your questions or feedback..."
                    className="w-full rounded-btn border border-warm-border bg-ivory/40 p-3.5 text-sm text-charcoal focus:border-forest focus:bg-soft-white focus:outline-none"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-error">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <Button type="submit" variant="primary">
                    <Send className="h-4 w-4" />
                    Submit Inquiry
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

