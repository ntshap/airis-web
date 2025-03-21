import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from predictor import AirQualityPredictor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AIRIS ML Predictions API")

# Initialize predictor with correct path
try:
    # Get the directory where api.py is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'air_quality_lstm_model.h5')
    
    logger.info(f"Looking for model at: {model_path}")
    predictor = AirQualityPredictor(model_path)
    logger.info("ML model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load ML model: {str(e)}")
    raise