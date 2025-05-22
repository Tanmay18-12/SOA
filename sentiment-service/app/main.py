from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from app.model import SentimentModel
from app.config import ModelConfig

# Initialize FastAPI app
app = FastAPI(title="Sentiment Analysis Service",
              description="A service for analyzing text sentiment",
              version="1.0.0")

# Initialize sentiment model
model_config = ModelConfig()
sentiment_model = SentimentModel(model_config)

# Define request/response models
class SentimentRequest(BaseModel):
    text: str
    
class SentimentResponse(BaseModel):
    text: str
    sentiment: str
    confidence: float
    model_version: str

@app.get("/")
def read_root():
    return {"status": "active", "service": "sentiment-analysis"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_version": sentiment_model.version}

@app.post("/predict", response_model=SentimentResponse)
def predict_sentiment(request: SentimentRequest):
    try:
        sentiment, confidence = sentiment_model.predict(request.text)
        return {
            "text": request.text,
            "sentiment": sentiment,
            "confidence": confidence,
            "model_version": sentiment_model.version
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)