package services

import (
	"context"
	"errors"
	"time"

	"github.com/konto/models"
	"github.com/konto/repositories"
	"gorm.io/gorm"
)

type SharedBudgetService interface {
	CreateSharedBudget(ctx context.Context, creatorID uint, name string, description *string) (*models.SharedBudget, error)
	GetSharedBudgetByID(ctx context.Context, userID, budgetID uint) (*models.SharedBudget, error)
	GetSharedBudgetsByUserID(ctx context.Context, userID uint) ([]*models.SharedBudget, error)
	UpdateSharedBudget(ctx context.Context, userID, budgetID uint, name *string, description *string) (*models.SharedBudget, error)
	CompleteSharedBudget(ctx context.Context, userID, budgetID uint) (*models.SharedBudget, error)
	DeleteSharedBudget(ctx context.Context, userID, budgetID uint) error
	LeaveSharedBudget(ctx context.Context, userID, budgetID uint) error
	InviteUser(ctx context.Context, inviterID, budgetID, inviteeID uint, message *string) (*models.SharedBudgetInvitation, error)
	GetPendingInvitations(ctx context.Context, userID uint) ([]*models.SharedBudgetInvitation, error)
	RespondToInvitation(ctx context.Context, userID, invitationID uint, accept bool) error
	ContributeToSharedBudget(ctx context.Context, userID, budgetID, accountID uint, amount float64, description *string) (*models.SharedBudgetTransaction, error)
	GetSharedBudgetTransactions(ctx context.Context, userID, budgetID uint) ([]*models.SharedBudgetTransaction, error)
}

type sharedBudgetService struct {
	sharedBudgetRepo            repositories.SharedBudgetRepository
	sharedBudgetMemberRepo      repositories.SharedBudgetMemberRepository
	sharedBudgetInvitationRepo  repositories.SharedBudgetInvitationRepository
	sharedBudgetTransactionRepo repositories.SharedBudgetTransactionRepository
	accountRepo                 repositories.AccountRepository
	userRepo                    repositories.UserRepository
	db                          *gorm.DB
}

func NewSharedBudgetService(
	sharedBudgetRepo repositories.SharedBudgetRepository,
	sharedBudgetMemberRepo repositories.SharedBudgetMemberRepository,
	sharedBudgetInvitationRepo repositories.SharedBudgetInvitationRepository,
	sharedBudgetTransactionRepo repositories.SharedBudgetTransactionRepository,
	accountRepo repositories.AccountRepository,
	userRepo repositories.UserRepository,
	db *gorm.DB,
) SharedBudgetService {
	return &sharedBudgetService{
		sharedBudgetRepo:            sharedBudgetRepo,
		sharedBudgetMemberRepo:      sharedBudgetMemberRepo,
		sharedBudgetInvitationRepo:  sharedBudgetInvitationRepo,
		sharedBudgetTransactionRepo: sharedBudgetTransactionRepo,
		accountRepo:                 accountRepo,
		userRepo:                    userRepo,
		db:                          db,
	}
}

func (s *sharedBudgetService) CreateSharedBudget(ctx context.Context, creatorID uint, name string, description *string) (*models.SharedBudget, error) {
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	if err := tx.Error; err != nil {
		return nil, err
	}

	budget := &models.SharedBudget{
		Name:          name,
		Description:   description,
		CurrentAmount: 0,
		Status:        models.SharedBudgetStatusActive,
		CreatorID:     creatorID,
	}
	if err := tx.Create(budget).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	member := &models.SharedBudgetMember{
		SharedBudgetID:    budget.ID,
		UserID:            creatorID,
		Role:              models.SharedBudgetRoleCreator,
		ContributedAmount: 0,
		JoinedAt:          time.Now(),
	}
	if err := tx.Create(member).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return s.sharedBudgetRepo.GetByID(ctx, budget.ID)
}

func (s *sharedBudgetService) GetSharedBudgetByID(ctx context.Context, userID, budgetID uint) (*models.SharedBudget, error) {
	budget, err := s.sharedBudgetRepo.GetByID(ctx, budgetID)
	if err != nil {
		return nil, err
	}
	if _, err := s.sharedBudgetMemberRepo.GetByUserIDAndSharedBudgetID(ctx, userID, budgetID); err != nil {
		return nil, errors.New("unauthorized")
	}
	return budget, nil
}

func (s *sharedBudgetService) GetSharedBudgetsByUserID(ctx context.Context, userID uint) ([]*models.SharedBudget, error) {
	return s.sharedBudgetRepo.GetByUserID(ctx, userID)
}

