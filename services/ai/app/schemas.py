from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ContextType(str, Enum):
    TEXT = "text"
    SCREENSHOT = "screenshot"
    MIXED = "mixed"


class MemeGenerationRequest(BaseModel):
    context_type: ContextType = Field(
        default=ContextType.TEXT,
        description="Type of context supplied by the client.",
    )
    text_snippet: Optional[str] = Field(
        default=None,
        description="Raw text provided by the user. Optional when a screenshot is supplied.",
        max_length=12000,
    )
    image_base64: Optional[str] = Field(
        default=None,
        description="Base64-encoded screenshot pasted from the clipboard.",
    )
    tags_hint: List[str] = Field(
        default_factory=list,
        description="Optional list of humor tags that the client wants to emphasize.",
    )
    user_id: Optional[str] = Field(
        default=None,
        description="Optional user identifier to tune personalization.",
    )


class CaptionSuggestion(BaseModel):
    setup: str = Field(description="Top caption or setup text for the meme template.")
    punchline: str = Field(
        description="Bottom caption or punchline text for the meme template."
    )
    alternates: List[str] = Field(
        default_factory=list,
        description="Optional extra punchline ideas to show in the UI for quick swaps.",
    )


class TemplateRecommendation(BaseModel):
    template_id: str
    display_name: str
    aspect_ratio: str = Field(
        default="1:1", description="Aspect ratio hint such as 1:1, 4:5, 16:9."
    )
    humor_categories: List[str] = Field(
        default_factory=list,
        description="Humor taxonomies that best match the template choice.",
    )


class SafetySignal(BaseModel):
    flag: str
    severity: str = Field(default="low")
    rationale: str


class MemeGenerationResponse(BaseModel):
    job_id: str
    template: TemplateRecommendation
    captions: CaptionSuggestion
    humor_categories: List[str] = Field(default_factory=list)
    safety: List[SafetySignal] = Field(default_factory=list)
    reasoning: str = Field(
        default="AI pipeline stub — integrate LLM + retrieval to generate reasoning.",
        description="Freeform string describing why the AI chose the template and captions.",
    )

