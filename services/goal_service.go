package services

import (
	"context"
	"errors"

	"github.com/konto/models"
	"github.com/konto/repositories"
	"gorm.io/gorm"
)

type GoalService interface {
	CreateGoal(ctx context.Context, userID uint, name string, targetAmount float64) (*models.Goal, error)
	GetGoalsByUserID(ctx context.Context, userID uint) ([]*models.Goal, error)
	AddMoneyToGoal(ctx context.Context, userID, goalID, accountID uint, amount float64) (*models.Goal, error)
	DeleteGoal(ctx context.Context, userID, goalID uint) error
}

type goalService struct {
	goalRepo    repositories.GoalRepository
	accountRepo repositories.AccountRepository
	db          *gorm.DB
}

func NewGoalService(
	goalRepo repositories.GoalRepository,
	accountRepo repositories.AccountRepository,
	db *gorm.DB,
) GoalService {
	return &goalService{
		goalRepo:    goalRepo,
		accountRepo: accountRepo,
		db:          db,
	}
}

func (s *goalService) CreateGoal(ctx context.Context, userID uint, name string, targetAmount float64) (*models.Goal, error) {
	if targetAmount <= 0 {
		return nil, errors.New("target amount must be positive")
	}

	goal := &models.Goal{
		UserID:        userID,
		Name:          name,
		TargetAmount:  targetAmount,
		CurrentAmount: 0,
		IsCompleted:   false,
	}

	if err := s.goalRepo.Create(ctx, goal); err != nil {
		return nil, err
	}

	return goal, nil
}

func (s *goalService) GetGoalsByUserID(ctx context.Context, userID uint) ([]*models.Goal, error) {
	return s.goalRepo.GetByUserID(ctx, userID)
}

func (s *goalService) AddMoneyToGoal(ctx context.Context, userID, goalID, accountID uint, amount float64) (*models.Goal, error) {
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

	// Get goal and verify ownership
	goal, err := s.goalRepo.GetByID(ctx, goalID)
	if err != nil {
		tx.Rollback()
		return nil, err
	}

	if goal.UserID != userID {
		tx.Rollback()
		return nil, errors.New("unauthorized access to goal")
	}

	if goal.IsCompleted {
		tx.Rollback()
		return nil, errors.New("goal is already completed")
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

	// Check sufficient balance
	if account.Balance < amount {
		tx.Rollback()
		return nil, errors.New("insufficient balance")
	}

	// Calculate new amount (don't exceed target)
	newAmount := goal.CurrentAmount + amount
	if newAmount > goal.TargetAmount {
		newAmount = goal.TargetAmount
		amount = goal.TargetAmount - goal.CurrentAmount
	}

	// Deduct from account
	if err := tx.Model(&models.Account{}).
		Where("id = ?", accountID).
		Update("balance", gorm.Expr("balance - ?", amount)).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	// Update goal
	isCompleted := newAmount >= goal.TargetAmount
	if err := tx.Model(&models.Goal{}).
		Where("id = ?", goalID).
		Updates(map[string]interface{}{
			"current_amount": newAmount,
			"is_completed":   isCompleted,
		}).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}

	// Return updated goal
	return s.goalRepo.GetByID(ctx, goalID)
}

func (s *goalService) DeleteGoal(ctx context.Context, userID, goalID uint) error {
	// Start transaction
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if err := tx.Error; err != nil {
		return err
	}

	// Get goal and verify ownership
	goal, err := s.goalRepo.GetByID(ctx, goalID)
	if err != nil {
		tx.Rollback()
		return err
	}

	if goal.UserID != userID {
		tx.Rollback()
		return errors.New("unauthorized access to goal")
	}

	// If goal is not completed and has money, refund to debit account
	if !goal.IsCompleted && goal.CurrentAmount > 0 {
		// Get user's debit account
		accounts, err := s.accountRepo.GetByUserID(ctx, userID)
		if err != nil {
			tx.Rollback()
			return err
		}

		var debitAccount *models.Account
		for _, account := range accounts {
			if account.Type == models.AccountTypeDebit {
				debitAccount = account
				break
			}
		}

		if debitAccount == nil {
			tx.Rollback()
			return errors.New("debit account not found")
		}

		// Refund money
		if err := tx.Model(&models.Account{}).
			Where("id = ?", debitAccount.ID).
			Update("balance", gorm.Expr("balance + ?", goal.CurrentAmount)).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	// Delete goal
	if err := tx.Delete(&models.Goal{}, goalID).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
