# app/routes/feedback_routes.py

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
import logging
import json
import os

logger = logging.getLogger(__name__)

router = APIRouter()

class FeedbackRequest(BaseModel):
    user_id: str
    logo_name: str
    rating: int  # Assume a rating from 1 to 5
    comments: str

@router.post("/feedback")
async def submit_feedback(request: Request, feedback: FeedbackRequest):
    """
    Endpoint to submit feedback on generated logos.
    """
    logger.info(f"Received feedback: {feedback}")

    feedback_file = "feedback.json"
    try:
        # Load existing feedback if it exists
        if os.path.exists(feedback_file):
            with open(feedback_file, "r") as f:
                feedback_data = json.load(f)
        else:
            feedback_data = []

        # Append new feedback
        feedback_data.append(feedback.dict())

        # Save feedback back to the file
        with open(feedback_file, "w") as f:
            json.dump(feedback_data, f, indent=4)

        return {"status": "Feedback submitted successfully"}
    
    except Exception as e:
        logger.error(f"Failed to save feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

