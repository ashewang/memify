package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

// Connect establishes a Postgres connection using pgx and applies baseline migrations.
func Connect(ctx context.Context, dsn string) (*sql.DB, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	// Conservative pool defaults for local development; tune when deploying.
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	if err := runMigrations(ctx, db); err != nil {
		db.Close()
		return nil, fmt.Errorf("run migrations: %w", err)
	}

	return db, nil
}

func runMigrations(ctx context.Context, db *sql.DB) error {
	const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
	id TEXT PRIMARY KEY,
	provider_name TEXT,
	provider_account_id TEXT,
	email TEXT,
	display_name TEXT,
	picture_url TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx ON users (LOWER(email));
`

	const alterUsersTable = `
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_account_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS users_provider_unique_idx
  ON users (provider_name, provider_account_id)
  WHERE provider_name IS NOT NULL AND provider_account_id IS NOT NULL;
`

	if _, err := db.ExecContext(ctx, createUsersTable); err != nil {
		return fmt.Errorf("create users table: %w", err)
	}

	if _, err := db.ExecContext(ctx, alterUsersTable); err != nil {
		return fmt.Errorf("alter users table: %w", err)
	}

	return nil
}
