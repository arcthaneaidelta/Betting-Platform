import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ActivityLog,
  AccountStatus,
  AdminUser,
  Agent,
  BetMode,
  BetSelection,
  BettingMarket,
  CommissionRecord,
  Customer,
  DemoBet,
  DepositMethod,
  DepositRequest,
  Match,
  MatchStatus,
  PlatformSettings,
  Role,
  ToastItem,
  ToastType,
  Transaction,
} from '@/types';
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_ADMIN,
  INITIAL_AGENTS,
  INITIAL_COMMISSIONS,
  INITIAL_CUSTOMERS,
  INITIAL_DEMO_BETS,
  INITIAL_DEPOSIT_REQUESTS,
  INITIAL_MATCHES,
  INITIAL_SETTINGS,
  INITIAL_TRANSACTIONS,
} from '@/data/mockData';
import { generateReference } from '@/utils/formatters';

interface ActionResult {
  ok: boolean;
  message: string;
}

interface AurelState {
  activeRole: Role;
  activeCustomerId: string;
  activeAgentId: string;
  hideBalance: boolean;

  admin: AdminUser;
  agents: Agent[];
  customers: Customer[];
  matches: Match[];
  demoBets: DemoBet[];
  depositRequests: DepositRequest[];
  transactions: Transaction[];
  commissions: CommissionRecord[];
  activityLogs: ActivityLog[];
  settings: PlatformSettings;

  // Bet slip state
  betSlip: BetSelection[];
  betMode: BetMode;
  betStake: number;
  publicSlipOpen: boolean;

  // Ephemeral UI feedback (not persisted across refresh)
  toasts: ToastItem[];
  demoLimitationsModalOpen: boolean;

  // UI Actions
  setActiveRole: (role: Role) => void;
  setActiveCustomerId: (customerId: string) => void;
  setActiveAgentId: (agentId: string) => void;
  toggleHideBalance: () => void;
  setPublicSlipOpen: (open: boolean) => void;
  setDemoLimitationsModalOpen: (open: boolean) => void;
  addToast: (type: ToastType, title: string, message?: string) => void;
  dismissToast: (id: string) => void;

  // Bet slip actions
  toggleBetSelection: (selection: BetSelection, mutuallyExclusive?: boolean) => void;
  removeBetSelection: (selectionId: string) => void;
  clearBetSlip: () => void;
  setBetMode: (mode: BetMode) => void;
  setBetStake: (stake: number) => void;
  placeDemoBet: () => ActionResult;

  // Deposit actions
  submitDepositRequest: (payload: {
    customerId: string;
    amount: number;
    method: DepositMethod;
    reference?: string;
    note?: string;
  }) => ActionResult;
  cancelDepositRequest: (requestId: string, actorCustomerId: string) => ActionResult;
  approveDepositRequest: (requestId: string, actorRole: 'agent' | 'admin', actorId: string) => ActionResult;
  rejectDepositRequest: (
    requestId: string,
    actorRole: 'agent' | 'admin',
    actorId: string,
    reason?: string
  ) => ActionResult;

  // Customer management actions
  createCustomer: (
    payload: {
      name: string;
      username: string;
      email: string;
      phone: string;
      agentId: string;
      initialBalance: number;
      status: AccountStatus;
    },
    actorRole: 'agent' | 'admin',
    actorId: string
  ) => ActionResult;
  updateCustomer: (
    customerId: string,
    updates: Partial<Pick<Customer, 'name' | 'email' | 'phone' | 'agentId' | 'status'>>,
    actorRole: 'agent' | 'admin' | 'customer',
    actorName: string
  ) => ActionResult;
  toggleCustomerStatus: (customerId: string, actorRole: 'agent' | 'admin', actorId: string) => ActionResult;
  updateCustomerResponsibleSettings: (
    customerId: string,
    settings: Partial<Customer['responsibleSettings']>
  ) => void;
  updateCustomerNotifications: (
    customerId: string,
    prefs: Partial<Customer['notificationPreferences']>
  ) => void;

  // Agent management actions
  createAgent: (payload: {
    name: string;
    username: string;
    email: string;
    phone: string;
    region: string;
    initialAllocation: number;
    commissionRate: number;
    status: AccountStatus;
  }) => ActionResult;
  updateAgent: (
    agentId: string,
    updates: Partial<Pick<Agent, 'name' | 'email' | 'phone' | 'region' | 'commissionRate' | 'status'>>
  ) => ActionResult;
  toggleAgentStatus: (agentId: string) => ActionResult;

  // Wallet & Treasury actions
  allocateAgentFunds: (agentId: string, amount: number, note?: string) => ActionResult;
  distributeAgentCredits: (
    agentId: string,
    customerId: string,
    amount: number,
    note?: string
  ) => ActionResult;
  adjustCustomerWallet: (
    customerId: string,
    amountDelta: number,
    reason: string
  ) => ActionResult;

  // Sports & Events admin actions
  addMatch: (match: Omit<Match, 'id'>) => ActionResult;
  updateMatch: (matchId: string, updates: Partial<Match>) => ActionResult;
  updateMatchStatus: (matchId: string, status: MatchStatus, minute?: string) => void;
  toggleMatchFeatured: (matchId: string) => void;
  updateMarketOptionOdds: (matchId: string, marketId: string, optionId: string, odds: number) => void;
  addMarketToMatch: (matchId: string, market: BettingMarket) => void;
  removeMarketFromMatch: (matchId: string, marketId: string) => void;

  // Commission & Platform Settings
  updateDefaultCommissionRate: (rate: number) => void;
  updateAgentCommissionRate: (agentId: string, rate: number) => void;
  updateSettings: (updates: Partial<PlatformSettings>) => void;

