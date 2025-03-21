from fastapi import FastAPI
from ML.predictor import AirQualityPredictor
from pydantic import BaseModel

app = FastAPI()
predictor = AirQualityPredictor()

class SensorData(BaseModel):
    co2: float
    pm25: float
    co: float
    temperature: float
    humidity: float

@app.post("/predict")
async def predict(data: SensorData):
    prediction = predictor.predict(data.dict())
    return prediction

@app.get("/")
async def root():
    return {"message": "Air Quality Prediction API"}