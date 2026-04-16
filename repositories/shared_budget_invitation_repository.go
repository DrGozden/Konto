package repositories

import (
	"context"

	"github.com/konto/models"
	"gorm.io/gorm"
)

type SharedBudgetInvitationRepository interface {
	Create(ctx context.Context, invitation *models.SharedBudgetInvitation) error
	GetByID(ctx context.Context, id uint) (*models.SharedBudgetInvitation, error)
	GetPendingByInviteeID(ctx context.Context, inviteeID uint) ([]*models.SharedBudgetInvitation, error)
	GetBySharedBudgetID(ctx context.Context, sharedBudgetID uint) ([]*models.SharedBudgetInvitation, error)
	GetByInviteeIDAndSharedBudgetID(ctx context.Context, inviteeID, sharedBudgetID uint) (*models.SharedBudgetInvitation, error)
	Update(ctx context.Context, invitation *models.SharedBudgetInvitation) error
	UpdateStatus(ctx context.Context, invitationID uint, status models.InvitationStatus) error
	Delete(ctx context.Context, id uint) error
	DeleteBySharedBudgetID(ctx context.Context, sharedBudgetID uint) error
}

type sharedBudgetInvitationRepository struct {
	db *gorm.DB
}

func NewSharedBudgetInvitationRepository(db *gorm.DB) SharedBudgetInvitationRepository {
	return &sharedBudgetInvitationRepository{
		db: db,
	}
}

func (r *sharedBudgetInvitationRepository) Create(ctx context.Context, invitation *models.SharedBudgetInvitation) error {
	return r.db.WithContext(ctx).Create(invitation).Error
}

func (r *sharedBudgetInvitationRepository) GetByID(ctx context.Context, id uint) (*models.SharedBudgetInvitation, error) {
	var invitation models.SharedBudgetInvitation
	err := r.db.WithContext(ctx).
		Preload("SharedBudget").
		Preload("Inviter").
		Preload("Invitee").
		First(&invitation, id).Error
	if err != nil {
		return nil, err
	}
	return &invitation, nil
}

func (r *sharedBudgetInvitationRepository) GetPendingByInviteeID(ctx context.Context, inviteeID uint) ([]*models.SharedBudgetInvitation, error) {
	var invitations []*models.SharedBudgetInvitation
	err := r.db.WithContext(ctx).
		Where("invitee_id = ? AND status = ?", inviteeID, models.InvitationStatusPending).
		Preload("SharedBudget").
		Preload("Inviter").
		Find(&invitations).Error
	return invitations, err
}

func (r *sharedBudgetInvitationRepository) GetBySharedBudgetID(ctx context.Context, sharedBudgetID uint) ([]*models.SharedBudgetInvitation, error) {
	var invitations []*models.SharedBudgetInvitation
	err := r.db.WithContext(ctx).
		Where("shared_budget_id = ?", sharedBudgetID).
		Preload("Inviter").
		Preload("Invitee").
		Find(&invitations).Error
	return invitations, err
}

func (r *sharedBudgetInvitationRepository) GetByInviteeIDAndSharedBudgetID(ctx context.Context, inviteeID, sharedBudgetID uint) (*models.SharedBudgetInvitation, error) {
	var invitation models.SharedBudgetInvitation
	err := r.db.WithContext(ctx).
		Where("invitee_id = ? AND shared_budget_id = ?", inviteeID, sharedBudgetID).
		Preload("SharedBudget").
		Preload("Inviter").
		First(&invitation).Error
	if err != nil {
		return nil, err
	}
	return &invitation, nil
}

func (r *sharedBudgetInvitationRepository) Update(ctx context.Context, invitation *models.SharedBudgetInvitation) error {
	return r.db.WithContext(ctx).Save(invitation).Error
}

func (r *sharedBudgetInvitationRepository) UpdateStatus(ctx context.Context, invitationID uint, status models.InvitationStatus) error {
	return r.db.WithContext(ctx).Model(&models.SharedBudgetInvitation{}).
		Where("id = ?", invitationID).
		Update("status", status).Error
}

func (r *sharedBudgetInvitationRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.SharedBudgetInvitation{}, id).Error
}

func (r *sharedBudgetInvitationRepository) DeleteBySharedBudgetID(ctx context.Context, sharedBudgetID uint) error {
	return r.db.WithContext(ctx).
		Where("shared_budget_id = ?", sharedBudgetID).
		Delete(&models.SharedBudgetInvitation{}).Error
}
