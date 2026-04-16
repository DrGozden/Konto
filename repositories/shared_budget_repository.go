package repositories

import (
	"context"

	"github.com/konto/models"
	"gorm.io/gorm"
)

type SharedBudgetRepository interface {
	Create(ctx context.Context, sharedBudget *models.SharedBudget) error
	GetByID(ctx context.Context, id uint) (*models.SharedBudget, error)
	GetByCreatorID(ctx context.Context, creatorID uint) ([]*models.SharedBudget, error)
	GetByUserID(ctx context.Context, userID uint) ([]*models.SharedBudget, error)
	Update(ctx context.Context, sharedBudget *models.SharedBudget) error
	UpdateAmount(ctx context.Context, budgetID uint, amount float64) error
	UpdateStatus(ctx context.Context, budgetID uint, status models.SharedBudgetStatus) error
	Delete(ctx context.Context, id uint) error
}

type sharedBudgetRepository struct {
	db *gorm.DB
}

func NewSharedBudgetRepository(db *gorm.DB) SharedBudgetRepository {
	return &sharedBudgetRepository{
		db: db,
	}
}

func (r *sharedBudgetRepository) Create(ctx context.Context, sharedBudget *models.SharedBudget) error {
	return r.db.WithContext(ctx).Create(sharedBudget).Error
}

func (r *sharedBudgetRepository) GetByID(ctx context.Context, id uint) (*models.SharedBudget, error) {
	var sharedBudget models.SharedBudget
	err := r.db.WithContext(ctx).
		Preload("Creator").
		Preload("Members").
		Preload("Members.User").
		First(&sharedBudget, id).Error
	if err != nil {
		return nil, err
	}
	return &sharedBudget, nil
}

func (r *sharedBudgetRepository) GetByCreatorID(ctx context.Context, creatorID uint) ([]*models.SharedBudget, error) {
	var sharedBudgets []*models.SharedBudget
	err := r.db.WithContext(ctx).
		Where("creator_id = ?", creatorID).
		Preload("Creator").
		Preload("Members").
		Preload("Members.User").
		Find(&sharedBudgets).Error
	return sharedBudgets, err
}

func (r *sharedBudgetRepository) GetByUserID(ctx context.Context, userID uint) ([]*models.SharedBudget, error) {
	var sharedBudgets []*models.SharedBudget
	err := r.db.WithContext(ctx).
		Joins("JOIN shared_budget_members ON shared_budget_members.shared_budget_id = shared_budgets.id").
		Where("shared_budget_members.user_id = ?", userID).
		Preload("Creator").
		Preload("Members").
		Preload("Members.User").
		Preload("Invitations").
		Preload("Invitations.Inviter").
		Preload("Invitations.Invitee").
		Find(&sharedBudgets).Error
	return sharedBudgets, err
}

func (r *sharedBudgetRepository) Update(ctx context.Context, sharedBudget *models.SharedBudget) error {
	return r.db.WithContext(ctx).Save(sharedBudget).Error
}

func (r *sharedBudgetRepository) UpdateAmount(ctx context.Context, budgetID uint, amount float64) error {
	return r.db.WithContext(ctx).Model(&models.SharedBudget{}).
		Where("id = ?", budgetID).
		Update("current_amount", gorm.Expr("current_amount + ?", amount)).Error
}

func (r *sharedBudgetRepository) UpdateStatus(ctx context.Context, budgetID uint, status models.SharedBudgetStatus) error {
	return r.db.WithContext(ctx).Model(&models.SharedBudget{}).
		Where("id = ?", budgetID).
		Update("status", status).Error
}

func (r *sharedBudgetRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.SharedBudget{}, id).Error
}
