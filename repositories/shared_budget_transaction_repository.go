package repositories

import (
	"context"

	"github.com/konto/models"
	"gorm.io/gorm"
)

type SharedBudgetTransactionRepository interface {
	Create(ctx context.Context, transaction *models.SharedBudgetTransaction) error
	GetByID(ctx context.Context, id uint) (*models.SharedBudgetTransaction, error)
	GetBySharedBudgetID(ctx context.Context, sharedBudgetID uint) ([]*models.SharedBudgetTransaction, error)
	GetByUserIDAndSharedBudgetID(ctx context.Context, userID, sharedBudgetID uint) ([]*models.SharedBudgetTransaction, error)
	GetByUserID(ctx context.Context, userID uint) ([]*models.SharedBudgetTransaction, error)
	Delete(ctx context.Context, id uint) error
	DeleteBySharedBudgetID(ctx context.Context, sharedBudgetID uint) error
}

type sharedBudgetTransactionRepository struct {
	db *gorm.DB
}

func NewSharedBudgetTransactionRepository(db *gorm.DB) SharedBudgetTransactionRepository {
	return &sharedBudgetTransactionRepository{
		db: db,
	}
}

func (r *sharedBudgetTransactionRepository) Create(ctx context.Context, transaction *models.SharedBudgetTransaction) error {
	return r.db.WithContext(ctx).Create(transaction).Error
}

func (r *sharedBudgetTransactionRepository) GetByID(ctx context.Context, id uint) (*models.SharedBudgetTransaction, error) {
	var transaction models.SharedBudgetTransaction
	err := r.db.WithContext(ctx).
		Preload("SharedBudget").
		Preload("User").
		Preload("Account").
		First(&transaction, id).Error
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *sharedBudgetTransactionRepository) GetBySharedBudgetID(ctx context.Context, sharedBudgetID uint) ([]*models.SharedBudgetTransaction, error) {
	var transactions []*models.SharedBudgetTransaction
	err := r.db.WithContext(ctx).
		Where("shared_budget_id = ?", sharedBudgetID).
		Preload("User").
		Preload("Account").
		Order("created_at DESC").
		Find(&transactions).Error
	return transactions, err
}

func (r *sharedBudgetTransactionRepository) GetByUserIDAndSharedBudgetID(ctx context.Context, userID, sharedBudgetID uint) ([]*models.SharedBudgetTransaction, error) {
	var transactions []*models.SharedBudgetTransaction
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND shared_budget_id = ?", userID, sharedBudgetID).
		Preload("SharedBudget").
		Preload("Account").
		Order("created_at DESC").
		Find(&transactions).Error
	return transactions, err
}

func (r *sharedBudgetTransactionRepository) GetByUserID(ctx context.Context, userID uint) ([]*models.SharedBudgetTransaction, error) {
	var transactions []*models.SharedBudgetTransaction
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Preload("SharedBudget").
		Preload("Account").
		Order("created_at DESC").
		Find(&transactions).Error
	return transactions, err
}

func (r *sharedBudgetTransactionRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.SharedBudgetTransaction{}, id).Error
}

func (r *sharedBudgetTransactionRepository) DeleteBySharedBudgetID(ctx context.Context, sharedBudgetID uint) error {
	return r.db.WithContext(ctx).
		Where("shared_budget_id = ?", sharedBudgetID).
		Delete(&models.SharedBudgetTransaction{}).Error
}
