package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Config struct {
	Host     string
	User     string
	Password string
	DBName   string
	Port     string
	SSLMode  string
}

func NewConnection(config Config) (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		config.Host,
		config.User,
		config.Password,
		config.DBName,
		config.Port,
		config.SSLMode,
	)

	var logLevel logger.LogLevel
	if os.Getenv("ENV") == "development" {
		logLevel = logger.Info
	} else {
		logLevel = logger.Error
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	// Set connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	return db, nil
}

func GetConfigFromEnv() Config {
	return Config{
		Host:     getEnvWithDefault("DB_HOST", "localhost"),
		User:     getEnvWithDefault("DB_USER", "postgres"),
		Password: getEnvWithDefault("DB_PASSWORD", "postgres"),
		DBName:   getEnvWithDefault("DB_NAME", "konto"),
		Port:     getEnvWithDefault("DB_PORT", "5432"),
		SSLMode:  getEnvWithDefault("DB_SSLMODE", "disable"),
	}
}

func CheckSchema(db *gorm.DB) error {
	log.Println("Checking database schema...")

	// Check if required tables exist
	requiredTables := []string{"users", "categories", "accounts", "transactions", "goals", "budgets"}

	for _, table := range requiredTables {
		if !db.Migrator().HasTable(table) {
			return fmt.Errorf("table '%s' does not exist. Please run database setup first: ./setup-db.sh", table)
		}
	}

	log.Println("Database schema check passed successfully")
	return nil
}

func SeedDataFromSQL(db *gorm.DB) error {
	log.Println("Database seeding should be done using SQL files...")
	log.Println("Run: ./setup-db.sh or psql -d konto -f database/seeds/seed.sql")
	return nil
}

func getEnvWithDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
