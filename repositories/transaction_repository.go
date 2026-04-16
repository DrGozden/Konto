package repositories

import (
	"context"
	"time"

	"github.com/konto/models"
	"gorm.io/gorm"
)

type TransactionFilter struct {
	StartDate  *time.Time
	EndDate    *time.Time
	CategoryID *uint
	Type       *models.TransactionType
	UserID     uint
	AccountID  *uint
}

type TransactionRepository interface {
	Create(ctx context.Context, transaction *models.Transaction) error
	GetByID(ctx context.Context, id uint) (*models.Transaction, error)
	GetByUserID(ctx context.Context, userID uint, limit, offset int, filter *TransactionFilter) ([]*models.Transaction, error)
	GetByAccountIDs(ctx context.Context, accountIDs []uint) (map[uint][]*models.Transaction, error)
	Count(ctx context.Context, filter *TransactionFilter) (int64, error)
	Update(ctx context.Context, transaction *models.Transaction) error
	Delete(ctx context.Context, id uint) error
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{
		db: db,
	}
}

func (r *transactionRepository) Create(ctx context.Context, transaction *models.Transaction) error {
	return r.db.WithContext(ctx).Create(transaction).Error
}

func (r *transactionRepository) GetByID(ctx context.Context, id uint) (*models.Transaction, error) {
	var transaction models.Transaction
	err := r.db.WithContext(ctx).First(&transaction, id).Error
	if err != nil {
		return nil, err
	}
	return &transaction, nil
}

func (r *transactionRepository) GetByUserID(ctx context.Context, userID uint, limit, offset int, filter *TransactionFilter) ([]*models.Transaction, error) {
	query := r.db.WithContext(ctx).Where("user_id = ?", userID)

	if filter != nil {
		query = r.applyFilter(query, filter)
	}

	var transactions []*models.Transaction
	err := query.Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&transactions).Error

	return transactions, err
}

func (r *transactionRepository) GetByAccountIDs(ctx context.Context, accountIDs []uint) (map[uint][]*models.Transaction, error) {
	var transactions []*models.Transaction
	err := r.db.WithContext(ctx).
		Where("account_id IN ?", accountIDs).
		Order("created_at DESC").
		Find(&transactions).Error
	if err != nil {
		return nil, err
	}

	// Group transactions by account ID
	transactionMap := make(map[uint][]*models.Transaction)
	for _, transaction := range transactions {
		transactionMap[transaction.AccountID] = append(transactionMap[transaction.AccountID], transaction)
	}

	return transactionMap, nil
}

func (r *transactionRepository) Count(ctx context.Context, filter *TransactionFilter) (int64, error) {
	query := r.db.WithContext(ctx).Model(&models.Transaction{})

	if filter != nil {
		query = r.applyFilter(query, filter)
	}

	var count int64
	err := query.Count(&count).Error
	return count, err
}

func (r *transactionRepository) Update(ctx context.Context, transaction *models.Transaction) error {
	return r.db.WithContext(ctx).Save(transaction).Error
}

func (r *transactionRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Transaction{}, id).Error
}

func (r *transactionRepository) applyFilter(query *gorm.DB, filter *TransactionFilter) *gorm.DB {
	if filter.UserID != 0 {
		query = query.Where("user_id = ?", filter.UserID)
	}

	if filter.AccountID != nil {
		query = query.Where("account_id = ?", *filter.AccountID)
	}

	if filter.StartDate != nil {
		query = query.Where("created_at >= ?", *filter.StartDate)
	}

	if filter.EndDate != nil {
		query = query.Where("created_at <= ?", *filter.EndDate)
	}

	if filter.CategoryID != nil {
		query = query.Where("category_id = ?", *filter.CategoryID)
	}

	if filter.Type != nil {
		query = query.Where("type = ?", *filter.Type)
	}

	return query
}
