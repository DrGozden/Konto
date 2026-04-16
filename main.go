package main

import (
	"errors"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/joho/godotenv"
	"github.com/konto/database"
	"github.com/konto/dataloader"
	"github.com/konto/graph"
	"github.com/konto/graph/generated"
	"github.com/konto/middleware"
	"github.com/konto/repositories"
	"github.com/konto/services"
)

const defaultPort = "8080"

func main() {
	if err := godotenv.Load(); err != nil && !errors.Is(err, os.ErrNotExist) {
		log.Printf("Warning: failed to load .env file: %v", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	// Database connection
	dbConfig := database.GetConfigFromEnv()
	db, err := database.NewConnection(dbConfig)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Load JWT secret from config
	jwtSecret := dbConfig.JWTSecret

	// Check database schema
	if err := database.CheckSchema(db); err != nil {
		log.Fatalf("Database schema check failed: %v", err)
	}

	// Seed initial data
	if err := database.SeedDataFromSQL(db); err != nil {
		log.Printf("Warning: Failed to seed data: %v", err)
	}

	// Initialize repositories
	userRepo := repositories.NewUserRepository(db)
	accountRepo := repositories.NewAccountRepository(db)
	categoryRepo := repositories.NewCategoryRepository(db)
	transactionRepo := repositories.NewTransactionRepository(db)
	goalRepo := repositories.NewGoalRepository(db)
	budgetRepo := repositories.NewBudgetRepository(db)
	sharedBudgetRepo := repositories.NewSharedBudgetRepository(db)
	sharedBudgetMemberRepo := repositories.NewSharedBudgetMemberRepository(db)
	sharedBudgetInvitationRepo := repositories.NewSharedBudgetInvitationRepository(db)
	sharedBudgetTransactionRepo := repositories.NewSharedBudgetTransactionRepository(db)

	// Initialize services
	authService := services.NewAuthService(userRepo, jwtSecret)
	userService := services.NewUserService(userRepo, accountRepo)
	accountService := services.NewAccountService(accountRepo, db)
	transactionService := services.NewTransactionService(transactionRepo, accountRepo, budgetRepo, db)
	categoryService := services.NewCategoryService(categoryRepo)
	goalService := services.NewGoalService(goalRepo, accountRepo, db)
	budgetService := services.NewBudgetService(budgetRepo)
	sharedBudgetService := services.NewSharedBudgetService(
		sharedBudgetRepo,
		sharedBudgetMemberRepo,
		sharedBudgetInvitationRepo,
		sharedBudgetTransactionRepo,
		accountRepo,
		userRepo,
		db,
	)

	// Initialize dataloaders
	loaders := dataloader.NewLoaders(accountService, transactionService, userService, categoryService)

	// Initialize resolver
	resolver := &graph.Resolver{
		AuthService:         authService,
		UserService:         userService,
		AccountService:      accountService,
		TransactionService:  transactionService,
		CategoryService:     categoryService,
		GoalService:         goalService,
		BudgetService:       budgetService,
		SharedBudgetService: sharedBudgetService,
	}

	// Create GraphQL server
	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: resolver}))

	// Setup middleware chain
	http.Handle("/", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query",
		middleware.CORSMiddleware(
			middleware.LoggingMiddleware(
				middleware.AuthMiddleware(authService)(
					dataloader.Middleware(loaders)(srv),
				),
			),
		),
	)

	log.Printf("🚀 Server ready at http://localhost:%s", port)
	log.Printf("📊 GraphQL Playground at http://localhost:%s/", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
