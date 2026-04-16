package repositories

import (
	"context"

	"github.com/konto/models"
	"gorm.io/gorm"
)

type GoalRepository interface {
	Create(ctx context.Context, goal *models.Goal) error
	GetByID(ctx context.Context, id uint) (*models.Goal, error)
	GetByUserID(ctx context.Context, userID uint) ([]*models.Goal, error)
	Update(ctx context.Context, goal *models.Goal) error
	UpdateAmount(ctx context.Context, goalID uint, amount float64) error
	Delete(ctx context.Context, id uint) error
}

type goalRepository struct {
	db *gorm.DB
}

func NewGoalRepository(db *gorm.DB) GoalRepository {
	return &goalRepository{
		db: db,
	}
}

func (r *goalRepository) Create(ctx context.Context, goal *models.Goal) error {
	return r.db.WithContext(ctx).Create(goal).Error
}

func (r *goalRepository) GetByID(ctx context.Context, id uint) (*models.Goal, error) {
	var goal models.Goal
	err := r.db.WithContext(ctx).First(&goal, id).Error
	if err != nil {
		return nil, err
	}
	return &goal, nil
}

func (r *goalRepository) GetByUserID(ctx context.Context, userID uint) ([]*models.Goal, error) {
	var goals []*models.Goal
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&goals).Error
	return goals, err
}

func (r *goalRepository) Update(ctx context.Context, goal *models.Goal) error {
	return r.db.WithContext(ctx).Save(goal).Error
}

func (r *goalRepository) UpdateAmount(ctx context.Context, goalID uint, amount float64) error {
	return r.db.WithContext(ctx).Model(&models.Goal{}).
		Where("id = ?", goalID).
		Update("current_amount", gorm.Expr("current_amount + ?", amount)).Error
}

func (r *goalRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Goal{}, id).Error
}
