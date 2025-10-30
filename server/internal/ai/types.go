package ai

// GenerationRequest models the payload sent to the Python AI service.
type GenerationRequest struct {
	ContextType string   `json:"context_type"`
	TextSnippet string   `json:"text_snippet,omitempty"`
	ImageBase64 string   `json:"image_base64,omitempty"`
	TagsHint    []string `json:"tags_hint,omitempty"`
	UserID      string   `json:"user_id,omitempty"`
}

// CaptionSuggestion mirrors the `CaptionSuggestion` schema returned by the AI service.
type CaptionSuggestion struct {
	Setup      string   `json:"setup"`
	Punchline  string   `json:"punchline"`
	Alternates []string `json:"alternates"`
}

// TemplateRecommendation describes the template selected by the AI service.
type TemplateRecommendation struct {
	TemplateID      string   `json:"template_id"`
	DisplayName     string   `json:"display_name"`
	AspectRatio     string   `json:"aspect_ratio"`
	HumorCategories []string `json:"humor_categories"`
}

// SafetySignal provides moderation or safety information from the AI pipeline.
type SafetySignal struct {
	Flag      string `json:"flag"`
	Severity  string `json:"severity"`
	Rationale string `json:"rationale"`
}

// GenerationResponse is the shape returned from the AI service after processing.
type GenerationResponse struct {
	JobID           string                 `json:"job_id"`
	Template        TemplateRecommendation `json:"template"`
	Captions        CaptionSuggestion      `json:"captions"`
	HumorCategories []string               `json:"humor_categories"`
	Safety          []SafetySignal         `json:"safety"`
	Reasoning       string                 `json:"reasoning"`
}