func (s *sharedBudgetService) UpdateSharedBudget(ctx context.Context, userID, budgetID uint, name *string, description *string) (*models.SharedBudget, error) {
	budget, err := s.sharedBudgetRepo.GetByID(ctx, budgetID)
	if err != nil {
		return nil, err
	}
	if budget.CreatorID != userID {
		return nil, errors.New("only creator can update shared budget")
	}
	if budget.Status != models.SharedBudgetStatusActive {
		return nil, errors.New("cannot update inactive shared budget")
	}
	if name != nil {
		budget.Name = *name
	}
	if description != nil {
		budget.Description = description
	}
	if err := s.sharedBudgetRepo.Update(ctx, budget); err != nil {
		return nil, err
	}
	return s.sharedBudgetRepo.GetByID(ctx, budgetID)
}

func (s *sharedBudgetService) CompleteSharedBudget(ctx context.Context, userID, budgetID uint) (*models.SharedBudget, error) {
	budget, err := s.sharedBudgetRepo.GetByID(ctx, budgetID)
	if err != nil {
		return nil, err
	}
	if budget.CreatorID != userID {
		return nil, errors.New("only creator can complete shared budget")
	}
	if budget.Status != models.SharedBudgetStatusActive {
		return nil, errors.New("shared budget is not active")
	}
	if err := s.sharedBudgetRepo.UpdateStatus(ctx, budgetID, models.SharedBudgetStatusCompleted); err != nil {
		return nil, err
	}
	return s.sharedBudgetRepo.GetByID(ctx, budgetID)
}

