# GraphQL Queries

Ovaj fajl sadrzi osnovne GraphQL primere za prijavu korisnika i najcesce query-je koji se koriste nakon uspesnog logovanja.

## 1. Login mutacija

```graphql
mutation Login {
  login(input: {
    email: "marko.petrovic@email.com"
    password: "password"
  }) {
    token
    user {
      id
      name
      email
      role
    }
  }
}
```

## 2. Authorization header

Nakon uspesnog logovanja, token treba poslati u header-u:

```json
{
  "Authorization": "Bearer TVOJ_TOKEN"
}
```

## 3. Kategorije

```graphql
query GetCategories {
  categories {
    id
    name
    createdAt
    updatedAt
  }
}
```

## 4. Budzeti

```graphql
query GetBudgets {
  budgets {
    id
    userId
    categoryId
    limitAmount
    period
    currentSpent
    createdAt
    updatedAt
    category {
      id
      name
    }
  }
}
```

## 5. Ciljevi

```graphql
query GetGoals {
  goals {
    id
    userId
    name
    targetAmount
    currentAmount
    isCompleted
    createdAt
    updatedAt
  }
}
```

## 6. Zajednicki budzeti

```graphql
query GetSharedBudgets {
  sharedBudgets {
    id
    creatorId
    name
    description
    currentAmount
    status
    createdAt
    updatedAt
    creator {
      id
      name
    }
    members {
      id
      userId
      role
      contributedAmount
      joinedAt
      user {
        id
        name
      }
    }
    invitations {
      id
      status
      message
      createdAt
      inviter {
        id
        name
      }
      invitee {
        id
        name
      }
    }
  }
}
```

## 7. Jedan konkretan zajednicki budzet

```graphql
query GetSharedBudget {
  sharedBudget(id: "1") {
    id
    name
    description
    currentAmount
    status
    creator {
      id
      name
    }
    members {
      id
      role
      contributedAmount
      user {
        id
        name
      }
    }
    invitations {
      id
      status
      message
      inviter {
        id
        name
      }
      invitee {
        id
        name
      }
    }
    transactions {
      id
      amount
      description
      createdAt
      user {
        id
        name
      }
      account {
        id
        type
      }
    }
  }
}
```

## 8. Transakcije zajednickog budzeta

```graphql
query GetSharedBudgetTransactions {
  sharedBudgetTransactions(sharedBudgetId: "1") {
    id
    amount
    description
    createdAt
    user {
      id
      name
    }
    account {
      id
      type
    }
    sharedBudget {
      id
      name
    }
  }
}
```

## 9. Pending invitations

```graphql
query GetPendingInvitations {
  pendingInvitations {
    id
    sharedBudgetId
    status
    message
    createdAt
    sharedBudget {
      id
      name
    }
    inviter {
      id
      name
    }
    invitee {
      id
      name
    }
  }
}
```