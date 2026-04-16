package repositories

import (
	"context"
	"time"

	"github.com/konto/models"
	"gorm.io/gorm"
)

type SharedBudgetMemberRepository interface {
	Create(ctx context.Context, member *models.SharedBudgetMember) error
	GetByID(ctx context.Context, id uint) (*models.SharedBudgetMember, error)
	GetBySharedBudgetID(ctx context.Context, sharedBudgetID uint) ([]*models.SharedBudgetMember, error)
	GetByUserIDAndSharedBudgetID(ctx context.Context, userID, sharedBudgetID uint) (*models.SharedBudgetMember, error)
	Update(ctx context.Context, member *models.SharedBudgetMember) error
	UpdateContributed(ctx context.Context, memberID uint, amount float64) error
	Delete(ctx context.Context, id uint) error
	DeleteBySharedBudgetID(ctx context.Context, sharedBudgetID uint) error
}

type sharedBudgetMemberRepository struct {
	db *gorm.DB
}

func NewSharedBudgetMemberRepository(db *gorm.DB) SharedBudgetMemberRepository {
	return &sharedBudgetMemberRepository{
		db: db,
	}
}

func (r *sharedBudgetMemberRepository) Create(ctx context.Context, member *models.SharedBudgetMember) error {
	member.JoinedAt = time.Now()
	return r.db.WithContext(ctx).Create(member).Error
}

func (r *sharedBudgetMemberRepository) GetByID(ctx context.Context, id uint) (*models.SharedBudgetMember, error) {
	var member models.SharedBudgetMember
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("SharedBudget").
		First(&member, id).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func (r *sharedBudgetMemberRepository) GetBySharedBudgetID(ctx context.Context, sharedBudgetID uint) ([]*models.SharedBudgetMember, error) {
	var members []*models.SharedBudgetMember
	err := r.db.WithContext(ctx).
		Where("shared_budget_id = ?", sharedBudgetID).
		Preload("User").
		Find(&members).Error
	return members, err
}

func (r *sharedBudgetMemberRepository) GetByUserIDAndSharedBudgetID(ctx context.Context, userID, sharedBudgetID uint) (*models.SharedBudgetMember, error) {
	var member models.SharedBudgetMember
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND shared_budget_id = ?", userID, sharedBudgetID).
		Preload("User").
		Preload("SharedBudget").
		First(&member).Error
	if err != nil {
		return nil, err
	}
	return &member, nil
}

func (r *sharedBudgetMemberRepository) Update(ctx context.Context, member *models.SharedBudgetMember) error {
	return r.db.WithContext(ctx).Save(member).Error
}

func (r *sharedBudgetMemberRepository) UpdateContributed(ctx context.Context, memberID uint, amount float64) error {
	return r.db.WithContext(ctx).Model(&models.SharedBudgetMember{}).
		Where("id = ?", memberID).
		Update("contributed_amount", gorm.Expr("contributed_amount + ?", amount)).Error
}

func (r *sharedBudgetMemberRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.SharedBudgetMember{}, id).Error
}

func (r *sharedBudgetMemberRepository) DeleteBySharedBudgetID(ctx context.Context, sharedBudgetID uint) error {
	return r.db.WithContext(ctx).
		Where("shared_budget_id = ?", sharedBudgetID).
		Delete(&models.SharedBudgetMember{}).Error
}
