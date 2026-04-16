package repositories

import (
	"context"

	"github.com/konto/models"
	"gorm.io/gorm"
)

type BudgetRepository interface {
	Create(ctx context.Context, budget *models.Budget) error
	GetByID(ctx context.Context, id uint) (*models.Budget, error)
	GetByUserID(ctx context.Context, userID uint) ([]*models.Budget, error)
	GetByUserIDAndCategoryID(ctx context.Context, userID, categoryID uint) (*models.Budget, error)
	Update(ctx context.Context, budget *models.Budget) error
	UpdateSpent(ctx context.Context, budgetID uint, amount float64) error
	Delete(ctx context.Context, id uint) error
}

type budgetRepository struct {
	db *gorm.DB
}

func NewBudgetRepository(db *gorm.DB) BudgetRepository {
	return &budgetRepository{
		db: db,
	}
}

func (r *budgetRepository) Create(ctx context.Context, budget *models.Budget) error {
	return r.db.WithContext(ctx).Create(budget).Error
}

func (r *budgetRepository) GetByID(ctx context.Context, id uint) (*models.Budget, error) {
	var budget models.Budget
	err := r.db.WithContext(ctx).First(&budget, id).Error
	if err != nil {
		return nil, err
	}
	return &budget, nil
}

func (r *budgetRepository) GetByUserID(ctx context.Context, userID uint) ([]*models.Budget, error) {
	var budgets []*models.Budget
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&budgets).Error
	return budgets, err
}

func (r *budgetRepository) GetByUserIDAndCategoryID(ctx context.Context, userID, categoryID uint) (*models.Budget, error) {
	var budget models.Budget
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND category_id = ?", userID, categoryID).
		First(&budget).Error
	if err != nil {
		return nil, err
	}
	return &budget, nil
}

func (r *budgetRepository) Update(ctx context.Context, budget *models.Budget) error {
	return r.db.WithContext(ctx).Save(budget).Error
}

func (r *budgetRepository) UpdateSpent(ctx context.Context, budgetID uint, amount float64) error {
	return r.db.WithContext(ctx).Model(&models.Budget{}).
		Where("id = ?", budgetID).
		Update("current_spent", gorm.Expr("current_spent + ?", amount)).Error
}

func (r *budgetRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Budget{}, id).Error
}
