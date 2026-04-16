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
	JWTSecret string
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
	if os.Getenv("ENV") != "PROD" {
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
		Host:      getEnvOrPanic("DB_HOST"),
		User:      getEnvOrPanic("DB_USER"),
		Password:  getEnvOrPanic("DB_PASSWORD"),
		DBName:    getEnvOrPanic("DB_NAME"),
		Port:      getEnvOrPanic("DB_PORT"),
		SSLMode:   getEnvOrPanic("DB_SSLMODE"),
		JWTSecret: getEnvOrPanic("JWT_SECRET"),
	}
}

func CheckSchema(db *gorm.DB) error {
	// Check if required tables exist
	requiredTables := []string{"users", "categories", "accounts", "transactions", "goals", "budgets"}

	for _, table := range requiredTables {
		if !db.Migrator().HasTable(table) {
			return fmt.Errorf("table '%s' does not exist. Please run database seeding: psql -d konto -f database/seeds/seed.sql", table)
		}
	}

	return nil
}

func SeedDataFromSQL(db *gorm.DB) error {
	log.Println("Database seeding should be done using SQL files...")
	log.Println("Run: psql -d konto -f database/seeds/seed.sql")
	return nil
}

func getEnvOrPanic(key string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	panic(fmt.Sprintf("Environment variable %s is required but not set", key))
}
