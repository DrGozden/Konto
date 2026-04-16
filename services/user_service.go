package services

import (
	"context"
	"errors"

	"github.com/konto/models"
	"github.com/konto/repositories"
	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	CreateUser(ctx context.Context, name, email, password string, role models.Role) (*models.User, error)
	GetUserByID(ctx context.Context, id uint) (*models.User, error)
	GetUsersByIDs(ctx context.Context, ids []uint) ([]*models.User, error)
	GetAllUsers(ctx context.Context, currentUserID uint) ([]*models.User, error)
	AddMoneyToUser(ctx context.Context, userID uint, amount float64) (*models.Account, error)
}

type userService struct {
	userRepo    repositories.UserRepository
	accountRepo repositories.AccountRepository
}

func NewUserService(userRepo repositories.UserRepository, accountRepo repositories.AccountRepository) UserService {
	return &userService{
		userRepo:    userRepo,
		accountRepo: accountRepo,
	}
}

func (s *userService) CreateUser(ctx context.Context, name, email, password string, role models.Role) (*models.User, error) {
	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),
		Role:     role,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *userService) GetUserByID(ctx context.Context, id uint) (*models.User, error) {
	return s.userRepo.GetByID(ctx, id)
}

func (s *userService) GetUsersByIDs(ctx context.Context, ids []uint) ([]*models.User, error) {
	return s.userRepo.GetByIDs(ctx, ids)
}

func (s *userService) GetAllUsers(ctx context.Context, currentUserID uint) ([]*models.User, error) {
	users, err := s.userRepo.GetAll(ctx)
	if err != nil {
		return nil, err
	}

	// Filter out current user from the list
	filteredUsers := make([]*models.User, 0)
	for _, user := range users {
		if user.ID != currentUserID {
			filteredUsers = append(filteredUsers, user)
		}
	}

	return filteredUsers, nil
}

func (s *userService) AddMoneyToUser(ctx context.Context, userID uint, amount float64) (*models.Account, error) {
	if amount <= 0 {
		return nil, errors.New("amount must be positive")
	}

	// Get user's debit account
	accounts, err := s.accountRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	var debitAccount *models.Account
	for _, account := range accounts {
		if account.Type == models.AccountTypeDebit {
			debitAccount = account
			break
		}
	}

	if debitAccount == nil {
		return nil, errors.New("debit account not found")
	}

	// Update balance
	if err := s.accountRepo.UpdateBalance(ctx, debitAccount.ID, amount); err != nil {
		return nil, err
	}

	// Return updated account
	return s.accountRepo.GetByID(ctx, debitAccount.ID)
}
