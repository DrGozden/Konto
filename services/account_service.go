package services

import (
	"context"
	"errors"

	"github.com/konto/models"
	"github.com/konto/repositories"
	"gorm.io/gorm"
)

type AccountService interface {
	GetAccountsByUserID(ctx context.Context, userID uint) ([]*models.Account, error)
	GetAccountsByUserIDs(ctx context.Context, userIDs []uint) (map[uint][]*models.Account, error)
	GetAccountByID(ctx context.Context, id uint) (*models.Account, error)
	TransferBetweenAccounts(ctx context.Context, userID, fromAccountID, toAccountID uint, amount float64) error
}

type accountService struct {
	accountRepo repositories.AccountRepository
	db          *gorm.DB
}

func NewAccountService(accountRepo repositories.AccountRepository, db *gorm.DB) AccountService {
	return &accountService{
		accountRepo: accountRepo,
		db:          db,
	}
}

func (s *accountService) GetAccountsByUserID(ctx context.Context, userID uint) ([]*models.Account, error) {
	return s.accountRepo.GetByUserID(ctx, userID)
}

func (s *accountService) GetAccountsByUserIDs(ctx context.Context, userIDs []uint) (map[uint][]*models.Account, error) {
	return s.accountRepo.GetByUserIDs(ctx, userIDs)
}

func (s *accountService) GetAccountByID(ctx context.Context, id uint) (*models.Account, error) {
	return s.accountRepo.GetByID(ctx, id)
}

func (s *accountService) TransferBetweenAccounts(ctx context.Context, userID, fromAccountID, toAccountID uint, amount float64) error {
	if amount <= 0 {
		return errors.New("amount must be positive")
	}

	if fromAccountID == toAccountID {
		return errors.New("cannot transfer to the same account")
	}

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

	// Get both accounts and verify ownership
	fromAccount, err := s.accountRepo.GetByID(ctx, fromAccountID)
	if err != nil {
		tx.Rollback()
		return err
	}

	toAccount, err := s.accountRepo.GetByID(ctx, toAccountID)
	if err != nil {
		tx.Rollback()
		return err
	}

	// Verify user owns both accounts
	if fromAccount.UserID != userID || toAccount.UserID != userID {
		tx.Rollback()
		return errors.New("unauthorized access to account")
	}

	// Check sufficient balance
	if fromAccount.Balance < amount {
		tx.Rollback()
		return errors.New("insufficient balance")
	}

	// Update balances within transaction
	if err := tx.Model(&models.Account{}).
		Where("id = ?", fromAccountID).
		Update("balance", gorm.Expr("balance - ?", amount)).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Model(&models.Account{}).
		Where("id = ?", toAccountID).
		Update("balance", gorm.Expr("balance + ?", amount)).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
