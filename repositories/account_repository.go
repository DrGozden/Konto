package repositories

import (
	"context"

	"github.com/konto/models"
	"gorm.io/gorm"
)

type AccountRepository interface {
	Create(ctx context.Context, account *models.Account) error
	GetByID(ctx context.Context, id uint) (*models.Account, error)
	GetByUserID(ctx context.Context, userID uint) ([]*models.Account, error)
	GetByUserIDs(ctx context.Context, userIDs []uint) (map[uint][]*models.Account, error)
	Update(ctx context.Context, account *models.Account) error
	UpdateBalance(ctx context.Context, accountID uint, amount float64) error
	Delete(ctx context.Context, id uint) error
}

type accountRepository struct {
	db *gorm.DB
}

func NewAccountRepository(db *gorm.DB) AccountRepository {
	return &accountRepository{
		db: db,
	}
}

func (r *accountRepository) Create(ctx context.Context, account *models.Account) error {
	return r.db.WithContext(ctx).Create(account).Error
}

func (r *accountRepository) GetByID(ctx context.Context, id uint) (*models.Account, error) {
	var account models.Account
	err := r.db.WithContext(ctx).First(&account, id).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}

func (r *accountRepository) GetByUserID(ctx context.Context, userID uint) ([]*models.Account, error) {
	var accounts []*models.Account
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&accounts).Error
	return accounts, err
}

func (r *accountRepository) GetByUserIDs(ctx context.Context, userIDs []uint) (map[uint][]*models.Account, error) {
	var accounts []*models.Account
	err := r.db.WithContext(ctx).Where("user_id IN ?", userIDs).Find(&accounts).Error
	if err != nil {
		return nil, err
	}

	// Group accounts by user ID
	accountMap := make(map[uint][]*models.Account)
	for _, account := range accounts {
		accountMap[account.UserID] = append(accountMap[account.UserID], account)
	}

	return accountMap, nil
}

func (r *accountRepository) Update(ctx context.Context, account *models.Account) error {
	return r.db.WithContext(ctx).Save(account).Error
}

func (r *accountRepository) UpdateBalance(ctx context.Context, accountID uint, amount float64) error {
	return r.db.WithContext(ctx).Model(&models.Account{}).
		Where("id = ?", accountID).
		Update("balance", gorm.Expr("balance + ?", amount)).Error
}

func (r *accountRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Account{}, id).Error
}
