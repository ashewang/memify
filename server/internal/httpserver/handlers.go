package httpserver

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/anshuwang/memify/server/internal/ai"
)

type memeGenerationRequest struct {
	ContextType string   `json:"context_type"`
	TextSnippet string   `json:"text_snippet"`
	ImageBase64 string   `json:"image_base64"`
	TagsHint    []string `json:"tags_hint"`
	UserID      string   `json:"user_id"`
}

func memeGenerateHandler(aiClient ai.Client) gin.HandlerFunc {
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
