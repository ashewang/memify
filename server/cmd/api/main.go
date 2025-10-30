package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/anshuwang/memify/server/internal/config"
	"github.com/anshuwang/memify/server/internal/database"
	"github.com/anshuwang/memify/server/internal/httpserver"
	"github.com/anshuwang/memify/server/internal/users"
)

func main() {
	cfg := config.Load()
	var (
		db       *sql.DB
		userRepo *users.Repository
	)

	if cfg.DatabaseURL == "" {
		log.Println("warning: DATABASE_URL not set; user persistence will be disabled")
	} else {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		var err error
		db, err = database.Connect(ctx, cfg.DatabaseURL)
		if err != nil {
			log.Fatalf("failed to connect to database: %v", err)
		}
		userRepo = users.NewRepository(db)
	}
	defer func() {
		if db != nil {
			if err := db.Close(); err != nil {
				log.Printf("error closing database connection: %v", err)
			}
		}
	}()

	router := httpserver.NewRouter(cfg, userRepo)

	httpServer := &http.Server{
		Addr:              fmt.Sprintf(":%s", cfg.HTTPPort),
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("memify api listening on %s", httpServer.Addr)

		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("failed to start server: %v", err)
		}
	}()

	shutdownCh := make(chan os.Signal, 1)
	signal.Notify(shutdownCh, syscall.SIGTERM, syscall.SIGINT)

	<-shutdownCh
	log.Println("received shutdown signal, closing http server")

	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(ctx); err != nil {
		log.Fatalf("server forced to shutdown: %v", err)
	}

	log.Println("server exited gracefully")
}
