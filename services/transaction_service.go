package services

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/konto/graph/model"
	"github.com/konto/models"
	"github.com/konto/repositories"
	"gorm.io/gorm"
)

type TransactionService interface {
	CreateTransaction(ctx context.Context, userID, accountID, categoryID uint, amount float64, transactionType models.TransactionType, description *string) (*models.Transaction, error)
	GetTransactionsByUserID(ctx context.Context, userID uint, limit, offset int, filter *repositories.TransactionFilter) ([]*models.Transaction, error)
	GetTransactionsByAccountID(ctx context.Context, accountID uint) ([]*models.Transaction, error)
	GetTransactionsByAccountIDs(ctx context.Context, accountIDs []uint) (map[uint][]*models.Transaction, error)
	CountTransactions(ctx context.Context, filter *repositories.TransactionFilter) (int64, error)
	GetTransactionsConnection(ctx context.Context, userID uint, filter *model.TransactionFilter, first *int, after *string, last *int, before *string) (*model.TransactionConnection, error)
}

type transactionService struct {
	transactionRepo repositories.TransactionRepository
	accountRepo     repositories.AccountRepository
	budgetRepo      repositories.BudgetRepository
	db              *gorm.DB
}

func NewTransactionService(
	transactionRepo repositories.TransactionRepository,
	accountRepo repositories.AccountRepository,
	budgetRepo repositories.BudgetRepository,
	db *gorm.DB,
) TransactionService {
	return &transactionService{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
		budgetRepo:      budgetRepo,
		db:              db,
	}
}

func (s *transactionService) CreateTransaction(ctx context.Context, userID, accountID, categoryID uint, amount float64, transactionType models.TransactionType, description *string) (*models.Transaction, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Error; err != nil {
		return nil, err
	}

	// Get account and verify ownership
	account, err := s.accountRepo.GetByID(ctx, accountID)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if account.UserID != userID {
		tx.Rollback()
		return nil, errors.New("unauthorized access to account")
	}

	// For expenses, check sufficient balance and deduct from account
	if transactionType == models.TransactionTypeExpense {
		if account.Balance < amount {
			tx.Rollback()
			return nil, errors.New("insufficient balance")
		}

		// Deduct from account
		if err := tx.Model(&models.Account{}).
			Where("id = ?", accountID).
			Update("balance", gorm.Expr("balance - ?", amount)).Error; err != nil {
			tx.Rollback()
			return nil, err
		}

		// Check and update budget spending if applicable
		budget, err := s.budgetRepo.GetByUserIDAndCategoryID(ctx, userID, categoryID)
		if err == nil && budget != nil {
			if budget.CurrentSpent+amount > budget.LimitAmount {
				tx.Rollback()
				return nil, fmt.Errorf("budget limit exceeded for this category (limit: %.2f, spent: %.2f, transaction: %.2f)", budget.LimitAmount, budget.CurrentSpent, amount)
			}
			if err := tx.Model(&models.Budget{}).
				Where("id = ?", budget.ID).
				Update("current_spent", gorm.Expr("current_spent + ?", amount)).Error; err != nil {
				tx.Rollback()
				return nil, err
			}
		}
	} else if transactionType == models.TransactionTypeIncome {
		// Add to account
		if err := tx.Model(&models.Account{}).
			Where("id = ?", accountID).
			Update("balance", gorm.Expr("balance + ?", amount)).Error; err != nil {
			tx.Rollback()
			return nil, err
		}
	}

	// Create transaction
	transaction := &models.Transaction{
		UserID:      userID,
		AccountID:   accountID,
		CategoryID:  categoryID,
		Amount:      amount,
		Type:        transactionType,
		Description: description,
	}

	if err := tx.Create(transaction).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	return transaction, nil
}

func (s *transactionService) GetTransactionsByUserID(ctx context.Context, userID uint, limit, offset int, filter *repositories.TransactionFilter) ([]*models.Transaction, error) {
	if filter == nil {
		filter = &repositories.TransactionFilter{}
	}
	filter.UserID = userID

	return s.transactionRepo.GetByUserID(ctx, userID, limit, offset, filter)
}

