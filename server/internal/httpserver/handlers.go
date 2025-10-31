package httpserver

import (
	"context"
	"crypto/subtle"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/anshuwang/memify/server/internal/ai"
	"github.com/anshuwang/memify/server/internal/users"
)

type memeGenerationRequest struct {
	ContextType string   `json:"context_type"`
	TextSnippet string   `json:"text_snippet"`
	ImageBase64 string   `json:"image_base64"`
	TagsHint    []string `json:"tags_hint"`
	UserID      string   `json:"user_id"`
	UserEmail   string   `json:"user_email"`
	UserName    string   `json:"user_name"`
	UserAvatar  string   `json:"user_avatar_url"`
}

type userSessionRequest struct {
	UserID      string `json:"user_id"`
	Provider    string `json:"provider"`
	ProviderID  string `json:"provider_account_id"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	PictureURL  string `json:"picture_url"`
}

func nullableString(value string) *string {
	if strings.TrimSpace(value) == "" {
		return nil
	}

	val := value
	return &val
}

func userSessionHandler(userRepo *users.Repository, sessionSecret string) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if userRepo == nil {
			log.Println("[debuglog] userSessionHandler disabled: repository not configured")
			ctx.JSON(http.StatusServiceUnavailable, gin.H{
				"error":   "persistence_unavailable",
				"message": "User persistence is not enabled.",
			})
			return
		}

		if strings.TrimSpace(sessionSecret) == "" {
			log.Println("[debuglog] userSessionHandler disabled: NEXTAUTH_SECRET missing")
			ctx.JSON(http.StatusServiceUnavailable, gin.H{
				"error":   "session_sync_disabled",
				"message": "Session syncing is disabled; configure NEXTAUTH_SECRET to enable.",
			})
			return
		}

		headerSecret := strings.TrimSpace(ctx.GetHeader("X-Memify-Session-Secret"))
		if headerSecret == "" || subtle.ConstantTimeCompare([]byte(headerSecret), []byte(sessionSecret)) != 1 {
			log.Println("[debuglog] userSessionHandler unauthorized: secret mismatch")
			ctx.JSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "Invalid session secret.",
			})
			return
		}

		var payload userSessionRequest
		if err := ctx.ShouldBindJSON(&payload); err != nil {
			log.Printf("[debuglog] userSessionHandler invalid JSON: %v\n", err)
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error":   "invalid_request",
				"message": err.Error(),
			})
			return
		}

		if strings.TrimSpace(payload.UserID) == "" {
			log.Println("[debuglog] userSessionHandler missing user_id")
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error":   "missing_user_id",
				"message": "user_id is required.",
			})
			return
		}

		if strings.TrimSpace(payload.Provider) == "" || strings.TrimSpace(payload.ProviderID) == "" {
			log.Println("[debuglog] userSessionHandler missing provider metadata")
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error":   "missing_provider",
				"message": "provider and provider_account_id are required.",
			})
			return
		}

		if err := userRepo.Upsert(ctx.Request.Context(), users.User{
			ID:                payload.UserID,
			ProviderName:      nullableString(payload.Provider),
			ProviderAccountID: nullableString(payload.ProviderID),
			Email:             nullableString(payload.Email),
			DisplayName:       nullableString(payload.DisplayName),
			PictureURL:        nullableString(payload.PictureURL),
		}); err != nil {
			log.Printf("[debuglog] userSessionHandler upsert error: %v\n", err)
			ctx.JSON(http.StatusInternalServerError, gin.H{
				"error":   "user_persistence_error",
				"message": err.Error(),
			})
			return
		}

		log.Printf("[debuglog] userSessionHandler success user_id=%s provider=%s\n", payload.UserID, payload.Provider)
		ctx.JSON(http.StatusOK, gin.H{
			"status":              "synced",
			"user_id":             payload.UserID,
			"provider":            payload.Provider,
			"provider_account_id": payload.ProviderID,
		})
	}
}

func memeGenerateHandler(aiClient ai.Client, userRepo *users.Repository) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		var payload memeGenerationRequest
		if err := ctx.ShouldBindJSON(&payload); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error":   "invalid_request",
				"message": err.Error(),
			})
			return
		}

		if payload.ContextType == "" {
			payload.ContextType = "text"
		}

		if payload.TextSnippet == "" && payload.ImageBase64 == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"error":   "missing_context",
				"message": "Provide either text_snippet, image_base64, or both.",
			})
			return
		}

		if payload.UserID != "" && userRepo != nil {
			if err := userRepo.Upsert(ctx.Request.Context(), users.User{
				ID:          payload.UserID,
				Email:       nullableString(payload.UserEmail),
				DisplayName: nullableString(payload.UserName),
				PictureURL:  nullableString(payload.UserAvatar),
			}); err != nil {
				log.Printf("[debuglog] memeGenerateHandler user upsert error: user_id=%s err=%v\n", payload.UserID, err)
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error":   "user_persistence_error",
					"message": err.Error(),
				})
				return
			}

			log.Printf("[debuglog] memeGenerateHandler user upsert success: user_id=%s\n", payload.UserID)
		}

		request := ai.GenerationRequest{
			ContextType: payload.ContextType,
			TextSnippet: payload.TextSnippet,
			ImageBase64: payload.ImageBase64,
			TagsHint:    payload.TagsHint,
			UserID:      payload.UserID,
		}

		timeoutCtx, cancel := context.WithTimeout(ctx.Request.Context(), 20*time.Second)
		defer cancel()

		response, err := aiClient.GenerateSuggestion(timeoutCtx, request)
		if err != nil {
			ctx.JSON(http.StatusBadGateway, gin.H{
				"error":   "ai_service_error",
				"message": err.Error(),
			})
			return
		}

		ctx.JSON(http.StatusOK, response)
	}
}
