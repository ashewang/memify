package ai

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

// Client describes the behavior required to interact with the Python AI service.
type Client interface {
	GenerateSuggestion(ctx context.Context, payload GenerationRequest) (GenerationResponse, error)
}

// HTTPClient implements Client using the provided net/http client.
type HTTPClient struct {
	baseURL    string
	httpClient *http.Client
}

// NewClient configures a new HTTP-backed AI client.
func NewClient(baseURL string, httpClient *http.Client) *HTTPClient {
	client := httpClient
	if client == nil {
		client = &http.Client{
			Timeout: 25 * time.Second,
		}
	}

	return &HTTPClient{
		baseURL:    baseURL,
		httpClient: client,
	}
}

// GenerateSuggestion POSTs the request payload to /v1/analyze and returns the parsed response.
func (c *HTTPClient) GenerateSuggestion(ctx context.Context, payload GenerationRequest) (GenerationResponse, error) {
	url := fmt.Sprintf("%s/v1/analyze", c.baseURL)

	body, err := json.Marshal(payload)
	if err != nil {
		return GenerationResponse{}, fmt.Errorf("marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(body))
	if err != nil {
		return GenerationResponse{}, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return GenerationResponse{}, fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= http.StatusBadRequest {
		return GenerationResponse{}, fmt.Errorf("ai service returned status %d", resp.StatusCode)
	}

	var response GenerationResponse
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return GenerationResponse{}, fmt.Errorf("decode response: %w", err)
	}

	return response, nil
}