  // Demo Reset
  resetDemoData: () => void;
}

const getInitialPersistedData = () => ({
  activeRole: 'public' as Role,
  activeCustomerId: 'CUS-1001',
  activeAgentId: 'AGT-101',
  hideBalance: false,
  admin: INITIAL_ADMIN,
  agents: INITIAL_AGENTS,
  customers: INITIAL_CUSTOMERS,
  matches: INITIAL_MATCHES,
  demoBets: INITIAL_DEMO_BETS,
  depositRequests: INITIAL_DEPOSIT_REQUESTS,
  transactions: INITIAL_TRANSACTIONS,
  commissions: INITIAL_COMMISSIONS,
  activityLogs: INITIAL_ACTIVITY_LOGS,
  settings: INITIAL_SETTINGS,
  betSlip: [] as BetSelection[],
  betMode: 'single' as BetMode,
  betStake: 50,
  publicSlipOpen: false,
});

export const useAurelStore = create<AurelState>()(
  persist(
    (set, get) => ({
      ...getInitialPersistedData(),
      toasts: [],
      demoLimitationsModalOpen: false,

      setActiveRole: (role) => set({ activeRole: role }),
      setActiveCustomerId: (customerId) => set({ activeCustomerId: customerId }),
      setActiveAgentId: (agentId) => set({ activeAgentId: agentId }),
      toggleHideBalance: () => set((s) => ({ hideBalance: !s.hideBalance })),
      setPublicSlipOpen: (open) => set({ publicSlipOpen: open }),
      setDemoLimitationsModalOpen: (open) => set({ demoLimitationsModalOpen: open }),

      addToast: (type, title, message) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((s) => ({ toasts: [...s.toasts, { id, type, title, message }] }));
        setTimeout(() => {
          get().dismissToast(id);
        }, 4200);
      },

      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      toggleBetSelection: (selection, mutuallyExclusive = true) => {
        const current = get().betSlip;
        const exists = current.some((item) => item.id === selection.id);
        if (exists) {
          set({ betSlip: current.filter((item) => item.id !== selection.id) });
          return;
        }
        let filtered = current;
        if (mutuallyExclusive) {
          filtered = current.filter(
            (item) => !(item.matchId === selection.matchId && item.marketId === selection.marketId)
          );
        }
        const nextSlip = [...filtered, selection];
        set({
          betSlip: nextSlip,
          betMode: nextSlip.length > 1 ? get().betMode : 'single',
        });
      },

      removeBetSelection: (selectionId) =>
        set((s) => {
          const nextSlip = s.betSlip.filter((item) => item.id !== selectionId);
          return {
            betSlip: nextSlip,
            betMode: nextSlip.length <= 1 ? 'single' : s.betMode,
          };
        }),

      clearBetSlip: () => set({ betSlip: [], betMode: 'single' }),
      setBetMode: (mode) => set({ betMode: mode }),
      setBetStake: (stake) => set({ betStake: Math.max(0, stake) }),

      placeDemoBet: () => {
        const state = get();
        const customer = state.customers.find((c) => c.id === state.activeCustomerId);
        if (!customer) {
          return { ok: false, message: 'Active demo customer account not found.' };
        }
        if (customer.status === 'suspended') {
          return { ok: false, message: 'This demo account is currently suspended.' };
        }
        if (customer.responsibleSettings.selfExcluded) {
          return { ok: false, message: 'Demo self-exclusion is currently active on this account.' };
        }
        if (state.betSlip.length === 0) {
          return { ok: false, message: 'Add at least one selection to your bet slip.' };
        }
        if (state.betStake <= 0 || Number.isNaN(state.betStake)) {
          return { ok: false, message: 'Enter a valid simulated stake amount.' };
        }

        const isSingleMode = state.betMode === 'single' || state.betSlip.length === 1;
        const totalStakeRequired = isSingleMode
          ? state.betStake * state.betSlip.length
          : state.betStake;

        if (totalStakeRequired > customer.walletBalance) {
          return {
            ok: false,
            message: 'Simulated stake exceeds your available demo balance.',
          };
        }
        if (totalStakeRequired > customer.responsibleSettings.dailyStakeLimit) {
          return {
            ok: false,
            message: `Stake exceeds your configured demo daily limit ($${customer.responsibleSettings.dailyStakeLimit.toFixed(2)}).`,
          };
        }

        const now = new Date().toISOString();
        let runningBalance = customer.walletBalance;
        const newBets: DemoBet[] = [];
        const newTxns: Transaction[] = [];
        const newLogs: ActivityLog[] = [];

        if (isSingleMode) {
          state.betSlip.forEach((sel) => {
            const betRef = generateReference('ARL-B');
            const potReturn = Number((state.betStake * sel.odds).toFixed(2));
            const potProfit = Number((potReturn - state.betStake).toFixed(2));
            newBets.push({
              id: `BET-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              reference: betRef,
              customerId: customer.id,
              customerName: customer.name,
              mode: 'single',
              selections: [sel],
              totalOdds: sel.odds,
              stake: state.betStake,
              potentialReturn: potReturn,
              potentialProfit: potProfit,
              status: 'open',
              placedAt: now,
              sport: sel.sport,
            });

            const prev = runningBalance;
            runningBalance = Number((runningBalance - state.betStake).toFixed(2));
            newTxns.push({
              id: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              reference: generateReference('TRX'),
              accountId: customer.id,
              accountName: customer.name,
              accountType: 'customer',
              type: 'demo_bet_stake',
              description: `Demo bet placed: ${sel.outcomeLabel} (${betRef})`,
              amount: -state.betStake,
              previousBalance: prev,
              newBalance: runningBalance,
              relatedRequestId: betRef,
              initiatedBy: customer.name,
              createdAt: now,
              status: 'completed',
            });
            newLogs.push({
              id: `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
              actorName: customer.name,
              actorRole: 'customer',
              actorId: customer.id,
              agentId: customer.agentId,
              action: 'Demo bet placed',
              module: 'Betting',
              description: `Placed single demo bet ${betRef} ($${state.betStake.toFixed(2)} at ${sel.odds.toFixed(2)}).`,
              timestamp: now,
            });
          });
        } else {
          const combinedOdds = Number(
            state.betSlip.reduce((acc, s) => acc * s.odds, 1).toFixed(2)
          );
          const potReturn = Number((state.betStake * combinedOdds).toFixed(2));
          const potProfit = Number((potReturn - state.betStake).toFixed(2));
          const betRef = generateReference('ARL-B');

          newBets.push({
            id: `BET-${Date.now()}`,
            reference: betRef,
            customerId: customer.id,
            customerName: customer.name,
            mode: 'multiple',
            selections: state.betSlip,
            totalOdds: combinedOdds,
            stake: state.betStake,
            potentialReturn: potReturn,
            potentialProfit: potProfit,
            status: 'open',
            placedAt: now,
            sport: state.betSlip[0].sport,
          });

          const prev = runningBalance;
          runningBalance = Number((runningBalance - state.betStake).toFixed(2));
          newTxns.push({
            id: `TXN-${Date.now()}`,
            reference: generateReference('TRX'),
            accountId: customer.id,
            accountName: customer.name,
            accountType: 'customer',
            type: 'demo_bet_stake',
            description: `Multiple bet placed: ${state.betSlip.length} Selections (${betRef})`,
            amount: -state.betStake,
            previousBalance: prev,
            newBalance: runningBalance,
            relatedRequestId: betRef,
            initiatedBy: customer.name,
            createdAt: now,
            status: 'completed',
          });
          newLogs.push({
            id: `ACT-${Date.now()}`,
            actorName: customer.name,
            actorRole: 'customer',
            actorId: customer.id,
            agentId: customer.agentId,
            action: 'Demo bet placed',
            module: 'Betting',
            description: `Placed ${state.betSlip.length}-fold multiple demo bet ${betRef} ($${state.betStake.toFixed(2)} at ${combinedOdds.toFixed(2)}).`,
            timestamp: now,
          });
        }

        set({
          customers: state.customers.map((c) =>
            c.id === customer.id
              ? { ...c, walletBalance: runningBalance, lastActivityAt: now }
              : c
          ),
          demoBets: [...newBets, ...state.demoBets],
          transactions: [...newTxns, ...state.transactions],
          activityLogs: [...newLogs, ...state.activityLogs],
          betSlip: [],
          betMode: 'single',
        });

        return {
          ok: true,
          message:
            newBets.length > 1
              ? `${newBets.length} simulated bets placed successfully.`
              : `Demo bet ${newBets[0].reference} placed successfully.`,
        };
      },

      submitDepositRequest: ({ customerId, amount, method, reference, note }) => {
        const state = get();
        const customer = state.customers.find((c) => c.id === customerId);
        if (!customer) {
          return { ok: false, message: 'Customer account not found.' };
        }
        if (amount <= 0 || Number.isNaN(amount)) {
          return { ok: false, message: 'Enter a valid deposit request amount.' };
        }
        const agent = state.agents.find((a) => a.id === customer.agentId);
        const now = new Date().toISOString();
        const reqRef = reference?.trim() || generateReference('REQ');

        const newReq: DepositRequest = {
          id: `DEP-${Date.now()}`,
          reference: reqRef,
          customerId: customer.id,
          customerName: customer.name,
          agentId: customer.agentId,
          agentName: agent?.name || 'Unassigned',
          amount: Number(amount.toFixed(2)),
          method,
          note: note?.trim() || undefined,
          status: 'pending',
          submittedAt: now,
        };

        const pendingTxn: Transaction = {
          id: `TXN-${Date.now()}`,
          reference: generateReference('TRX'),
          accountId: customer.id,
          accountName: customer.name,
          accountType: 'customer',
          type: 'demo_deposit',
          description: `Pending ${method} (${reqRef})`,
          amount: Number(amount.toFixed(2)),
          previousBalance: customer.walletBalance,
          newBalance: customer.walletBalance,
          relatedRequestId: reqRef,
          initiatedBy: customer.name,
          createdAt: now,
          status: 'pending',
        };

        const log: ActivityLog = {
          id: `ACT-${Date.now()}`,
          actorName: customer.name,
          actorRole: 'customer',
          actorId: customer.id,
          agentId: customer.agentId,
          action: 'Deposit request submitted',
          module: 'Deposits',
          description: `${customer.name} submitted simulated deposit request ${reqRef} for $${amount.toFixed(2)}.`,
          timestamp: now,
        };

        set({
          depositRequests: [newReq, ...state.depositRequests],
          transactions: [pendingTxn, ...state.transactions],
          activityLogs: [log, ...state.activityLogs],
        });

        return { ok: true, message: `Deposit request ${reqRef} submitted for review.` };
      },

      cancelDepositRequest: (requestId, actorCustomerId) => {
        const state = get();
        const req = state.depositRequests.find((r) => r.id === requestId);
        if (!req || req.customerId !== actorCustomerId) {
          return { ok: false, message: 'Deposit request not found.' };
        }
        if (req.status !== 'pending') {
          return { ok: false, message: 'Only pending requests can be cancelled.' };
        }
        const now = new Date().toISOString();
        set({
          depositRequests: state.depositRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'cancelled', reviewedAt: now, reviewedBy: req.customerName } : r
          ),
          transactions: state.transactions.map((t) =>
            t.relatedRequestId === req.reference && t.status === 'pending'
              ? { ...t, status: 'cancelled', description: `Cancelled deposit request (${req.reference})` }
              : t
          ),
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: req.customerName,
              actorRole: 'customer',
              actorId: req.customerId,
              agentId: req.agentId,
              action: 'Deposit request cancelled',
              module: 'Deposits',
              description: `${req.customerName} cancelled pending request ${req.reference}.`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });
        return { ok: true, message: `Request ${req.reference} cancelled.` };
      },

      approveDepositRequest: (requestId, actorRole, actorId) => {
        const state = get();
        const req = state.depositRequests.find((r) => r.id === requestId);
        if (!req) return { ok: false, message: 'Deposit request not found.' };

        // Business Rule 4: Cannot approve more than once
        if (req.status !== 'pending') {
          return {
            ok: false,
            message: `Safeguard triggered: Request ${req.reference} is already ${req.status}.`,
          };
        }

        // Business Rule 1: Agent can only manage assigned customers
        if (actorRole === 'agent' && req.agentId !== actorId) {
          return {
            ok: false,
            message: 'Access restricted: Agents can only approve requests for assigned customers.',
          };
        }

        const customer = state.customers.find((c) => c.id === req.customerId);
        const agent = state.agents.find((a) => a.id === req.agentId);
        if (!customer) return { ok: false, message: 'Customer record not found.' };

        const actorName =
          actorRole === 'admin'
            ? state.admin.name
            : state.agents.find((a) => a.id === actorId)?.name || 'Agent';

        const now = new Date().toISOString();
        const prevBalance = customer.walletBalance;
        const newBalance = Number((prevBalance + req.amount).toFixed(2));

        // Illustrative commission calculation using configured demo rate (Rule 10)
        const commRate = agent ? agent.commissionRate : state.settings.defaultCommissionRate;
        const commAmount = Number(((req.amount * commRate) / 100).toFixed(2));
        const newCommission: CommissionRecord | null = agent
          ? {
              id: `COM-${Date.now()}`,
              reference: generateReference('COM'),
              agentId: agent.id,
              agentName: agent.name,
              customerId: customer.id,
              customerName: customer.name,
              activityReference: req.reference,
              baseAmount: req.amount,
              rate: commRate,
              amount: commAmount,
              status: 'approved',
              createdAt: now,
            }
          : null;

        const approvalTxn: Transaction = {
          id: `TXN-${Date.now()}`,
          reference: generateReference('TRX'),
          accountId: customer.id,
          accountName: customer.name,
          accountType: 'customer',
          type: 'demo_deposit',
          description: `Approved ${req.method} (${req.reference})`,
          amount: req.amount,
          previousBalance: prevBalance,
          newBalance,
          relatedRequestId: req.reference,
          initiatedBy: actorName,
          createdAt: now,
          status: 'completed',
        };

        const logs: ActivityLog[] = [
          {
            id: `ACT-${Date.now()}`,
            actorName,
            actorRole,
            actorId,
            agentId: req.agentId,
            action: 'Deposit approved',
            module: 'Deposits',
            description: `${actorName} approved ${req.reference} ($${req.amount.toFixed(2)}) for ${customer.name}.`,
            timestamp: now,
          },
        ];

        if (newCommission) {
          logs.unshift({
            id: `ACT-${Date.now()}-c`,
            actorName,
            actorRole,
            actorId,
            agentId: req.agentId,
            action: 'Commission recorded',
            module: 'Commissions',
            description: `Illustrative commission ${newCommission.reference} ($${commAmount.toFixed(2)} at ${commRate}%) recorded for ${agent?.name}.`,
            timestamp: now,
          });
        }

        // Remove pending transaction placeholder or update it cleanly
        const updatedTxns = state.transactions.filter(
          (t) => !(t.relatedRequestId === req.reference && t.status === 'pending')
        );

        set({
          depositRequests: state.depositRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'approved', reviewedAt: now, reviewedBy: actorName }
              : r
          ),
          customers: state.customers.map((c) =>
            c.id === customer.id
              ? { ...c, walletBalance: newBalance, lastActivityAt: now }
              : c
          ),
          agents: agent
            ? state.agents.map((a) =>
                a.id === agent.id
                  ? {
                      ...a,
                      totalCommissionEarned: Number((a.totalCommissionEarned + commAmount).toFixed(2)),
                    }
                  : a
              )
            : state.agents,
          commissions: newCommission ? [newCommission, ...state.commissions] : state.commissions,
          transactions: [approvalTxn, ...updatedTxns],
          activityLogs: [...logs, ...state.activityLogs],
        });

        return {
          ok: true,
          message: `Deposit ${req.reference} approved. ${customer.name}'s simulated balance updated.`,
        };
      },

      rejectDepositRequest: (requestId, actorRole, actorId, reason) => {
        const state = get();
        const req = state.depositRequests.find((r) => r.id === requestId);
        if (!req) return { ok: false, message: 'Deposit request not found.' };
        if (req.status !== 'pending') {
          return { ok: false, message: `Request ${req.reference} is already ${req.status}.` };
        }
        if (actorRole === 'agent' && req.agentId !== actorId) {
          return { ok: false, message: 'Access restricted to assigned customers.' };
        }

        const actorName =
          actorRole === 'admin'
            ? state.admin.name
            : state.agents.find((a) => a.id === actorId)?.name || 'Agent';

        const now = new Date().toISOString();

        // Business Rule 5: Rejected deposits NEVER credit wallet
        set({
          depositRequests: state.depositRequests.map((r) =>
            r.id === requestId
              ? {
                  ...r,
                  status: 'rejected',
                  reviewedAt: now,
                  reviewedBy: actorName,
                  rejectionReason: reason?.trim() || 'Declined during demo review',
                }
              : r
          ),
          transactions: state.transactions.map((t) =>
            t.relatedRequestId === req.reference && t.status === 'pending'
              ? { ...t, status: 'rejected', description: `Rejected deposit request (${req.reference})` }
              : t
          ),
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName,
              actorRole,
              actorId,
              agentId: req.agentId,
              action: 'Deposit rejected',
              module: 'Deposits',
              description: `${actorName} rejected deposit request ${req.reference} ($${req.amount.toFixed(2)}).`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });

        return { ok: true, message: `Deposit request ${req.reference} rejected.` };
      },

      createCustomer: (payload, actorRole, actorId) => {
        const state = get();
        const normalizedUsername = payload.username.trim().toLowerCase();
        const usernameTaken =
          state.customers.some((c) => c.username.toLowerCase() === normalizedUsername) ||
          state.agents.some((a) => a.username.toLowerCase() === normalizedUsername);

        if (usernameTaken) {
          return { ok: false, message: `Username "${payload.username}" is already in use.` };
        }

        if (actorRole === 'agent') {
          const agent = state.agents.find((a) => a.id === actorId);
          if (!agent) return { ok: false, message: 'Agent account not found.' };
          if (payload.initialBalance > agent.walletBalance) {
            return {
              ok: false,
              message: 'Initial demo balance exceeds your available agent wallet balance.',
            };
          }
        }

        const now = new Date().toISOString();
        const nextNum = 1001 + state.customers.length;
        const newId = `CUS-${nextNum}`;
        const actorName =
          actorRole === 'admin'
            ? state.admin.name
            : state.agents.find((a) => a.id === actorId)?.name || 'Agent';

        const newCustomer: Customer = {
          id: newId,
          name: payload.name.trim(),
          username: normalizedUsername,
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          agentId: payload.agentId,
          walletBalance: Number(payload.initialBalance.toFixed(2)),
          status: payload.status,
          registeredAt: now,
          lastActivityAt: now,
          responsibleSettings: {
            dailyStakeLimit: state.settings.defaultDailyLimit,
            weeklyDepositLimit: state.settings.defaultDailyLimit * 4,
            selfExcluded: false,
            sessionAlerts: true,
          },
          notificationPreferences: {
            betSettlement: true,
            depositUpdates: true,
            matchReminders: true,
            platformAnnouncements: false,
          },
        };

        const txnsToAdd: Transaction[] = [];
        let updatedAgents = state.agents;

        if (payload.initialBalance > 0) {
          if (actorRole === 'agent') {
            const agent = state.agents.find((a) => a.id === actorId)!;
            const prevAgentBal = agent.walletBalance;
            const newAgentBal = Number((prevAgentBal - payload.initialBalance).toFixed(2));
            updatedAgents = state.agents.map((a) =>
              a.id === agent.id ? { ...a, walletBalance: newAgentBal } : a
            );
            txnsToAdd.push({
              id: `TXN-${Date.now()}-a`,
              reference: generateReference('TRX'),
              accountId: agent.id,
              accountName: agent.name,
              accountType: 'agent',
              type: 'agent_distribution',
              description: `Initial demo allocation to new customer ${newCustomer.name}`,
              amount: -payload.initialBalance,
              previousBalance: prevAgentBal,
              newBalance: newAgentBal,
              initiatedBy: agent.name,
              createdAt: now,
              status: 'completed',
            });
          }

          txnsToAdd.push({
            id: `TXN-${Date.now()}-c`,
            reference: generateReference('TRX'),
            accountId: newCustomer.id,
            accountName: newCustomer.name,
            accountType: 'customer',
            type: 'demo_deposit',
            description: 'Initial onboarding demo balance',
            amount: payload.initialBalance,
            previousBalance: 0,
            newBalance: payload.initialBalance,
            initiatedBy: actorName,
            createdAt: now,
            status: 'completed',
          });
        }

        set({
          customers: [newCustomer, ...state.customers],
          agents: updatedAgents,
          transactions: [...txnsToAdd, ...state.transactions],
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName,
              actorRole,
              actorId,
              agentId: payload.agentId,
              action: 'Customer added',
              module: 'Customers',
              description: `Onboarded demo customer ${newCustomer.name} (${newId}) with initial balance $${payload.initialBalance.toFixed(2)}.`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });

        return { ok: true, message: `Customer ${newCustomer.name} (${newId}) created.` };
      },

      updateCustomer: (customerId, updates, actorRole, actorName) => {
        const state = get();
        const existing = state.customers.find((c) => c.id === customerId);
        if (!existing) return { ok: false, message: 'Customer not found.' };
        const now = new Date().toISOString();

        const agentReassigned = updates.agentId && updates.agentId !== existing.agentId;
        const targetAgentName = agentReassigned
          ? state.agents.find((a) => a.id === updates.agentId)?.name || updates.agentId
          : '';

        set({
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, ...updates } : c
          ),
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName,
              actorRole,
              actorId: customerId,
              agentId: updates.agentId || existing.agentId,
              action: agentReassigned ? 'Customer reassigned' : 'Account updated',
              module: 'Customers',
              description: agentReassigned
                ? `Reassigned ${existing.name} (${customerId}) to Agent ${targetAgentName}.`
                : `Updated profile details for ${existing.name} (${customerId}).`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });
        return { ok: true, message: `Updated ${existing.name}.` };
      },

      toggleCustomerStatus: (customerId, actorRole, actorId) => {
        const state = get();
        const customer = state.customers.find((c) => c.id === customerId);
        if (!customer) return { ok: false, message: 'Customer not found.' };
        if (actorRole === 'agent' && customer.agentId !== actorId) {
          return { ok: false, message: 'Access restricted to assigned customers.' };
        }
        const nextStatus: AccountStatus = customer.status === 'active' ? 'suspended' : 'active';
        const actorName =
          actorRole === 'admin'
            ? state.admin.name
            : state.agents.find((a) => a.id === actorId)?.name || 'Agent';
        const now = new Date().toISOString();

        set({
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, status: nextStatus } : c
          ),
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName,
              actorRole,
              actorId,
              agentId: customer.agentId,
              action: nextStatus === 'suspended' ? 'Account suspended' : 'Account activated',
              module: 'Customers',
              description: `${actorName} set demo account ${customer.name} (${customerId}) to ${nextStatus}.`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });

        return {
          ok: true,
          message: `${customer.name} is now ${nextStatus}.`,
        };
      },

      updateCustomerResponsibleSettings: (customerId, updates) =>
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === customerId
              ? { ...c, responsibleSettings: { ...c.responsibleSettings, ...updates } }
              : c
          ),
        })),

      updateCustomerNotifications: (customerId, prefs) =>
        set((s) => ({
          customers: s.customers.map((c) =>
            c.id === customerId
              ? { ...c, notificationPreferences: { ...c.notificationPreferences, ...prefs } }
              : c
          ),
        })),

      createAgent: (payload) => {
        const state = get();
        const normalized = payload.username.trim().toLowerCase();
        const taken =
          state.agents.some((a) => a.username.toLowerCase() === normalized) ||
          state.customers.some((c) => c.username.toLowerCase() === normalized);
        if (taken) {
          return { ok: false, message: `Username "${payload.username}" is already in use.` };
        }
        // Business Rule 9: Allocation cannot exceed admin treasury balance
        if (payload.initialAllocation > state.admin.platformTreasuryBalance) {
          return {
            ok: false,
            message: 'Initial demo allocation exceeds available platform treasury balance.',
          };
        }

        const now = new Date().toISOString();
        const nextId = `AGT-${101 + state.agents.length}`;
        const newAgent: Agent = {
          id: nextId,
          name: payload.name.trim(),
          username: normalized,
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          region: payload.region.trim(),
          walletBalance: Number(payload.initialAllocation.toFixed(2)),
          totalAllocated: Number(payload.initialAllocation.toFixed(2)),
          commissionRate: payload.commissionRate,
          totalCommissionEarned: 0,
          status: payload.status,
          joinedAt: now,
        };

        const txnsToAdd: Transaction[] = [];
        if (payload.initialAllocation > 0) {
          txnsToAdd.push({
            id: `TXN-${Date.now()}`,
            reference: generateReference('TRX'),
            accountId: nextId,
            accountName: newAgent.name,
            accountType: 'agent',
            type: 'agent_allocation',
            description: `Initial demo treasury allocation to ${newAgent.name}`,
            amount: payload.initialAllocation,
            previousBalance: 0,
            newBalance: payload.initialAllocation,
            initiatedBy: state.admin.name,
            createdAt: now,
            status: 'completed',
          });
        }

        set({
          agents: [newAgent, ...state.agents],
          admin: {
            ...state.admin,
            platformTreasuryBalance: Number(
              (state.admin.platformTreasuryBalance - payload.initialAllocation).toFixed(2)
            ),
          },
          transactions: [...txnsToAdd, ...state.transactions],
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: state.admin.name,
              actorRole: 'admin',
              actorId: state.admin.id,
              agentId: nextId,
              action: 'Agent created',
              module: 'Agents',
              description: `Created agent ${newAgent.name} (${nextId}) with ${payload.commissionRate}% commission and $${payload.initialAllocation.toFixed(2)} demo liquidity.`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });

        return { ok: true, message: `Agent ${newAgent.name} (${nextId}) created.` };
      },

      updateAgent: (agentId, updates) => {
        const state = get();
        const existing = state.agents.find((a) => a.id === agentId);
        if (!existing) return { ok: false, message: 'Agent not found.' };
        const now = new Date().toISOString();

        set({
          agents: state.agents.map((a) => (a.id === agentId ? { ...a, ...updates } : a)),
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: state.admin.name,
              actorRole: 'admin',
              actorId: state.admin.id,
              agentId,
              action: 'Agent updated',
              module: 'Agents',
              description: `Updated operational profile for Agent ${existing.name} (${agentId}).`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });
        return { ok: true, message: `Updated Agent ${existing.name}.` };
      },

      toggleAgentStatus: (agentId) => {
        const state = get();
        const existing = state.agents.find((a) => a.id === agentId);
        if (!existing) return { ok: false, message: 'Agent not found.' };
        const nextStatus: AccountStatus = existing.status === 'active' ? 'suspended' : 'active';
        const now = new Date().toISOString();

        set({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, status: nextStatus } : a
          ),
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: state.admin.name,
              actorRole: 'admin',
              actorId: state.admin.id,
              agentId,
              action: nextStatus === 'active' ? 'Agent activated' : 'Agent deactivated',
              module: 'Agents',
              description: `${state.admin.name} set Agent ${existing.name} (${agentId}) to ${nextStatus}.`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });

        return { ok: true, message: `Agent ${existing.name} is now ${nextStatus}.` };
      },

      allocateAgentFunds: (agentId, amount, note) => {
        const state = get();
        const agent = state.agents.find((a) => a.id === agentId);
        if (!agent) return { ok: false, message: 'Agent not found.' };
        if (amount <= 0 || Number.isNaN(amount)) {
          return { ok: false, message: 'Enter a positive allocation amount.' };
        }
        // Business Rule 9
        if (amount > state.admin.platformTreasuryBalance) {
          return {
            ok: false,
            message: 'Allocation exceeds simulated available platform treasury balance.',
          };
        }

        const now = new Date().toISOString();
        const prevAgentBal = agent.walletBalance;
        const newAgentBal = Number((prevAgentBal + amount).toFixed(2));
        const ref = generateReference('TRX');

        const txn: Transaction = {
          id: `TXN-${Date.now()}`,
          reference: ref,
          accountId: agent.id,
          accountName: agent.name,
          accountType: 'agent',
          type: 'agent_allocation',
          description: note?.trim()
            ? `Treasury allocation: ${note.trim()}`
            : `Treasury demo funds allocated to ${agent.name}`,
          amount,
          previousBalance: prevAgentBal,
          newBalance: newAgentBal,
          initiatedBy: state.admin.name,
          createdAt: now,
          status: 'completed',
        };

        set({
          admin: {
            ...state.admin,
            platformTreasuryBalance: Number(
              (state.admin.platformTreasuryBalance - amount).toFixed(2)
            ),
          },
          agents: state.agents.map((a) =>
            a.id === agentId
              ? {
                  ...a,
                  walletBalance: newAgentBal,
                  totalAllocated: Number((a.totalAllocated + amount).toFixed(2)),
                }
              : a
          ),
          transactions: [txn, ...state.transactions],
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: state.admin.name,
              actorRole: 'admin',
              actorId: state.admin.id,
              agentId: agent.id,
              action: 'Demo funds allocated',
              module: 'Wallets',
              description: `Allocated $${amount.toFixed(2)} in simulated operational funds to ${agent.name} (${ref}).`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });

        return { ok: true, message: `Allocated $${amount.toFixed(2)} to ${agent.name}.` };
      },

      distributeAgentCredits: (agentId, customerId, amount, note) => {
        const state = get();
        const agent = state.agents.find((a) => a.id === agentId);
        const customer = state.customers.find((c) => c.id === customerId);
        if (!agent || !customer) return { ok: false, message: 'Account not found.' };
        if (customer.agentId !== agent.id) {
          return { ok: false, message: 'You can only distribute credits to assigned customers.' };
        }
        if (amount <= 0 || Number.isNaN(amount)) {
          return { ok: false, message: 'Enter a positive credit amount.' };
        }
        if (amount > agent.walletBalance) {
          return {
            ok: false,
            message: 'Distribution exceeds your available simulated agent wallet balance.',
          };
        }

        const now = new Date().toISOString();
        const prevAgent = agent.walletBalance;
        const nextAgent = Number((prevAgent - amount).toFixed(2));
        const prevCust = customer.walletBalance;
        const nextCust = Number((prevCust + amount).toFixed(2));
        const ref = generateReference('TRX');

        const agentTxn: Transaction = {
          id: `TXN-${Date.now()}-a`,
          reference: ref,
          accountId: agent.id,
          accountName: agent.name,
          accountType: 'agent',
          type: 'agent_distribution',
          description: note?.trim()
            ? `Distributed to ${customer.name}: ${note.trim()}`
            : `Demo credit distribution to ${customer.name}`,
          amount: -amount,
          previousBalance: prevAgent,
          newBalance: nextAgent,
          initiatedBy: agent.name,
          createdAt: now,
          status: 'completed',
        };

        const custTxn: Transaction = {
          id: `TXN-${Date.now()}-c`,
          reference: generateReference('TRX'),
          accountId: customer.id,
          accountName: customer.name,
          accountType: 'customer',
          type: 'demo_deposit',
          description: note?.trim()
            ? `Agent credit from ${agent.name}: ${note.trim()}`
            : `Agent-assisted demo credit from ${agent.name}`,
          amount,
          previousBalance: prevCust,
          newBalance: nextCust,
          relatedRequestId: ref,
          initiatedBy: agent.name,
          createdAt: now,
          status: 'completed',
        };

        set({
          agents: state.agents.map((a) =>
            a.id === agent.id ? { ...a, walletBalance: nextAgent } : a
          ),
          customers: state.customers.map((c) =>
            c.id === customer.id
              ? { ...c, walletBalance: nextCust, lastActivityAt: now }
              : c
          ),
          transactions: [custTxn, agentTxn, ...state.transactions],
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: agent.name,
              actorRole: 'agent',
              actorId: agent.id,
              agentId: agent.id,
              action: 'Demo credits distributed',
              module: 'Wallets',
              description: `${agent.name} distributed $${amount.toFixed(2)} from agent wallet to ${customer.name} (${ref}).`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });

        return { ok: true, message: `Distributed $${amount.toFixed(2)} to ${customer.name}.` };
      },

      adjustCustomerWallet: (customerId, amountDelta, reason) => {
        const state = get();
        const customer = state.customers.find((c) => c.id === customerId);
        if (!customer) return { ok: false, message: 'Customer not found.' };
        if (!reason.trim()) return { ok: false, message: 'Adjustment reason is required.' };
        if (amountDelta === 0 || Number.isNaN(amountDelta)) {
          return { ok: false, message: 'Adjustment amount cannot be zero.' };
        }
        const nextBalance = Number((customer.walletBalance + amountDelta).toFixed(2));
        if (nextBalance < 0) {
          return { ok: false, message: 'Adjustment would reduce customer balance below zero.' };
        }

        const now = new Date().toISOString();
        const ref = generateReference('TRX');

        const txn: Transaction = {
          id: `TXN-${Date.now()}`,
          reference: ref,
          accountId: customer.id,
          accountName: customer.name,
          accountType: 'customer',
          type: 'adjustment',
          description: `Admin adjustment: ${reason.trim()}`,
          amount: Number(amountDelta.toFixed(2)),
          previousBalance: customer.walletBalance,
          newBalance: nextBalance,
          initiatedBy: state.admin.name,
          createdAt: now,
          status: 'completed',
        };

        set({
          customers: state.customers.map((c) =>
            c.id === customer.id
              ? { ...c, walletBalance: nextBalance, lastActivityAt: now }
              : c
          ),
          transactions: [txn, ...state.transactions],
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: state.admin.name,
              actorRole: 'admin',
              actorId: state.admin.id,
              agentId: customer.agentId,
              action: 'Wallet adjusted',
              module: 'Wallets',
              description: `Adjusted ${customer.name}'s simulated balance by ${amountDelta >= 0 ? '+' : ''}$${amountDelta.toFixed(2)} (${reason.trim()}).`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });

        return { ok: true, message: `Wallet adjusted for ${customer.name} (${ref}).` };
      },

      addMatch: (matchData) => {
        const state = get();
        const id = `MCH-${201 + state.matches.length + Math.floor(Math.random() * 50)}`;
        const newMatch: Match = { ...matchData, id };
        const now = new Date().toISOString();

        set({
          matches: [newMatch, ...state.matches],
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: state.admin.name,
              actorRole: 'admin',
              actorId: state.admin.id,
              action: 'Event created',
              module: 'Sports',
              description: `Added fictional event ${newMatch.homeTeam.name} vs ${newMatch.awayTeam.name} (${newMatch.competition}).`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });
        return { ok: true, message: `Event ${newMatch.homeTeam.name} vs ${newMatch.awayTeam.name} added.` };
      },

      updateMatch: (matchId, updates) => {
        const state = get();
        const existing = state.matches.find((m) => m.id === matchId);
        if (!existing) return { ok: false, message: 'Event not found.' };
        const now = new Date().toISOString();

        set({
          matches: state.matches.map((m) => (m.id === matchId ? { ...m, ...updates } : m)),
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: state.admin.name,
              actorRole: 'admin',
              actorId: state.admin.id,
              action: 'Event updated',
              module: 'Sports',
              description: `Updated fixture settings for ${existing.homeTeam.name} vs ${existing.awayTeam.name}.`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });
        return { ok: true, message: 'Event updated.' };
      },

      updateMatchStatus: (matchId, status, minute) =>
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === matchId ? { ...m, status, minute: minute ?? m.minute } : m
          ),
        })),

      toggleMatchFeatured: (matchId) =>
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === matchId ? { ...m, featured: !m.featured } : m
          ),
        })),

      updateMarketOptionOdds: (matchId, marketId, optionId, odds) =>
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  markets: m.markets.map((mkt) =>
                    mkt.id === marketId
                      ? {
                          ...mkt,
                          options: mkt.options.map((opt) =>
                            opt.id === optionId ? { ...opt, odds: Math.max(1.01, odds) } : opt
                          ),
                        }
                      : mkt
                  ),
                }
              : m
          ),
        })),

      addMarketToMatch: (matchId, market) =>
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === matchId ? { ...m, markets: [...m.markets, market] } : m
          ),
        })),

      removeMarketFromMatch: (matchId, marketId) =>
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === matchId
              ? { ...m, markets: m.markets.filter((mkt) => mkt.id !== marketId) }
              : m
          ),
        })),

      updateDefaultCommissionRate: (rate) => {
        const state = get();
        const now = new Date().toISOString();
        set({
          settings: { ...state.settings, defaultCommissionRate: rate },
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: state.admin.name,
              actorRole: 'admin',
              actorId: state.admin.id,
              action: 'Commission rate updated',
              module: 'Commissions',
              description: `Updated platform default illustrative commission rate to ${rate.toFixed(1)}%.`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });
      },

      updateAgentCommissionRate: (agentId, rate) => {
        const state = get();
        const agent = state.agents.find((a) => a.id === agentId);
        if (!agent) return;
        const now = new Date().toISOString();
        set({
          agents: state.agents.map((a) =>
            a.id === agentId ? { ...a, commissionRate: rate } : a
          ),
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: state.admin.name,
              actorRole: 'admin',
              actorId: state.admin.id,
              agentId,
              action: 'Commission rate updated',
              module: 'Commissions',
              description: `Updated ${agent.name}'s illustrative commission rate from ${agent.commissionRate}% to ${rate}%.`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });
      },

      updateSettings: (updates) => {
        const state = get();
        const now = new Date().toISOString();
        set({
          settings: { ...state.settings, ...updates },
          activityLogs: [
            {
              id: `ACT-${Date.now()}`,
              actorName: state.admin.name,
              actorRole: 'admin',
              actorId: state.admin.id,
              action: 'Platform settings updated',
              module: 'Settings',
              description: `Updated global demo configuration settings.`,
              timestamp: now,
            },
            ...state.activityLogs,
          ],
        });
      },

      resetDemoData: () => {
        const currentRole = get().activeRole;
        set({
          ...getInitialPersistedData(),
          activeRole: currentRole,
          toasts: [],
        });
      },
    }),
    {
      name: 'aurel-demo-state-v1',
      partialize: (state) => ({
        activeRole: state.activeRole,
        activeCustomerId: state.activeCustomerId,
        activeAgentId: state.activeAgentId,
        hideBalance: state.hideBalance,
        admin: state.admin,
        agents: state.agents,
        customers: state.customers,
        matches: state.matches,
        demoBets: state.demoBets,
        depositRequests: state.depositRequests,
        transactions: state.transactions,
        commissions: state.commissions,
        activityLogs: state.activityLogs,
        settings: state.settings,
        betSlip: state.betSlip,
        betMode: state.betMode,
        betStake: state.betStake,
      }),
    }
  )
);

