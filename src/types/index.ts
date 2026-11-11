export type Role = 'public' | 'customer' | 'agent' | 'admin';

export type AccountStatus = 'active' | 'suspended';

export type SportKey =
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'cricket'
  | 'volleyball'
  | 'hockey'
  | 'other';

export interface SportsCategory {
  key: SportKey;
  label: string;
  description: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  primaryColor: string;
}

export interface MarketOption {
  id: string;
  label: string;
  odds: number;
}

export type MarketTab = 'main' | 'goals' | 'corners' | 'players' | 'info';

export interface BettingMarket {
  id: string;
  name: string;
  category: MarketTab;
  mutuallyExclusive: boolean;
  options: MarketOption[];
}

export type MatchStatus = 'live' | 'upcoming' | 'finished';

export interface MatchStats {
  possessionHome?: number;
  possessionAway?: number;
  shotsHome?: number;
  shotsAway?: number;
  cornersHome?: number;
  cornersAway?: number;
  venue: string;
  referee?: string;
  weather?: string;
}

export interface Match {
  id: string;
  sport: SportKey;
  competition: string;
  homeTeam: Team;
  awayTeam: Team;
  startTime: string; // ISO string
  status: MatchStatus;
  minute?: string;
  score?: {
    home: number;
    away: number;
  };
  featured: boolean;
  markets: BettingMarket[];
  stats: MatchStats;
}

export interface BetSelection {
  id: string; // matchId__marketId__optionId
  matchId: string;
  eventLabel: string;
  sport: SportKey;
  competition: string;
  marketId: string;
  marketName: string;
  optionId: string;
  outcomeLabel: string;
  odds: number;
}

export type BetStatus = 'open' | 'won' | 'lost' | 'cancelled';
export type BetMode = 'single' | 'multiple';

export interface DemoBet {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  mode: BetMode;
  selections: BetSelection[];
  totalOdds: number;
  stake: number;
  potentialReturn: number;
  potentialProfit: number;
  status: BetStatus;
  placedAt: string;
  settledAt?: string;
  sport: SportKey;
}

export interface Customer {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  agentId: string;
  walletBalance: number;
  status: AccountStatus;
  registeredAt: string;
  lastActivityAt: string;
  responsibleSettings: {
    dailyStakeLimit: number;
    weeklyDepositLimit: number;
    coolingOffUntil?: string;
    selfExcluded: boolean;
    sessionAlerts: boolean;
  };
  notificationPreferences: {
    betSettlement: boolean;
    depositUpdates: boolean;
    matchReminders: boolean;
    platformAnnouncements: boolean;
  };
}

export interface Agent {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  walletBalance: number;
  totalAllocated: number;
  commissionRate: number; // percentage e.g. 8.5
  totalCommissionEarned: number;
  status: AccountStatus;
  joinedAt: string;
  region: string;
}

export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  title: string;
  platformTreasuryBalance: number;
}

export type DepositMethod =
  | 'Agent-assisted deposit'
  | 'Internal account credit'
  | 'Manual deposit request';

export type DepositStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface DepositRequest {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  agentId: string;
  agentName: string;
  amount: number;
  method: DepositMethod;
  note?: string;
  status: DepositStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export type TransactionType =
  | 'demo_deposit'
  | 'demo_bet_stake'
  | 'simulated_winnings'
  | 'adjustment'
  | 'reversal'
  | 'agent_allocation'
  | 'agent_distribution';

export type TransactionStatus = 'completed' | 'pending' | 'rejected' | 'cancelled';

export interface Transaction {
  id: string;
  reference: string;
  accountId: string;
  accountName: string;
  accountType: 'customer' | 'agent' | 'platform';
  type: TransactionType;
  description: string;
  amount: number; // positive credit, negative debit
  previousBalance: number;
  newBalance: number;
  relatedRequestId?: string;
  initiatedBy: string;
  createdAt: string;
  status: TransactionStatus;
}

export type CommissionStatus = 'approved' | 'pending';

export interface CommissionRecord {
  id: string;
  reference: string;
  agentId: string;
  agentName: string;
  customerId: string;
  customerName: string;
  activityReference: string;
  baseAmount: number;
  rate: number;
  amount: number;
  status: CommissionStatus;
  createdAt: string;
}

export type ActivityModule =
  | 'Customers'
  | 'Agents'
  | 'Deposits'
  | 'Wallets'
  | 'Betting'
  | 'Sports'
  | 'Commissions'
  | 'Settings';

export interface ActivityLog {
  id: string;
  actorName: string;
  actorRole: 'customer' | 'agent' | 'admin';
  actorId: string;
  agentId?: string;
  action: string;
  module: ActivityModule;
  description: string;
  timestamp: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP';

export interface PlatformSettings {
  platformName: string;
  tagline: string;
  currency: CurrencyCode;
  language: 'EN' | 'FR' | 'ES' | 'DE';
  defaultCommissionRate: number;
  maxDemoBetStake: number;
  defaultDailyLimit: number;
  notificationsEnabled: boolean;
  autoApproveThreshold: number;
}

