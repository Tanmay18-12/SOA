import pytest
from app.model import SentimentModel
from app.config import ModelConfig

@pytest.fixture
def model():
    config = ModelConfig()
    return SentimentModel(config)

def test_model_initialization(model):
    assert model is not None
    assert hasattr(model, 'sentiment_analyzer')
    assert hasattr(model, 'version')

def test_positive_sentiment(model):
    text = "I am very happy with this product!"
    sentiment, confidence = model.predict(text)
    assert sentiment.lower() == "positive"
    assert 0.5 < confidence <= 1.0

def test_negative_sentiment(model):
    text = "This is the worst experience ever."
    sentiment, confidence = model.predict(text)
    assert sentiment.lower() == "negative"
    assert 0.5 < confidence <= 1.0

def test_empty_input(model):
    text = ""
    sentiment, confidence = model.predict(text)
    assert sentiment == "neutral"
    assert confidence == 0.5

def test_model_info(model):
    info = model.get_model_info()
    assert "name" in info
    assert "version" in info
    assert "type" in info
    assert info["type"] == "sentiment-analysis"