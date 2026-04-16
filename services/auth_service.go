package services

import (
	"context"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/konto/models"
	"github.com/konto/repositories"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type contextKey string

const UserContextKey contextKey = "user"

type AuthService interface {
	Register(ctx context.Context, name, email, password string) (*models.User, string, error)
	Login(ctx context.Context, email, password string) (*models.User, string, error)
	ValidateToken(tokenString string) (*models.User, error)
	GetUserFromContext(ctx context.Context) (*models.User, error)
}

type Claims struct {
	UserID uint        `json:"user_id"`
	Email  string      `json:"email"`
	Role   models.Role `json:"role"`
	jwt.RegisteredClaims
}

type authService struct {
	userRepo  repositories.UserRepository
	jwtSecret string
}

func NewAuthService(userRepo repositories.UserRepository, jwtSecret string) AuthService {
	return &authService{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
	}
}

func (s *authService) Register(ctx context.Context, name, email, password string) (*models.User, string, error) {
	// Check if user already exists
	existingUser, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, "", err
	}
	if err == nil && existingUser != nil {
		return nil, "", errors.New("user with this email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}

	// Create user
	user := &models.User{
		Name:     name,
		Email:    email,
		Password: string(hashedPassword),
		Role:     models.RoleUser,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, "", err
	}

	// Generate token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *authService) Login(ctx context.Context, email, password string) (*models.User, string, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, "", errors.New("invalid credentials")
		}
		return nil, "", err
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, "", errors.New("invalid credentials")
	}

	// Generate token
	token, err := s.generateToken(user)
	if err != nil {
		return nil, "", err
	}

	return user, token, nil
}

func (s *authService) ValidateToken(tokenString string) (*models.User, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		// Load the full user from database
		user, err := s.userRepo.GetByID(context.Background(), claims.UserID)
		if err != nil {
			return nil, errors.New("user not found")
		}
		return user, nil
	}

	return nil, errors.New("invalid token")
}

func (s *authService) GetUserFromContext(ctx context.Context) (*models.User, error) {
	user, ok := ctx.Value(UserContextKey).(*models.User)
	if !ok || user == nil {
		return nil, errors.New("user not found in context")
	}
	return user, nil
}

func (s *authService) generateToken(user *models.User) (string, error) {
	claims := &Claims{
		UserID: user.ID,
		Email:  user.Email,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.jwtSecret))
}
