package config

import (
	"log"
	"os"
	"strings"
)

// Config models the runtime environment for the Go API.
type Config struct {
	Environment      string
	HTTPPort         string
	AllowedOrigins   []string
	PythonServiceURL string
	DatabaseURL      string
}

// Load builds a Config from environment variables with sensible defaults for local development.
func Load() Config {
	cfg := Config{
		Environment:      getEnv("APP_ENV", "development"),
		HTTPPort:         getEnv("API_PORT", "8080"),
		AllowedOrigins:   parseCSV(getEnv("API_ALLOWED_ORIGINS", "*")),
		PythonServiceURL: getEnv("PYTHON_SERVICE_URL", "http://localhost:8000"),
		DatabaseURL:      os.Getenv("DATABASE_URL"),
	}

	if cfg.DatabaseURL == "" {
		log.Println("warning: DATABASE_URL is not set; persistence features will be disabled until configured")
	}

	return cfg
}

// IsDevelopment reports whether the application is running in a development environment.
func (c Config) IsDevelopment() bool {
	return strings.ToLower(c.Environment) == "development"
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists && value != "" {
		return value
	}
	return fallback
}

func parseCSV(input string) []string {
	fields := strings.Split(input, ",")
	var results []string

	for _, field := range fields {
		value := strings.TrimSpace(field)
		if value != "" {
			results = append(results, value)
		}
	}

	if len(results) == 0 {
		return []string{"*"}
	}

	return results
}

