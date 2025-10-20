import os
import uuid
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    CaptionSuggestion,
    MemeGenerationRequest,
    MemeGenerationResponse,
    SafetySignal,
    TemplateRecommendation,
)


def _allowed_origins() -> List[str]:
    raw = os.getenv("AI_ALLOWED_ORIGINS", "*")
    values = [value.strip() for value in raw.split(",") if value.strip()]

    if not values:
        return ["*"]

    if len(values) == 1 and values[0] == "*":
        return ["*"]

    return values


def create_app() -> FastAPI:
    app = FastAPI(
        title="Memify AI Pipeline",
        version="0.1.0",
        description="Extract humor signals, retrieve templates, and draft meme captions.",
    )

    origins = _allowed_origins()
    allow_all = len(origins) == 1 and origins[0] == "*"

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"] if allow_all else origins,
        allow_credentials=not allow_all,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_routes(app)

    return app


def register_routes(app: FastAPI) -> None:
    @app.get("/healthz")
    async def healthcheck() -> dict[str, str]:
        return {"status": "ok"}

    @app.post(
        "/v1/analyze",
        response_model=MemeGenerationResponse,
        summary="Analyze context and provide meme suggestions",
    )
    async def analyze(payload: MemeGenerationRequest) -> MemeGenerationResponse:
        if payload.text_snippet is None and payload.image_base64 is None:
            raise HTTPException(
                status_code=422,
                detail="A text snippet, screenshot, or both must be provided.",
            )

        job_id = str(uuid.uuid4())

        template = TemplateRecommendation(
            template_id="starter-drake-hotline",
            display_name="Drake Hotline Bling",
            aspect_ratio="4:5",
            humor_categories=["reaction", "relatable"],
        )

        captions = CaptionSuggestion(
            setup="When the team chat spirals into chaos",
            punchline="...and you realize it belongs on the timeline instead.",
            alternates=[
                "When your rant becomes tomorrow's trending meme draft.",
                "Me: venting in Slack. Memify: say no more fam.",
            ],
        )

        safety_signals: List[SafetySignal] = []
        if payload.tags_hint:
            safety_signals.append(
                SafetySignal(
                    flag="tags_hint_received",
                    severity="low",
                    rationale="User-provided humor tags are not yet influencing the pipeline. Stub recorded the request.",
                )
            )

        response = MemeGenerationResponse(
            job_id=job_id,
            template=template,
            captions=captions,
            humor_categories=["reaction", "meta"],
            safety=safety_signals,
        )

        return response


app = create_app()
