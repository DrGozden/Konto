package graph

import (
	"github.com/konto/services"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require
// here.

type Resolver struct {
	AuthService         services.AuthService
	UserService         services.UserService
	AccountService      services.AccountService
	TransactionService  services.TransactionService
	CategoryService     services.CategoryService
	GoalService         services.GoalService
	BudgetService       services.BudgetService
	SharedBudgetService services.SharedBudgetService
}
