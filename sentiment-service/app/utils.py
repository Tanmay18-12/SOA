import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("sentiment-service")

def get_model_path(model_name: str, model_version: str) -> str:
    """
    Generate the path where the model should be stored
    """
    # Create safe directory name from model name
    safe_model_name = model_name.replace("/", "_")
    
    # Construct path
    model_dir = Path("models") / f"{safe_model_name}-{model_version}"
    
    # Ensure directory exists
    os.makedirs(model_dir, exist_ok=True)
    
    return str(model_dir)

def log_prediction(text: str, sentiment: str, confidence: float, model_version: str):
    """
    Log prediction details - can be extended to store in a database
    or monitoring system
    """
    # Simple logging for now, but could send to a monitoring service
    logger.info(
        f"Prediction: '{text[:20]}...' -> {sentiment} "
        f"(confidence: {confidence:.4f}, model: v{model_version})"
    )
    
def sanitize_input(text: str) -> str:
    """
    Clean and prepare text input for the model
    """
    if not text:
        return ""
        
    # Basic cleaning, can be expanded based on model requirements
    text = text.strip()
    
    # Truncate very long text to avoid overloading the model
    max_length = 512
    if len(text) > max_length:
        text = text[:max_length]
        
    return text