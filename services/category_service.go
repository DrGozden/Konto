package services

import (
	"context"
	"errors"

	"github.com/konto/models"
	"github.com/konto/repositories"
	"gorm.io/gorm"
)

type CategoryService interface {
	CreateCategory(ctx context.Context, name string) (*models.Category, error)
	GetAllCategories(ctx context.Context) ([]*models.Category, error)
	GetCategoriesByIDs(ctx context.Context, ids []uint) ([]*models.Category, error)
	GetCategoryByID(ctx context.Context, id uint) (*models.Category, error)
}

type categoryService struct {
	categoryRepo repositories.CategoryRepository
}

func NewCategoryService(categoryRepo repositories.CategoryRepository) CategoryService {
	return &categoryService{
		categoryRepo: categoryRepo,
	}
}

func (s *categoryService) CreateCategory(ctx context.Context, name string) (*models.Category, error) {
	if name == "" {
		return nil, errors.New("category name cannot be empty")
	}

	category := &models.Category{
		Name: name,
	}

	if err := s.categoryRepo.Create(ctx, category); err != nil {
		// Check if it's a unique constraint violation
		if errors.Is(err, gorm.ErrDuplicatedKey) {
			return nil, errors.New("category with this name already exists")
		}
		return nil, err
	}

	return category, nil
}

func (s *categoryService) GetAllCategories(ctx context.Context) ([]*models.Category, error) {
	return s.categoryRepo.GetAll(ctx)
}

func (s *categoryService) GetCategoriesByIDs(ctx context.Context, ids []uint) ([]*models.Category, error) {
	return s.categoryRepo.GetByIDs(ctx, ids)
}

func (s *categoryService) GetCategoryByID(ctx context.Context, id uint) (*models.Category, error) {
	return s.categoryRepo.GetByID(ctx, id)
}
