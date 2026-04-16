// ============== Enums as const objects (erasableSyntaxOnly) ==============

export const Role = { ADMIN: 'ADMIN', USER: 'USER' } as const;
export type Role = (typeof Role)[keyof typeof Role];

export const AccountType = { DEBIT: 'DEBIT', CASH: 'CASH' } as const;
export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const TransactionType = { INCOME: 'INCOME', EXPENSE: 'EXPENSE' } as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const BudgetPeriod = { MONTHLY: 'MONTHLY', WEEKLY: 'WEEKLY' } as const;
export type BudgetPeriod = (typeof BudgetPeriod)[keyof typeof BudgetPeriod];

export const SharedBudgetStatus = { ACTIVE: 'ACTIVE', COMPLETED: 'COMPLETED' } as const;
export type SharedBudgetStatus = (typeof SharedBudgetStatus)[keyof typeof SharedBudgetStatus];

export const SharedBudgetMemberRole = { CREATOR: 'CREATOR', MEMBER: 'MEMBER' } as const;
export type SharedBudgetMemberRole = (typeof SharedBudgetMemberRole)[keyof typeof SharedBudgetMemberRole];

export const SharedBudgetInvitationStatus = { PENDING: 'PENDING', ACCEPTED: 'ACCEPTED', REJECTED: 'REJECTED' } as const;
export type SharedBudgetInvitationStatus = (typeof SharedBudgetInvitationStatus)[keyof typeof SharedBudgetInvitationStatus];

// ============== Domain types matching backend schema ==============

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  accounts?: Account[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Account {
  id: string;
  userId: string;
  user: User;
  type: AccountType;
  balance: number;
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  user: User;
  accountId: string;
  account: Account;
  categoryId: string;
  category: Category;
  amount: number;
  type: TransactionType;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  user: User;
  name: string;
  targetAmount: number;
  currentAmount: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  user: User;
  categoryId: string;
  category: Category;
  limitAmount: number;
  period: BudgetPeriod;
  currentSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface SharedBudget {
  id: string;
  creatorId: string;
  creator: User;
  name: string;
  description?: string;
  currentAmount: number;
  status: SharedBudgetStatus;
  members?: SharedBudgetMember[];
  invitations?: SharedBudgetInvitation[];
  transactions?: SharedBudgetTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface SharedBudgetMember {
  id: string;
  sharedBudgetId: string;
  userId: string;
  user: User;
  role: SharedBudgetMemberRole;
  contributedAmount: number;
  joinedAt: string;
}

export interface SharedBudgetInvitation {
  id: string;
  sharedBudgetId: string;
  sharedBudget?: SharedBudget;
  inviterId: string;
  inviter: User;
  inviteeId: string;
  invitee: User;
  status: SharedBudgetInvitationStatus;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SharedBudgetTransaction {
  id: string;
  sharedBudgetId: string;
  sharedBudget?: SharedBudget;
  userId: string;
  user: User;
  accountId: string;
  account: Account;
  amount: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

// ============== Pagination types ==============

export interface TransactionEdge {
  node: Transaction;
  cursor: string;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface TransactionConnection {
  edges: TransactionEdge[];
  pageInfo: PageInfo;
  totalCount: number;
}

// ============== Input types ==============

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateTransactionInput {
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  description?: string;
}

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
}

export interface AddMoneyToGoalInput {
  goalId: string;
  amount: number;
  accountId: string;
}

export interface CreateBudgetInput {
  categoryId: string;
  limitAmount: number;
  period: BudgetPeriod;
}

export interface TransferBetweenAccountsInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: TransactionType;
}

// Admin inputs
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface CreateCategoryInput {
  name: string;
}

export interface AddMoneyToUserInput {
  userId: string;
  amount: number;
}

// ============== Shared Budget Inputs ==============

export interface CreateSharedBudgetInput {
  name: string;
  description?: string;
}

export interface UpdateSharedBudgetInput {
  name?: string;
  description?: string;
}

export interface InviteToSharedBudgetInput {
  sharedBudgetId: string;
  inviteeId: string;
  message?: string;
}

export interface RespondToInvitationInput {
  invitationId: string;
  accept: boolean;
}

export interface ContributeToSharedBudgetInput {
  sharedBudgetId: string;
  accountId: string;
  amount: number;
  description?: string;
}
