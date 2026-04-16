package services

import (
	"context"
	"errors"

	"github.com/konto/models"
	"github.com/konto/repositories"
)

type BudgetService interface {
	CreateBudget(ctx context.Context, userID, categoryID uint, limitAmount float64, period models.BudgetPeriod) (*models.Budget, error)
	GetBudgetsByUserID(ctx context.Context, userID uint) ([]*models.Budget, error)
	DeleteBudget(ctx context.Context, userID, budgetID uint) error
}

type budgetService struct {
	budgetRepo repositories.BudgetRepository
}

func NewBudgetService(budgetRepo repositories.BudgetRepository) BudgetService {
	return &budgetService{
		budgetRepo: budgetRepo,
	}
}

func (s *budgetService) CreateBudget(ctx context.Context, userID, categoryID uint, limitAmount float64, period models.BudgetPeriod) (*models.Budget, error) {
	if limitAmount <= 0 {
		return nil, errors.New("limit amount must be positive")
	}

	// Check if budget already exists for this user and category
	existingBudget, err := s.budgetRepo.GetByUserIDAndCategoryID(ctx, userID, categoryID)
	if err == nil && existingBudget != nil {
		return nil, errors.New("budget already exists for this category")
	}

	budget := &models.Budget{
		UserID:       userID,
		CategoryID:   categoryID,
		LimitAmount:  limitAmount,
		Period:       period,
		CurrentSpent: 0,
	}

	if err := s.budgetRepo.Create(ctx, budget); err != nil {
		return nil, err
	}

	return budget, nil
}

func (s *budgetService) GetBudgetsByUserID(ctx context.Context, userID uint) ([]*models.Budget, error) {
	return s.budgetRepo.GetByUserID(ctx, userID)
}

func (s *budgetService) DeleteBudget(ctx context.Context, userID, budgetID uint) error {
	budget, err := s.budgetRepo.GetByID(ctx, budgetID)
	if err != nil {
		return errors.New("budget not found")
	}
	if budget.UserID != userID {
		return errors.New("unauthorized access to budget")
	}
	return s.budgetRepo.Delete(ctx, budgetID)
}
