import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Ticket, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AurelLogo } from '@/components/common/AurelLogo';
import { Button } from '@/components/common/Button';
import { DemoControlBar } from '@/components/common/DemoControlBar';
import { Modal } from '@/components/common/Modal';
import { Drawer } from '@/components/common/Drawer';
import { BetSlipPanel } from '@/components/betting/BetSlipPanel';
import { useAurelStore } from '@/store/useAurelStore';

const registerSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  username: z
    .string()
    .min(3, 'Minimum 3 characters')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Letters, numbers, dots or underscores only'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(6, 'Phone placeholder is required'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface PublicHeaderProps {
  transparentHero?: boolean;
}

export const PublicHeader: React.FC<PublicHeaderProps> = ({ transparentHero = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const betSlip = useAurelStore((s) => s.betSlip);
  const publicSlipOpen = useAurelStore((s) => s.publicSlipOpen);
  const setPublicSlipOpen = useAurelStore((s) => s.setPublicSlipOpen);
  const createCustomer = useAurelStore((s) => s.createCustomer);
  const customers = useAurelStore((s) => s.customers);
  const setActiveCustomerId = useAurelStore((s) => s.setActiveCustomerId);
  const setActiveRole = useAurelStore((s) => s.setActiveRole);
  const addToast = useAurelStore((s) => s.addToast);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isTransparent = transparentHero && !scrolled;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const handleRegisterSubmit = (data: RegisterFormValues) => {
    const res = createCustomer(
      {
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        agentId: 'AGT-101',
        initialBalance: 500,
        status: 'active',
      },
      'admin',
      'ADM-001'
    );
    if (!res.ok) {
      addToast('error', 'Simulated Registration', res.message);
      return;
    }
    const created = useAurelStore
      .getState()
      .customers.find((c) => c.username.toLowerCase() === data.username.toLowerCase());
    if (created) {
      setActiveCustomerId(created.id);
    } else if (customers[0]) {
      setActiveCustomerId(customers[0].id);
    }
    setActiveRole('customer');
    setRegisterModalOpen(false);
    reset();
    addToast(
      'success',
      'Simulated Account Created',
      `Welcome ${data.name}. Entering Customer Portal with $500.00 demo credit.`
    );
    navigate('/customer');
  };

  const navItems = [
    { label: 'Home', to: '/' },
    { label: 'Sports', to: '/sports' },
    { label: 'Live Betting', to: '/sports?status=live' },
    { label: 'Promotions', to: '/how-it-works#promotions' },
    { label: 'How It Works', to: '/how-it-works' },
  ];

  const isActiveLink = (to: string) => {
    if (to === '/') return location.pathname === '/';
    if (to.includes('?status=live')) {
      return location.pathname === '/sports' && location.search.includes('live');
    }
    if (to === '/sports') {
      return location.pathname === '/sports' && !location.search.includes('live');
    }
    return location.pathname === to.split('#')[0];
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-200 ${
          isTransparent
            ? 'border-b border-soft-white/10 bg-forest-dark/45 backdrop-blur-sm text-ivory'
            : 'border-b border-warm-border bg-soft-white/95 backdrop-blur-md text-charcoal shadow-subtle'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: Logo */}
          <Link to="/" className="shrink-0" aria-label="AUREL Home">
            <AurelLogo variant={isTransparent ? 'light' : 'dark'} />
          </Link>

          {/* Center Nav */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => {
              const active = isActiveLink(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`group relative py-1 text-sm font-medium transition-colors ${
                    isTransparent
                      ? active
                        ? 'text-champagne'
                        : 'text-ivory/85 hover:text-ivory'
                      : active
                      ? 'text-forest'
                      : 'text-charcoal/80 hover:text-forest'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-0 -bottom-0.5 h-[1.5px] origin-left transition-transform duration-200 ${
                      isTransparent ? 'bg-champagne' : 'bg-forest'
                    } ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {betSlip.length > 0 && (
              <button
                type="button"
                onClick={() => setPublicSlipOpen(true)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors ${
                  isTransparent
                    ? 'border-champagne/60 bg-champagne text-forest-dark'
                    : 'border-forest bg-forest text-ivory'
                }`}
              >
                <Ticket className="h-3.5 w-3.5" />
                <span>Slip ({betSlip.length})</span>
              </button>
            )}

            <div className="hidden sm:block">
              <DemoControlBar lightText={isTransparent} />
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant={isTransparent ? 'outline-light' : 'secondary'}
                size="sm"
                onClick={() => navigate('/demo-access')}
              >
                Log In
              </Button>
              <Button
                variant={isTransparent ? 'champagne' : 'primary'}
                size="sm"
                onClick={() => setRegisterModalOpen(true)}
              >
                Create Account
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className={`flex h-10 w-10 items-center justify-center rounded-btn lg:hidden ${
                isTransparent ? 'text-ivory hover:bg-soft-white/10' : 'text-charcoal hover:bg-ivory'
              }`}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Navigation Drawer */}
      <Drawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title="AUREL Navigation"
        subtitle="Interactive Product Demonstration"
        side="right"
      >
        <div className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 items-center justify-between rounded-btn px-3 text-sm font-medium text-charcoal hover:bg-ivory"
            >
              <span>{item.label}</span>
              <ArrowRight className="h-4 w-4 text-muted-grey" />
            </Link>
          ))}
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-11 items-center justify-between rounded-btn px-3 text-sm font-medium text-charcoal hover:bg-ivory"
          >
            <span>Contact</span>
            <ArrowRight className="h-4 w-4 text-muted-grey" />
          </Link>

          <div className="my-3 border-t border-warm-border pt-4 space-y-2.5">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/demo-access');
              }}
            >
              Log In (Demo Access)
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                setMobileMenuOpen(false);
                setRegisterModalOpen(true);
              }}
            >
              Create Account (Simulated)
            </Button>
          </div>

          <div className="mt-2 rounded-card border border-warm-border bg-ivory/70 p-3.5">
            <p className="text-xs font-medium text-charcoal mb-2">Quick Portal Switch</p>
            <DemoControlBar />
          </div>
        </div>
      </Drawer>

      {/* Public Bet Slip Drawer */}
      <Drawer
        open={publicSlipOpen}
        onClose={() => setPublicSlipOpen(false)}
        title="Your Demo Selections"
        subtitle="Simulated wagering preview"
        side="right"
      >
        <BetSlipPanel isPublicContext onPlaced={() => setPublicSlipOpen(false)} />
      </Drawer>

      {/* Simulated Registration Modal */}
      <Modal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Create Demo Account"
        subtitle="Simulated onboarding — no real registration or real-money deposits"
        size="md"
      >
        <form onSubmit={handleSubmit(handleRegisterSubmit)} className="space-y-4">
          <div className="rounded-card border border-champagne/40 bg-champagne-soft/55 p-3 text-xs text-charcoal">
            Creates a local simulated customer assigned to Agent <strong>Michael Vance</strong>{' '}
            with an illustrative starting demo balance of <strong>$500.00</strong>.
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">
              Full Name <span className="text-error">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="e.g. Jordan Vance"
              className="h-11 w-full rounded-btn border border-warm-border bg-soft-white px-3.5 text-sm text-charcoal focus:border-forest focus:outline-none"
            />
            {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Username <span className="text-error">*</span>
              </label>
              <input
                {...register('username')}
                placeholder="jordan.v"
                className="h-11 w-full rounded-btn border border-warm-border bg-soft-white px-3.5 text-sm text-charcoal focus:border-forest focus:outline-none"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-error">{errors.username.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-charcoal">
                Phone Placeholder <span className="text-error">*</span>
              </label>
              <input
                {...register('phone')}
                placeholder="+44 7700 900100"
                className="h-11 w-full rounded-btn border border-warm-border bg-soft-white px-3.5 text-sm text-charcoal focus:border-forest focus:outline-none"
              />
              {errors.phone && <p className="mt-1 text-xs text-error">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-charcoal">
              Email Address <span className="text-error">*</span>
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="jordan@aurel-demo.example"
              className="h-11 w-full rounded-btn border border-warm-border bg-soft-white px-3.5 text-sm text-charcoal focus:border-forest focus:outline-none"
            />
            {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button variant="secondary" onClick={() => setRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              <CheckCircle2 className="h-4 w-4" />
              Start Simulated Account
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
