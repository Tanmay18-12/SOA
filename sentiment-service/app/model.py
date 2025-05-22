import numpy as np
import os
import json
from transformers import pipeline
from app.config import ModelConfig
from app.utils import get_model_path

class SentimentModel:
    def __init__(self, config: ModelConfig):
        self.config = config
        self.version = config.model_version
        self.model_path = get_model_path(config.model_name, config.model_version)
        
        # Load the model
        try:
            # If model exists locally, load from disk
            if os.path.exists(self.model_path):
                self.sentiment_analyzer = pipeline("sentiment-analysis", 
                                                 model=self.model_path)
            else:
                # Otherwise, download from Hugging Face Hub
                self.sentiment_analyzer = pipeline("sentiment-analysis", 
                                                 model=config.model_name)
                # Save model for future use
                self.sentiment_analyzer.save_pretrained(self.model_path)
                
            print(f"Model loaded successfully: {config.model_name} (v{self.version})")
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise
            
    def predict(self, text: str):
        """
        Predict sentiment of input text.
        Returns a tuple of (sentiment, confidence_score)
        """
        if not text or len(text.strip()) == 0:
            return "neutral", 0.5
            
        # Get prediction from model
        result = self.sentiment_analyzer(text)[0]
        sentiment = result['label'].lower()
        confidence = result['score']
        
        return sentiment, float(confidence)
    
    def get_model_info(self):
        """Return model metadata"""
        return {
            "name": self.config.model_name,
            "version": self.version,
            "type": "sentiment-analysis"
        }