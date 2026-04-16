import { gql } from '@apollo/client';

// ======================== AUTH ========================

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user { id name email role }
    }
  }
`;

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user { id name email role }
    }
  }
`;

// ======================== QUERIES ========================

export const GET_ME = gql`
  query GetMe {
    me {
      id name email role
      accounts {
        id type balance
        transactions { id amount type description category { id name } createdAt }
      }
      createdAt updatedAt
    }
  }
`;

export const GET_ACCOUNTS = gql`
  query GetAccounts {
    accounts {
      id userId type balance createdAt updatedAt
      user { id name }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories { id name }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id name email
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query GetTransactions($filter: TransactionFilter, $first: Int, $after: String) {
    transactions(filter: $filter, first: $first, after: $after) {
      edges {
        node {
          id userId accountId categoryId amount type description createdAt updatedAt
          account { id type balance }
          category { id name }
        }
        cursor
      }
      pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
      totalCount
    }
  }
`;

export const GET_GOALS = gql`
  query GetGoals {
    goals {
      id userId name targetAmount currentAmount isCompleted createdAt updatedAt
    }
  }
`;

export const GET_BUDGETS = gql`
  query GetBudgets {
    budgets {
      id userId categoryId limitAmount period currentSpent createdAt updatedAt
      category { id name }
    }
  }
`;

// ======================== USER MUTATIONS ========================

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      id userId accountId categoryId amount type description createdAt updatedAt
      account { id type balance }
      category { id name }
    }
  }
`;

export const CREATE_GOAL = gql`
  mutation CreateGoal($input: CreateGoalInput!) {
    createGoal(input: $input) {
      id userId name targetAmount currentAmount isCompleted createdAt updatedAt
    }
  }
`;

export const ADD_MONEY_TO_GOAL = gql`
  mutation AddMoneyToGoal($input: AddMoneyToGoalInput!) {
    addMoneyToGoal(input: $input) {
      id userId name targetAmount currentAmount isCompleted createdAt updatedAt
    }
  }
`;

export const DELETE_GOAL = gql`
  mutation DeleteGoal($goalId: ID!) {
    deleteGoal(goalId: $goalId)
  }
`;

export const CREATE_BUDGET = gql`
  mutation CreateBudget($input: CreateBudgetInput!) {
    createBudget(input: $input) {
      id userId categoryId limitAmount period currentSpent createdAt updatedAt
      category { id name }
    }
  }
`;

export const DELETE_BUDGET = gql`
  mutation DeleteBudget($budgetId: ID!) {
    deleteBudget(budgetId: $budgetId)
  }
`;

export const TRANSFER_BETWEEN_ACCOUNTS = gql`
  mutation TransferBetweenAccounts($input: TransferBetweenAccountsInput!) {
    transferBetweenAccounts(input: $input)
  }
`;

// ======================== ADMIN MUTATIONS ========================

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id name email role createdAt updatedAt
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id name createdAt updatedAt
    }
  }
`;

export const ADD_MONEY_TO_USER = gql`
  mutation AddMoneyToUser($input: AddMoneyToUserInput!) {
    addMoneyToUser(input: $input) {
      id userId type balance createdAt updatedAt
    }
  }
`;

// ======================== SHARED BUDGET QUERIES ========================

export const GET_SHARED_BUDGETS = gql`
  query GetSharedBudgets {
    sharedBudgets {
      id creatorId name description currentAmount status createdAt updatedAt
      creator { id name }
      members {
        id userId role contributedAmount joinedAt
        user { id name }
      }
      invitations {
        id status message createdAt
        inviter { id name }
        invitee { id name }
      }
    }
  }
`;

export const GET_SHARED_BUDGET = gql`
  query GetSharedBudget($id: ID!) {
    sharedBudget(id: $id) {
      id creatorId name description currentAmount status createdAt updatedAt
      creator { id name }
      members {
        id userId role contributedAmount joinedAt
        user { id name }
      }
      invitations {
        id status message createdAt
        inviter { id name }
        invitee { id name }
      }
      transactions {
        id amount description createdAt
        user { id name }
        account { id type }
      }
    }
  }
`;

export const GET_PENDING_INVITATIONS = gql`
  query GetPendingInvitations {
    pendingInvitations {
      id sharedBudgetId status message createdAt
      sharedBudget { id name }
      inviter { id name }
      invitee { id name }
    }
  }
`;

export const GET_SHARED_BUDGET_TRANSACTIONS = gql`
  query GetSharedBudgetTransactions($sharedBudgetId: ID!) {
    sharedBudgetTransactions(sharedBudgetId: $sharedBudgetId) {
      id amount description createdAt
      user { id name }
      account { id type }
      sharedBudget { id name }
    }
  }
`;

// ======================== SHARED BUDGET MUTATIONS ========================

export const CREATE_SHARED_BUDGET = gql`
  mutation CreateSharedBudget($input: CreateSharedBudgetInput!) {
    createSharedBudget(input: $input) {
      id creatorId name description currentAmount status createdAt
      creator { id name }
      members {
        id role contributedAmount
        user { id name }
      }
    }
  }
`;

export const UPDATE_SHARED_BUDGET = gql`
  mutation UpdateSharedBudget($sharedBudgetId: ID!, $input: UpdateSharedBudgetInput!) {
    updateSharedBudget(sharedBudgetId: $sharedBudgetId, input: $input) {
      id name description updatedAt
    }
  }
`;

export const INVITE_TO_SHARED_BUDGET = gql`
  mutation InviteToSharedBudget($input: InviteToSharedBudgetInput!) {
    inviteToSharedBudget(input: $input) {
      id sharedBudgetId status message createdAt
      sharedBudget { id name }
      inviter { id name }
      invitee { id name }
    }
  }
`;

export const RESPOND_TO_INVITATION = gql`
  mutation RespondToInvitation($input: RespondToInvitationInput!) {
    respondToInvitation(input: $input)
  }
`;

export const CONTRIBUTE_TO_SHARED_BUDGET = gql`
  mutation ContributeToSharedBudget($input: ContributeToSharedBudgetInput!) {
    contributeToSharedBudget(input: $input) {
      id amount description createdAt
      user { id name }
      account { id type balance }
      sharedBudget { id name currentAmount }
    }
  }
`;

export const COMPLETE_SHARED_BUDGET = gql`
  mutation CompleteSharedBudget($sharedBudgetId: ID!) {
    completeSharedBudget(sharedBudgetId: $sharedBudgetId) {
      id name status currentAmount updatedAt
    }
  }
`;

export const LEAVE_SHARED_BUDGET = gql`
  mutation LeaveSharedBudget($sharedBudgetId: ID!) {
    leaveSharedBudget(sharedBudgetId: $sharedBudgetId)
  }
`;

export const DELETE_SHARED_BUDGET = gql`
  mutation DeleteSharedBudget($sharedBudgetId: ID!) {
    deleteSharedBudget(sharedBudgetId: $sharedBudgetId)
  }
`;
