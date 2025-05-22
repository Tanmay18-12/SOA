import os
from pydantic import BaseSettings

class ModelConfig(BaseSettings):
    # Model configuration
    model_name: str = "distilbert-base-uncased-finetuned-sst-2-english"
    model_version: str = "1.0.0"
    
    # Paths
    models_dir: str = os.environ.get("MODELS_DIR", "./models")
    
    # Service configuration
    service_name: str = "sentiment-analysis-service"
    
    class Config:
        env_file = ".env"  # Optional: Load from env file if present