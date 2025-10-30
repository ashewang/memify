export type MemeGenerationRequest = {
  context_type?: "text" | "screenshot" | "mixed";
  text_snippet?: string;
  image_base64?: string;
  tags_hint?: string[];
  user_id?: string;
};

export type TemplateRecommendation = {
  template_id: string;
  display_name: string;
  aspect_ratio: string;
  humor_categories: string[];
};

export type CaptionSuggestion = {
  setup: string;
  punchline: string;
  alternates: string[];
};

export type SafetySignal = {
  flag: string;
  severity: string;
  rationale: string;
};

export type MemeGenerationResponse = {
  job_id: string;
  template: TemplateRecommendation;
  captions: CaptionSuggestion;
  humor_categories: string[];
  safety: SafetySignal[];
  reasoning: string;
};

