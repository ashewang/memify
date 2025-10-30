package users

import (
	"context"
	"database/sql"
	"errors"
	"strings"
	"time"
)

// Repository provides persistence helpers for user records.
type Repository struct {
	db *sql.DB
}

// NewRepository constructs a Repository backed by the provided *sql.DB.
func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

// User models the minimal attributes we persist for authenticated users.
type User struct {
	ID          string
	Email       *string
	DisplayName *string
	PictureURL  *string
}

// Upsert inserts a user or updates existing attributes, stamping the last_seen_at column.
func (r *Repository) Upsert(ctx context.Context, user User) error {
	if r == nil || r.db == nil {
		return errors.New("users repository is not configured")
	}

	if strings.TrimSpace(user.ID) == "" {
		return errors.New("user id is required")
	}

	email := normalize(user.Email)
	displayName := normalize(user.DisplayName)
	pictureURL := normalize(user.PictureURL)

	const query = `
INSERT INTO users (id, email, display_name, picture_url, created_at, updated_at, last_seen_at)
VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
	email = COALESCE(EXCLUDED.email, users.email),
	display_name = COALESCE(EXCLUDED.display_name, users.display_name),
	picture_url = COALESCE(EXCLUDED.picture_url, users.picture_url),
	updated_at = NOW(),
	last_seen_at = NOW();
`

	_, err := r.db.ExecContext(ctx, query, user.ID, email, displayName, pictureURL)
	return err
}

func normalize(value *string) any {
	if value == nil {
		return nil
	}

	val := strings.TrimSpace(*value)
	if val == "" {
		return nil
	}

	return val
}

// LastSeen updates the last_seen_at column for the given user.
func (r *Repository) LastSeen(ctx context.Context, userID string, ts time.Time) error {
	if r == nil || r.db == nil {
		return errors.New("users repository is not configured")
	}

	if strings.TrimSpace(userID) == "" {
		return errors.New("user id is required")
	}

	const query = `
UPDATE users
SET last_seen_at = $2,
    updated_at = NOW()
WHERE id = $1;
`

	_, err := r.db.ExecContext(ctx, query, userID, ts.UTC())
	return err
}
