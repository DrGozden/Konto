package models

import (
	"time"

	"gorm.io/gorm"
)

// Enums
type Role string

const (
	RoleAdmin Role = "ADMIN"
	RoleUser  Role = "USER"
)

type AccountType string

const (
	AccountTypeDebit AccountType = "DEBIT"
	AccountTypeCash  AccountType = "CASH"
)

type TransactionType string

const (
	TransactionTypeIncome  TransactionType = "INCOME"
	TransactionTypeExpense TransactionType = "EXPENSE"
)

type BudgetPeriod string

const (
	BudgetPeriodMonthly BudgetPeriod = "MONTHLY"
	BudgetPeriodWeekly  BudgetPeriod = "WEEKLY"
)

type SharedBudgetStatus string

const (
	SharedBudgetStatusActive    SharedBudgetStatus = "ACTIVE"
	SharedBudgetStatusCompleted SharedBudgetStatus = "COMPLETED"
	SharedBudgetStatusCancelled SharedBudgetStatus = "CANCELLED"
)

type InvitationStatus string

const (
	InvitationStatusPending  InvitationStatus = "PENDING"
	InvitationStatusAccepted InvitationStatus = "ACCEPTED"
	InvitationStatusDeclined InvitationStatus = "DECLINED"
)

type SharedBudgetRole string

const (
	SharedBudgetRoleCreator SharedBudgetRole = "CREATOR"
	SharedBudgetRoleMember  SharedBudgetRole = "MEMBER"
)

// Models
type User struct {
	ID        uint   `gorm:"primarykey" json:"id"`
	Name      string `gorm:"not null" json:"name"`
	Email     string `gorm:"uniqueIndex;not null" json:"email"`
	Password  string `gorm:"not null" json:"-"`
	Role      Role   `gorm:"type:varchar(10);default:'USER';not null" json:"role"`
	CreatedAt time.Time
	UpdatedAt time.Time

	// Relationships
	Accounts     []Account     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"accounts,omitempty"`
	Transactions []Transaction `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"transactions,omitempty"`
	Goals        []Goal        `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"goals,omitempty"`
	Budgets      []Budget      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"budgets,omitempty"`
}

type Account struct {
	ID        uint        `gorm:"primarykey" json:"id"`
	UserID    uint        `gorm:"not null" json:"user_id"`
	Type      AccountType `gorm:"type:varchar(10);not null" json:"type"`
	Balance   float64     `gorm:"type:decimal(15,2);default:0;not null" json:"balance"`
	CreatedAt time.Time
	UpdatedAt time.Time

	// Relationships
	User         User          `gorm:"constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Transactions []Transaction `gorm:"foreignKey:AccountID;constraint:OnDelete:CASCADE" json:"transactions,omitempty"`
}

type Category struct {
	ID        uint   `gorm:"primarykey" json:"id"`
	Name      string `gorm:"uniqueIndex;not null" json:"name"`
	CreatedAt time.Time
	UpdatedAt time.Time

	// Relationships
	Transactions []Transaction `gorm:"foreignKey:CategoryID;constraint:OnDelete:RESTRICT" json:"transactions,omitempty"`
	Budgets      []Budget      `gorm:"foreignKey:CategoryID;constraint:OnDelete:CASCADE" json:"budgets,omitempty"`
}

type Transaction struct {
	ID          uint            `gorm:"primarykey" json:"id"`
	UserID      uint            `gorm:"not null" json:"user_id"`
	AccountID   uint            `gorm:"not null" json:"account_id"`
	CategoryID  uint            `gorm:"not null" json:"category_id"`
	Amount      float64         `gorm:"type:decimal(15,2);not null" json:"amount"`
	Type        TransactionType `gorm:"type:varchar(10);not null" json:"type"`
	Description *string         `json:"description"`
	CreatedAt   time.Time
	UpdatedAt   time.Time

	// Relationships
	User     User     `gorm:"constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Account  Account  `gorm:"constraint:OnDelete:CASCADE" json:"account,omitempty"`
	Category Category `gorm:"constraint:OnDelete:RESTRICT" json:"category,omitempty"`
}

type Goal struct {
	ID            uint    `gorm:"primarykey" json:"id"`
	UserID        uint    `gorm:"not null" json:"user_id"`
	Name          string  `gorm:"not null" json:"name"`
	TargetAmount  float64 `gorm:"type:decimal(15,2);not null" json:"target_amount"`
	CurrentAmount float64 `gorm:"type:decimal(15,2);default:0;not null" json:"current_amount"`
	IsCompleted   bool    `gorm:"default:false;not null" json:"is_completed"`
	CreatedAt     time.Time
	UpdatedAt     time.Time

	// Relationships
	User User `gorm:"constraint:OnDelete:CASCADE" json:"user,omitempty"`
}

