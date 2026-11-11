import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LucideIcon,
  Menu,
  Eye,
  EyeOff,
  Globe,
  Bell,
  Ticket,
} from 'lucide-react';
import { AurelLogo } from '@/components/common/AurelLogo';
import { DemoControlBar } from '@/components/common/DemoControlBar';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';
import { Drawer } from '@/components/common/Drawer';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency } from '@/utils/formatters';
import { clsx } from 'clsx';

export interface PortalNavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface PortalLayoutProps {
  portalName: string;
  portalSubtitle: string;
  userName: string;
  userMeta: string;
  navItems: PortalNavItem[];
  mobileQuickNav?: PortalNavItem[];
  balanceDisplay?: number;
  onToggleSlipDrawer?: () => void;
  slipCount?: number;
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({
  portalName,
  portalSubtitle,
  userName,
  userMeta,
  navItems,
  mobileQuickNav,
  balanceDisplay,
  onToggleSlipDrawer,
  slipCount = 0,
  children,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const hideBalance = useAurelStore((s) => s.hideBalance);
  const toggleHideBalance = useAurelStore((s) => s.toggleHideBalance);
  const currency = useAurelStore((s) => s.settings.currency);
  const activityLogs = useAurelStore((s) => s.activityLogs);
  const setActiveRole = useAurelStore((s) => s.setActiveRole);

  const isNavActive = (to: string) => {
    if (to === '/customer' || to === '/agent' || to === '/admin') {
      return location.pathname === to;
    }
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  const renderNavList = (onNavigate?: () => void) => (
    <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto" aria-label={`${portalName} navigation`}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isNavActive(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={clsx(
              'group flex min-h-[42px] items-center justify-between gap-3 rounded-btn px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-forest text-ivory shadow-subtle'
                : 'text-charcoal/80 hover:bg-ivory hover:text-forest'
            )}
          >
            <span className="flex items-center gap-3 min-w-0">
              <Icon
                className={clsx(
                  'h-4 w-4 shrink-0',
                  active ? 'text-champagne' : 'text-muted-grey group-hover:text-forest'
                )}
              />
              <span className="truncate">{item.label}</span>
            </span>
            {item.badge !== undefined && Number(item.badge) > 0 && (
              <span
                className={clsx(
                  'inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                  active
                    ? 'bg-champagne text-forest-dark'
                    : 'bg-champagne-soft text-champagne-dark'
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-ivory text-charcoal">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-60 xl:w-64 lg:shrink-0 lg:flex-col border-r border-warm-border bg-soft-white">
        <div className="flex h-16 items-center justify-between border-b border-warm-border px-5">
          <Link to="/" onClick={() => setActiveRole('public')}>
            <AurelLogo variant="dark" />
          </Link>
          <span className="rounded-full border border-warm-border bg-ivory px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-forest">
            {portalName}
          </span>
        </div>

        <div className="border-b border-warm-border/70 px-5 py-3.5 bg-ivory/40">
          <p className="text-xs font-semibold text-charcoal truncate">{userName}</p>
          <p className="text-[11px] text-muted-grey truncate">{userMeta}</p>
        </div>

        {renderNavList()}

        <div className="border-t border-warm-border p-3 space-y-2">
          <button
            type="button"
            onClick={() => {
              setActiveRole('public');
              navigate('/');
            }}
            className="flex h-10 w-full items-center gap-2.5 rounded-btn px-3 text-xs font-medium text-muted-grey transition-colors hover:bg-ivory hover:text-charcoal"
          >
            <Globe className="h-4 w-4" />
            Return to Public Site
          </button>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-warm-border bg-soft-white/95 backdrop-blur-sm px-4 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-btn border border-warm-border text-charcoal hover:bg-ivory lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="truncate font-heading text-sm font-semibold text-charcoal">
                {portalSubtitle}
              </p>
              <p className="hidden sm:block truncate text-[11px] text-muted-grey">
                {portalName} Workspace · Simulated Data Environment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {balanceDisplay !== undefined && (
              <div className="flex items-center gap-2 rounded-btn border border-warm-border bg-ivory/75 px-3 py-1.5">
                <div className="text-right">
                  <p className="hidden sm:block text-[10px] uppercase tracking-wider text-muted-grey">
                    Demo Balance
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-forest tabular-nums">
                    {formatCurrency(balanceDisplay, currency, { hideValue: hideBalance })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleHideBalance}
                  aria-label={hideBalance ? 'Show balance' : 'Hide balance'}
                  className="rounded p-1 text-muted-grey hover:bg-soft-white hover:text-charcoal"
                >
                  {hideBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            {onToggleSlipDrawer && (
              <button
                type="button"
                onClick={onToggleSlipDrawer}
                className="inline-flex h-9 items-center gap-1.5 rounded-btn border border-forest bg-forest px-3 text-xs font-medium text-ivory xl:hidden"
              >
                <Ticket className="h-3.5 w-3.5 text-champagne" />
                <span>Slip ({slipCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setNotificationsOpen(true)}
              aria-label="View recent platform notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-btn border border-warm-border bg-soft-white text-charcoal hover:bg-ivory"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-champagne" />
            </button>

            <DemoControlBar />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>

        {/* Bottom Disclaimer */}
        <div className="hidden lg:block">
          <DisclaimerBanner compact />
        </div>
      </div>

      {/* Mobile Bottom Quick Nav */}
      {mobileQuickNav && mobileQuickNav.length > 0 && (
        <nav
          aria-label="Mobile quick navigation"
          className="fixed inset-x-0 bottom-0 z-30 grid border-t border-warm-border bg-soft-white/95 backdrop-blur-md lg:hidden"
          style={{ gridTemplateColumns: `repeat(${mobileQuickNav.length}, minmax(0, 1fr))` }}
        >
          {mobileQuickNav.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  'flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-medium',
                  active ? 'text-forest' : 'text-muted-grey'
                )}
              >
                <Icon className={clsx('h-4 w-4', active && 'text-forest')} />
                <span className="truncate max-w-full">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Mobile Navigation Drawer */}
      <Drawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        title={`${portalName} Menu`}
        subtitle={`${userName} · ${userMeta}`}
        side="left"
      >
        <div className="flex flex-col h-full">
          {renderNavList(() => setMobileNavOpen(false))}
          <div className="mt-4 border-t border-warm-border pt-3">
            <button
              type="button"
              onClick={() => {
                setMobileNavOpen(false);
                setActiveRole('public');
                navigate('/');
              }}
              className="flex h-11 w-full items-center gap-2.5 rounded-btn px-3 text-sm font-medium text-muted-grey hover:bg-ivory hover:text-charcoal"
            >
              <Globe className="h-4 w-4" />
              Return to Public Website
            </button>
          </div>
        </div>
      </Drawer>

      {/* Recent Activity / Notifications Drawer */}
      <Drawer
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Recent Demo Notifications"
        subtitle="Synchronized platform activity feed"
        side="right"
      >
        <div className="space-y-3">
          {activityLogs.slice(0, 10).map((log) => (
            <div
              key={log.id}
              className="rounded-card border border-warm-border bg-ivory/50 p-3.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-forest">{log.action}</span>
                <span className="text-[11px] text-muted-grey">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="mt-1 leading-relaxed text-charcoal">{log.description}</p>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
};