func (s *transactionService) GetTransactionsByAccountID(ctx context.Context, accountID uint) ([]*models.Transaction, error) {
	result, err := s.transactionRepo.GetByAccountIDs(ctx, []uint{accountID})
	if err != nil {
		return nil, err
	}
	return result[accountID], nil
}

func (s *transactionService) GetTransactionsByAccountIDs(ctx context.Context, accountIDs []uint) (map[uint][]*models.Transaction, error) {
	return s.transactionRepo.GetByAccountIDs(ctx, accountIDs)
}

func (s *transactionService) CountTransactions(ctx context.Context, filter *repositories.TransactionFilter) (int64, error) {
	return s.transactionRepo.Count(ctx, filter)
}

// Helper function to encode cursor for pagination
func (s *transactionService) EncodeCursor(id uint, createdAt time.Time) string {
	return strconv.FormatInt(createdAt.Unix(), 10) + "_" + strconv.Itoa(int(id))
}

// Helper function to decode cursor for pagination
func (s *transactionService) DecodeCursor(cursor string) (time.Time, uint, error) {
	// Implementation for cursor decoding would go here
	// For now, return zero values
	return time.Time{}, 0, errors.New("cursor decoding not implemented")
}

// GetTransactionsConnection handles pagination and filtering for GraphQL
func (s *transactionService) GetTransactionsConnection(ctx context.Context, userID uint, filter *model.TransactionFilter, first *int, after *string, last *int, before *string) (*model.TransactionConnection, error) {
	// Convert GraphQL filter to repository filter
	repoFilter := &repositories.TransactionFilter{
		UserID: userID,
	}

	if filter != nil {
		if filter.StartDate != nil {
			startDate, err := time.Parse(time.RFC3339, *filter.StartDate)
			if err != nil {
				return nil, fmt.Errorf("invalid start date format: %v", err)
			}
			repoFilter.StartDate = &startDate
		}

		if filter.EndDate != nil {
			endDate, err := time.Parse(time.RFC3339, *filter.EndDate)
			if err != nil {
				return nil, fmt.Errorf("invalid end date format: %v", err)
			}
			repoFilter.EndDate = &endDate
		}

		if filter.CategoryID != nil {
			categoryID, err := strconv.ParseUint(*filter.CategoryID, 10, 32)
			if err != nil {
				return nil, fmt.Errorf("invalid category ID: %v", err)
			}
			categoryIDUint := uint(categoryID)
			repoFilter.CategoryID = &categoryIDUint
		}

		if filter.Type != nil {
			repoFilter.Type = filter.Type
		}
	}

	// Simple pagination
	limit := 20
	if first != nil && *first > 0 && *first <= 100 {
		limit = *first
	}

	offset := 0

	// Get transactions
	transactions, err := s.GetTransactionsByUserID(ctx, userID, limit+1, offset, repoFilter)
	if err != nil {
		return nil, err
	}

	// Get total count
	totalCount, err := s.CountTransactions(ctx, repoFilter)
	if err != nil {
		return nil, err
	}

	// Check if there are more results
	hasNextPage := len(transactions) > limit
	if hasNextPage {
		transactions = transactions[:limit]
	}

	// Create edges
	edges := make([]*model.TransactionEdge, len(transactions))
	for i, transaction := range transactions {
		cursor := s.EncodeCursor(transaction.ID, transaction.CreatedAt)
		edges[i] = &model.TransactionEdge{
			Node:   transaction,
			Cursor: cursor,
		}
	}

	// Create page info
	pageInfo := &model.PageInfo{
		HasNextPage:     hasNextPage,
		HasPreviousPage: offset > 0,
	}

	if len(edges) > 0 {
		startCursor := edges[0].Cursor
		endCursor := edges[len(edges)-1].Cursor
		pageInfo.StartCursor = &startCursor
		pageInfo.EndCursor = &endCursor
	}

	return &model.TransactionConnection{
		Edges:      edges,
		PageInfo:   pageInfo,
		TotalCount: int(totalCount),
	}, nil
}