type Budget struct {
	ID           uint         `gorm:"primarykey" json:"id"`
	UserID       uint         `gorm:"not null" json:"user_id"`
	CategoryID   uint         `gorm:"not null" json:"category_id"`
	LimitAmount  float64      `gorm:"type:decimal(15,2);not null" json:"limit_amount"`
	Period       BudgetPeriod `gorm:"type:varchar(10);not null" json:"period"`
	CurrentSpent float64      `gorm:"type:decimal(15,2);default:0;not null" json:"current_spent"`
	CreatedAt    time.Time
	UpdatedAt    time.Time

	// Relationships
	User     User     `gorm:"constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Category Category `gorm:"constraint:OnDelete:RESTRICT" json:"category,omitempty"`
}

type SharedBudget struct {
	ID            uint               `gorm:"primarykey" json:"id"`
	Name          string             `gorm:"not null" json:"name"`
	Description   *string            `json:"description"`
	CurrentAmount float64            `gorm:"type:decimal(15,2);default:0;not null" json:"current_amount"`
	Status        SharedBudgetStatus `gorm:"type:varchar(15);default:'ACTIVE';not null" json:"status"`
	CreatorID     uint               `gorm:"not null" json:"creator_id"`
	CreatedAt     time.Time
	UpdatedAt     time.Time

	// Relationships
	Creator      User                      `gorm:"foreignKey:CreatorID;constraint:OnDelete:CASCADE" json:"creator,omitempty"`
	Members      []SharedBudgetMember      `gorm:"foreignKey:SharedBudgetID;constraint:OnDelete:CASCADE" json:"members,omitempty"`
	Invitations  []SharedBudgetInvitation  `gorm:"foreignKey:SharedBudgetID;constraint:OnDelete:CASCADE" json:"invitations,omitempty"`
	Transactions []SharedBudgetTransaction `gorm:"foreignKey:SharedBudgetID;constraint:OnDelete:CASCADE" json:"transactions,omitempty"`
}

type SharedBudgetMember struct {
	ID                uint             `gorm:"primarykey" json:"id"`
	SharedBudgetID    uint             `gorm:"not null" json:"shared_budget_id"`
	UserID            uint             `gorm:"not null" json:"user_id"`
	Role              SharedBudgetRole `gorm:"type:varchar(10);not null" json:"role"`
	ContributedAmount float64          `gorm:"type:decimal(15,2);default:0;not null" json:"contributed_amount"`
	JoinedAt          time.Time        `gorm:"not null" json:"joined_at"`
	CreatedAt         time.Time
	UpdatedAt         time.Time

	// Relationships
	SharedBudget SharedBudget `gorm:"constraint:OnDelete:CASCADE" json:"shared_budget,omitempty"`
	User         User         `gorm:"constraint:OnDelete:CASCADE" json:"user,omitempty"`

	// Unique constraint: one member per user per budget
	_ struct{} `gorm:"uniqueIndex:idx_shared_budget_member,shared_budget_id,user_id"`
}

type SharedBudgetInvitation struct {
	ID             uint             `gorm:"primarykey" json:"id"`
	SharedBudgetID uint             `gorm:"not null" json:"shared_budget_id"`
	InviterID      uint             `gorm:"not null" json:"inviter_id"`
	InviteeID      uint             `gorm:"not null" json:"invitee_id"`
	Status         InvitationStatus `gorm:"type:varchar(10);default:'PENDING';not null" json:"status"`
	Message        *string          `json:"message"`
	CreatedAt      time.Time
	UpdatedAt      time.Time

	// Relationships
	SharedBudget SharedBudget `gorm:"constraint:OnDelete:CASCADE" json:"shared_budget,omitempty"`
	Inviter      User         `gorm:"foreignKey:InviterID;constraint:OnDelete:CASCADE" json:"inviter,omitempty"`
	Invitee      User         `gorm:"foreignKey:InviteeID;constraint:OnDelete:CASCADE" json:"invitee,omitempty"`

	// Unique constraint: one invitation per user per budget
	_ struct{} `gorm:"uniqueIndex:idx_shared_budget_invitation,shared_budget_id,invitee_id"`
}

type SharedBudgetTransaction struct {
	ID             uint    `gorm:"primarykey" json:"id"`
	SharedBudgetID uint    `gorm:"not null" json:"shared_budget_id"`
	UserID         uint    `gorm:"not null" json:"user_id"`
	AccountID      uint    `gorm:"not null" json:"account_id"`
	Amount         float64 `gorm:"type:decimal(15,2);not null" json:"amount"`
	Description    *string `json:"description"`
	CreatedAt      time.Time
	UpdatedAt      time.Time

	// Relationships
	SharedBudget SharedBudget `gorm:"constraint:OnDelete:CASCADE" json:"shared_budget,omitempty"`
	User         User         `gorm:"constraint:OnDelete:CASCADE" json:"user,omitempty"`
	Account      Account      `gorm:"constraint:OnDelete:CASCADE" json:"account,omitempty"`
}

// BeforeCreate hook for User to create default accounts
func (u *User) BeforeCreate(tx *gorm.DB) error {
	return nil
}

// AfterCreate hook for User to create default accounts
func (u *User) AfterCreate(tx *gorm.DB) error {
	// Create DEBIT account
	debitAccount := Account{
		UserID:  u.ID,
		Type:    AccountTypeDebit,
		Balance: 0,
	}
	if err := tx.Create(&debitAccount).Error; err != nil {
		return err
	}

	// Create CASH account
	cashAccount := Account{
		UserID:  u.ID,
		Type:    AccountTypeCash,
		Balance: 0,
	}
	if err := tx.Create(&cashAccount).Error; err != nil {
		return err
	}

	return nil
}
