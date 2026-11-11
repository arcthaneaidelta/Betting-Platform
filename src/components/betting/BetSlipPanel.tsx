import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Ticket, X, CheckCircle2, Info } from 'lucide-react';
import { useAurelStore } from '@/store/useAurelStore';
import { formatCurrency, formatOdds } from '@/utils/formatters';
import { Button } from '@/components/common/Button';
import { ConfirmationDialog } from '@/components/common/Modal';

interface BetSlipPanelProps {
  isPublicContext?: boolean;
  onPlaced?: () => void;
}

const PRESET_STAKES = [25, 50, 100, 250];

export const BetSlipPanel: React.FC<BetSlipPanelProps> = ({
  isPublicContext = false,
  onPlaced,
}) => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const betSlip = useAurelStore((s) => s.betSlip);
  const betMode = useAurelStore((s) => s.betMode);
  const betStake = useAurelStore((s) => s.betStake);
  const customers = useAurelStore((s) => s.customers);
  const activeCustomerId = useAurelStore((s) => s.activeCustomerId);
  const currency = useAurelStore((s) => s.settings.currency);
  const setBetMode = useAurelStore((s) => s.setBetMode);
  const setBetStake = useAurelStore((s) => s.setBetStake);
  const removeBetSelection = useAurelStore((s) => s.removeBetSelection);
  const clearBetSlip = useAurelStore((s) => s.clearBetSlip);
  const placeDemoBet = useAurelStore((s) => s.placeDemoBet);
  const addToast = useAurelStore((s) => s.addToast);
  const setActiveRole = useAurelStore((s) => s.setActiveRole);

  const activeCustomer = customers.find((c) => c.id === activeCustomerId);
  const availableBalance = activeCustomer?.walletBalance ?? 0;

  const isSingleMode = betMode === 'single' || betSlip.length <= 1;
  const combinedOdds = betSlip.reduce((acc, s) => acc * s.odds, 1);

  const totalStake = isSingleMode ? betStake * betSlip.length : betStake;
  const potentialReturn = isSingleMode
    ? betSlip.reduce((acc, s) => acc + betStake * s.odds, 0)
    : betStake * combinedOdds;
  const potentialProfit = Math.max(0, potentialReturn - totalStake);

  const insufficientBalance = totalStake > availableBalance;
  const invalidStake = betStake <= 0 || Number.isNaN(betStake);

  const handleRequestPlace = () => {
    if (invalidStake) {
      addToast('warning', 'Invalid stake', 'Please enter a simulated stake greater than zero.');
      return;
    }
    if (!isPublicContext && insufficientBalance) {
      addToast(
        'error',
        'Insufficient demo balance',
        'Reduce your stake or submit a demo deposit request.'
      );
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmPlacement = () => {
    const res = placeDemoBet();
    if (res.ok) {
      addToast('success', 'Demo Bet Placed', res.message);
      if (isPublicContext) {
        setActiveRole('customer');
        navigate('/customer/bets');
      }
      onPlaced?.();
    } else {
      addToast('error', 'Unable to place demo bet', res.message);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-card border border-warm-border bg-soft-white">
      {/* Slip Header */}
      <div className="flex items-center justify-between border-b border-warm-border px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 text-forest" />
          <h3 className="font-heading text-sm font-semibold text-charcoal">
            Demo Bet Slip
          </h3>
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-forest px-1.5 text-[11px] font-semibold text-ivory tabular-nums">
            {betSlip.length}
          </span>
        </div>
        {betSlip.length > 0 && (
          <button
            type="button"
            onClick={clearBetSlip}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-grey hover:text-error"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Mode Switcher */}
      {betSlip.length > 1 && (
        <div className="grid grid-cols-2 gap-1 border-b border-warm-border bg-ivory/60 p-1.5">
          <button
            type="button"
            onClick={() => setBetMode('single')}
            className={`rounded-btn py-1.5 text-xs font-medium transition-colors ${
              isSingleMode
                ? 'bg-soft-white text-forest shadow-subtle'
                : 'text-muted-grey hover:text-charcoal'
            }`}
          >
            Singles ({betSlip.length})
          </button>
          <button
            type="button"
            onClick={() => setBetMode('multiple')}
            className={`rounded-btn py-1.5 text-xs font-medium transition-colors ${
              !isSingleMode
                ? 'bg-soft-white text-forest shadow-subtle'
                : 'text-muted-grey hover:text-charcoal'
            }`}
          >
            Multiple ({formatOdds(combinedOdds)})
          </button>
        </div>
      )}

      {/* Selections */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {betSlip.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-ivory text-muted-grey">
              <Ticket className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-charcoal">Your bet slip is empty</p>
            <p className="mt-1 max-w-[220px] text-xs text-muted-grey">
              Click any available odds across live or upcoming events to build a simulated wager.
            </p>
          </div>
        ) : (
          betSlip.map((sel) => (
            <div
              key={sel.id}
              className="rounded-card border border-warm-border bg-ivory/45 p-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-forest">{sel.outcomeLabel}</p>
                  <p className="mt-0.5 text-[11px] text-muted-grey">{sel.marketName}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="rounded bg-soft-white px-2 py-0.5 text-xs font-semibold text-charcoal border border-warm-border tabular-nums">
                    {formatOdds(sel.odds)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeBetSelection(sel.id)}
                    aria-label={`Remove ${sel.outcomeLabel}`}
                    className="rounded p-1 text-muted-grey hover:bg-soft-white hover:text-error"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <p className="mt-2 truncate text-[11px] font-medium text-charcoal">
                {sel.eventLabel}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Stake & Summary */}
      {betSlip.length > 0 && (
        <div className="border-t border-warm-border bg-ivory/50 p-4 space-y-3.5">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label htmlFor="demo-stake-input" className="font-medium text-charcoal">
                {isSingleMode && betSlip.length > 1 ? 'Stake per selection' : 'Simulated stake'}
              </label>
              <span className="text-muted-grey tabular-nums">
                Demo bal: {formatCurrency(availableBalance, currency)}
              </span>
            </div>
            <div className="relative">
              <input
                id="demo-stake-input"
                type="number"
                min={1}
                step="1"
                value={betStake || ''}
                onChange={(e) => setBetStake(parseFloat(e.target.value) || 0)}
                className="h-11 w-full rounded-btn border border-warm-border bg-soft-white px-3.5 pr-16 text-sm font-semibold text-charcoal tabular-nums focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-grey">
                {currency}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {PRESET_STAKES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setBetStake(preset)}
                  className={`rounded-btn border py-1.5 text-xs font-medium tabular-nums transition-colors ${
                    betStake === preset
                      ? 'border-forest bg-forest-light text-forest'
                      : 'border-warm-border bg-soft-white text-charcoal hover:border-sage'
                  }`}
                >
                  {formatCurrency(preset, currency).replace('.00', '')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 rounded-card border border-warm-border bg-soft-white p-3 text-xs">
            <div className="flex items-center justify-between text-muted-grey">
              <span>Total simulated stake</span>
              <span className="font-medium text-charcoal tabular-nums">
                {formatCurrency(totalStake, currency)}
              </span>
            </div>
            {!isSingleMode && (
              <div className="flex items-center justify-between text-muted-grey">
                <span>Combined odds</span>
                <span className="font-medium text-charcoal tabular-nums">
                  {formatOdds(combinedOdds)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-muted-grey">
              <span>Potential profit</span>
              <span className="font-medium text-success tabular-nums">
                +{formatCurrency(potentialProfit, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-warm-border pt-2 font-semibold text-charcoal">
              <span>Potential return</span>
              <span className="text-sm text-forest tabular-nums">
                {formatCurrency(potentialReturn, currency)}
              </span>
            </div>
          </div>

          {insufficientBalance && (
            <p className="flex items-center gap-1.5 text-xs text-error">
              <Info className="h-3.5 w-3.5 shrink-0" />
              Exceeds Alex&apos;s simulated balance ({formatCurrency(availableBalance, currency)}).
            </p>
          )}

          <Button
            variant="primary"
            fullWidth
            onClick={handleRequestPlace}
            disabled={invalidStake || insufficientBalance}
          >
            <CheckCircle2 className="h-4 w-4" />
            Place Demo Bet
          </Button>

          <p className="text-center text-[10px] text-muted-grey">
            Simulated wager only. Deducts from demo balance ({activeCustomer?.name || 'Alex Mercer'}).
          </p>
        </div>
      )}

      <ConfirmationDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmPlacement}
        title="Confirm Simulated Bet Placement"
        description={
          isPublicContext
            ? `You are about to place this simulated bet in Alex Mercer's Customer Demo account and open My Bets.`
            : `Review your simulated selection summary before deducting from your demo wallet.`
        }
        confirmLabel="Confirm Demo Bet"
        details={[
          {
            label: 'Mode',
            value: isSingleMode ? `Singles (${betSlip.length})` : `Multiple (${betSlip.length}-fold)`,
          },
          {
            label: 'Total Demo Stake',
            value: formatCurrency(totalStake, currency),
          },
          {
            label: 'Potential Return',
            value: formatCurrency(potentialReturn, currency),
          },
          {
            label: 'Potential Profit',
            value: formatCurrency(potentialProfit, currency),
          },
        ]}
      />
    </div>
  );
};

