package httpserver

import (
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"github.com/anshuwang/memify/server/internal/ai"
	"github.com/anshuwang/memify/server/internal/config"
	"github.com/anshuwang/memify/server/internal/users"
)

// NewRouter constructs the Gin engine with baseline middleware and public routes.
func NewRouter(cfg config.Config, userRepo *users.Repository) *gin.Engine {
	if cfg.IsDevelopment() {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger(), gin.Recovery())
	router.Use(cors.New(corsConfig(cfg)))

	registerSystemEndpoints(router)
	aiClient := ai.NewClient(cfg.PythonServiceURL, nil)
	registerAPIRoutes(router.Group("/api"), aiClient, userRepo)

	return router
}

func corsConfig(cfg config.Config) cors.Config {
	c := cors.Config{
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{
			"Authorization",
			"Content-Type",
			"X-Requested-With",
		},
		ExposeHeaders: []string{
			"Content-Length",
		},
		MaxAge:           12 * time.Hour,
		AllowCredentials: true,
	}

	if len(cfg.AllowedOrigins) == 1 && cfg.AllowedOrigins[0] == "*" {
		c.AllowAllOrigins = true
	} else {
		c.AllowOrigins = cfg.AllowedOrigins
	}

	return c
}

func registerSystemEndpoints(router *gin.Engine) {
	router.GET("/healthz", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status": "ok",
		})
	})

	router.GET("/readyz", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"status": "ready",
		})
	})
}

func registerAPIRoutes(group *gin.RouterGroup, aiClient ai.Client, userRepo *users.Repository) {
	group.GET("/ping", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"message": "pong",
		})
	})

	// --- Authentication & user account routes ---
	group.GET("/auth/providers", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"providers": []string{"google"},
		})
	})

	group.POST("/memes/generate", memeGenerateHandler(aiClient, userRepo))

	group.GET("/templates", func(ctx *gin.Context) {
		ctx.JSON(http.StatusOK, gin.H{
			"data": []gin.H{},
		})
	})
}
