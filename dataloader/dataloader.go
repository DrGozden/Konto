package dataloader

import (
	"context"
	"fmt"
	"net/http"
	"strconv"

	"github.com/graph-gophers/dataloader/v7"
	"github.com/konto/models"
	"github.com/konto/services"
)

type Loaders struct {
	AccountsByUserID     *dataloader.Loader[uint, []*models.Account]
	TransactionsByUserID *dataloader.Loader[uint, []*models.Transaction]
	UsersByID            *dataloader.Loader[uint, *models.User]
	CategoriesByID       *dataloader.Loader[uint, *models.Category]
}

func NewLoaders(
	accountService services.AccountService,
	transactionService services.TransactionService,
	userService services.UserService,
	categoryService services.CategoryService,
) *Loaders {
	return &Loaders{
		AccountsByUserID: dataloader.NewBatchedLoader(
			accountsByUserIDBatchFunc(accountService),
			dataloader.WithBatchCapacity[uint, []*models.Account](100),
		),
		TransactionsByUserID: dataloader.NewBatchedLoader(
			transactionsByUserIDBatchFunc(transactionService),
			dataloader.WithBatchCapacity[uint, []*models.Transaction](100),
		),
		UsersByID: dataloader.NewBatchedLoader(
			usersByIDBatchFunc(userService),
			dataloader.WithBatchCapacity[uint, *models.User](100),
		),
		CategoriesByID: dataloader.NewBatchedLoader(
			categoriesByIDBatchFunc(categoryService),
			dataloader.WithBatchCapacity[uint, *models.Category](100),
		),
	}
}

func accountsByUserIDBatchFunc(accountService services.AccountService) dataloader.BatchFunc[uint, []*models.Account] {
	return func(ctx context.Context, userIDs []uint) []*dataloader.Result[[]*models.Account] {
		accountMap, err := accountService.GetAccountsByUserIDs(ctx, userIDs)
		if err != nil {
			results := make([]*dataloader.Result[[]*models.Account], len(userIDs))
			for i := range userIDs {
				results[i] = &dataloader.Result[[]*models.Account]{Error: err}
			}
			return results
		}

		results := make([]*dataloader.Result[[]*models.Account], len(userIDs))
		for i, userID := range userIDs {
			accounts, exists := accountMap[userID]
			if !exists {
				accounts = []*models.Account{}
			}
			results[i] = &dataloader.Result[[]*models.Account]{Data: accounts}
		}

		return results
	}
}

func transactionsByUserIDBatchFunc(transactionService services.TransactionService) dataloader.BatchFunc[uint, []*models.Transaction] {
	return func(ctx context.Context, userIDs []uint) []*dataloader.Result[[]*models.Transaction] {
		results := make([]*dataloader.Result[[]*models.Transaction], len(userIDs))

		for i, userID := range userIDs {
			transactions, err := transactionService.GetTransactionsByUserID(ctx, userID, 50, 0, nil)
			if err != nil {
				results[i] = &dataloader.Result[[]*models.Transaction]{Error: err}
			} else {
				results[i] = &dataloader.Result[[]*models.Transaction]{Data: transactions}
			}
		}

		return results
	}
}

func usersByIDBatchFunc(userService services.UserService) dataloader.BatchFunc[uint, *models.User] {
	return func(ctx context.Context, userIDs []uint) []*dataloader.Result[*models.User] {
		users, err := userService.GetUsersByIDs(ctx, userIDs)
		if err != nil {
			results := make([]*dataloader.Result[*models.User], len(userIDs))
			for i := range userIDs {
				results[i] = &dataloader.Result[*models.User]{Error: err}
			}
			return results
		}

		userMap := make(map[uint]*models.User)
		for _, user := range users {
			userMap[user.ID] = user
		}

		results := make([]*dataloader.Result[*models.User], len(userIDs))
		for i, userID := range userIDs {
			user, exists := userMap[userID]
			if !exists {
				results[i] = &dataloader.Result[*models.User]{Error: fmt.Errorf("user with ID %d not found", userID)}
			} else {
				results[i] = &dataloader.Result[*models.User]{Data: user}
			}
		}

		return results
	}
}

func categoriesByIDBatchFunc(categoryService services.CategoryService) dataloader.BatchFunc[uint, *models.Category] {
	return func(ctx context.Context, categoryIDs []uint) []*dataloader.Result[*models.Category] {
		categories, err := categoryService.GetCategoriesByIDs(ctx, categoryIDs)
		if err != nil {
			results := make([]*dataloader.Result[*models.Category], len(categoryIDs))
			for i := range categoryIDs {
				results[i] = &dataloader.Result[*models.Category]{Error: err}
			}
			return results
		}

		categoryMap := make(map[uint]*models.Category)
		for _, category := range categories {
			categoryMap[category.ID] = category
		}

		results := make([]*dataloader.Result[*models.Category], len(categoryIDs))
		for i, categoryID := range categoryIDs {
			category, exists := categoryMap[categoryID]
			if !exists {
				results[i] = &dataloader.Result[*models.Category]{Error: fmt.Errorf("category with ID %d not found", categoryID)}
			} else {
				results[i] = &dataloader.Result[*models.Category]{Data: category}
			}
		}

		return results
	}
}

type contextKey string

const LoadersKey contextKey = "dataloaders"

func For(ctx context.Context) *Loaders {
	loaders, _ := ctx.Value(LoadersKey).(*Loaders)
	return loaders
}

func Middleware(loaders *Loaders) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := context.WithValue(r.Context(), LoadersKey, loaders)
			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}

func EncodeCursor(id uint) string {
	return strconv.Itoa(int(id))
}

func DecodeCursor(cursor string) (uint, error) {
	id, err := strconv.Atoi(cursor)
	if err != nil {
		return 0, fmt.Errorf("invalid cursor: %s", cursor)
	}
	return uint(id), nil
}