// DeleteSharedBudget deletes the budget and refunds all members. Only creator can do this.
func (s *sharedBudgetService) DeleteSharedBudget(ctx context.Context, userID, budgetID uint) error {
	budget, err := s.sharedBudgetRepo.GetByID(ctx, budgetID)
	if err != nil {
		return err
	}
	if budget.CreatorID != userID {
		return errors.New("only creator can delete shared budget")
	}

	members, err := s.sharedBudgetMemberRepo.GetBySharedBudgetID(ctx, budgetID)
	if err != nil {
		return err
	}

	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	if err := tx.Error; err != nil {
		return err
	}

	for _, m := range members {
		if m.ContributedAmount > 0 {
			if err := tx.Model(&models.Account{}).
				Where("user_id = ? AND type = ?", m.UserID, models.AccountTypeDebit).
				Update("balance", gorm.Expr("balance + ?", m.ContributedAmount)).Error; err != nil {
				tx.Rollback()
				return err
			}
		}
	}

	if err := tx.Delete(&models.SharedBudget{}, budgetID).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// LeaveSharedBudget removes a non-creator member and refunds their contribution.
func (s *sharedBudgetService) LeaveSharedBudget(ctx context.Context, userID, budgetID uint) error {
	member, err := s.sharedBudgetMemberRepo.GetByUserIDAndSharedBudgetID(ctx, userID, budgetID)
	if err != nil {
		return errors.New("you are not a member of this shared budget")
	}
	if member.Role == models.SharedBudgetRoleCreator {
		return errors.New("creator cannot leave, use delete instead")
	}

	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	if err := tx.Error; err != nil {
		return err
	}

	if member.ContributedAmount > 0 {
		if err := tx.Model(&models.Account{}).
			Where("user_id = ? AND type = ?", userID, models.AccountTypeDebit).
			Update("balance", gorm.Expr("balance + ?", member.ContributedAmount)).Error; err != nil {
			tx.Rollback()
			return err
		}
		if err := tx.Model(&models.SharedBudget{}).
			Where("id = ?", budgetID).
			Update("current_amount", gorm.Expr("current_amount - ?", member.ContributedAmount)).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	if err := tx.Delete(&models.SharedBudgetMember{}, member.ID).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

// InviteUser sends an invitation. Only creator can invite. Cannot invite admins.
func (s *sharedBudgetService) InviteUser(ctx context.Context, inviterID, budgetID, inviteeID uint, message *string) (*models.SharedBudgetInvitation, error) {
	budget, err := s.sharedBudgetRepo.GetByID(ctx, budgetID)
	if err != nil {
		return nil, err
	}
	if budget.Status != models.SharedBudgetStatusActive {
		return nil, errors.New("shared budget is not active")
	}
	if budget.CreatorID != inviterID {
		return nil, errors.New("only creator can invite users")
	}

	invitee, err := s.userRepo.GetByID(ctx, inviteeID)
	if err != nil {
		return nil, errors.New("user not found")
	}
	if invitee.Role == models.RoleAdmin {
		return nil, errors.New("cannot invite admin users")
	}

	if _, err := s.sharedBudgetMemberRepo.GetByUserIDAndSharedBudgetID(ctx, inviteeID, budgetID); err == nil {
		return nil, errors.New("user is already a member")
	}

	existing, err := s.sharedBudgetInvitationRepo.GetByInviteeIDAndSharedBudgetID(ctx, inviteeID, budgetID)
	if err == nil {
		if existing.Status == models.InvitationStatusPending {
			return nil, errors.New("invitation already sent to this user")
		}
		// Reuse existing record (accepted/declined) — reset to PENDING
		existing.InviterID = inviterID
		existing.Message = message
		if err := s.db.Model(existing).Updates(map[string]interface{}{
			"inviter_id": inviterID,
			"status":     models.InvitationStatusPending,
			"message":    message,
		}).Error; err != nil {
			return nil, err
		}
		return s.sharedBudgetInvitationRepo.GetByID(ctx, existing.ID)
	}

	invitation := &models.SharedBudgetInvitation{
		SharedBudgetID: budgetID,
		InviterID:      inviterID,
		InviteeID:      inviteeID,
		Status:         models.InvitationStatusPending,
		Message:        message,
	}
	if err := s.sharedBudgetInvitationRepo.Create(ctx, invitation); err != nil {
		return nil, err
	}
	return s.sharedBudgetInvitationRepo.GetByID(ctx, invitation.ID)
}

func (s *sharedBudgetService) GetPendingInvitations(ctx context.Context, userID uint) ([]*models.SharedBudgetInvitation, error) {
	return s.sharedBudgetInvitationRepo.GetPendingByInviteeID(ctx, userID)
}

// RespondToInvitation — accept adds user as member, decline just updates status.
func (s *sharedBudgetService) RespondToInvitation(ctx context.Context, userID, invitationID uint, accept bool) error {
	invitation, err := s.sharedBudgetInvitationRepo.GetByID(ctx, invitationID)
	if err != nil {
		return err
	}
	if invitation.InviteeID != userID {
		return errors.New("unauthorized")
	}
	if invitation.Status != models.InvitationStatusPending {
		return errors.New("invitation is no longer pending")
	}

	budget, err := s.sharedBudgetRepo.GetByID(ctx, invitation.SharedBudgetID)
	if err != nil {
		return err
	}
	if budget.Status != models.SharedBudgetStatusActive {
		return errors.New("shared budget is no longer active")
	}

	if !accept {
		return s.sharedBudgetInvitationRepo.UpdateStatus(ctx, invitationID, models.InvitationStatusDeclined)
	}

	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	if err := tx.Error; err != nil {
		return err
	}

	member := &models.SharedBudgetMember{
		SharedBudgetID:    invitation.SharedBudgetID,
		UserID:            userID,
		Role:              models.SharedBudgetRoleMember,
		ContributedAmount: 0,
		JoinedAt:          time.Now(),
	}
	if err := tx.Create(member).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&models.SharedBudgetInvitation{}).
		Where("id = ?", invitationID).
		Update("status", models.InvitationStatusAccepted).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func (s *sharedBudgetService) ContributeToSharedBudget(ctx context.Context, userID, budgetID, accountID uint, amount float64, description *string) (*models.SharedBudgetTransaction, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	member, err := s.sharedBudgetMemberRepo.GetByUserIDAndSharedBudgetID(ctx, userID, budgetID)
	if err != nil {
		return nil, errors.New("you are not a member of this shared budget")
	}

	budget, err := s.sharedBudgetRepo.GetByID(ctx, budgetID)
	if err != nil {
		return nil, err
	}
	if budget.Status != models.SharedBudgetStatusActive {
		return nil, errors.New("shared budget is not active")
	}

	account, err := s.accountRepo.GetByID(ctx, accountID)
	if err != nil {
		return nil, err
	}
	if account.UserID != userID {
		return nil, errors.New("account does not belong to you")
	}
	if account.Balance < amount {
		return nil, errors.New("insufficient balance")
	}

	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()
	if err := tx.Error; err != nil {
		return nil, err
	}

	if err := tx.Model(&models.Account{}).
		Where("id = ?", accountID).
		Update("balance", gorm.Expr("balance - ?", amount)).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Model(&models.SharedBudget{}).
		Where("id = ?", budgetID).
		Update("current_amount", gorm.Expr("current_amount + ?", amount)).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Model(&models.SharedBudgetMember{}).
		Where("id = ?", member.ID).
		Update("contributed_amount", gorm.Expr("contributed_amount + ?", amount)).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	transaction := &models.SharedBudgetTransaction{
		SharedBudgetID: budgetID,
		UserID:         userID,
		AccountID:      accountID,
		Amount:         amount,
		Description:    description,
	}
	if err := tx.Create(transaction).Error; err != nil {
		tx.Rollback()
		return nil, err
	}

	if err := tx.Commit().Error; err != nil {
		return nil, err
	}
	return s.sharedBudgetTransactionRepo.GetByID(ctx, transaction.ID)
}

func (s *sharedBudgetService) GetSharedBudgetTransactions(ctx context.Context, userID, budgetID uint) ([]*models.SharedBudgetTransaction, error) {
	if _, err := s.sharedBudgetMemberRepo.GetByUserIDAndSharedBudgetID(ctx, userID, budgetID); err != nil {
		return nil, errors.New("you are not a member of this shared budget")
	}
	return s.sharedBudgetTransactionRepo.GetBySharedBudgetID(ctx, budgetID)
}
