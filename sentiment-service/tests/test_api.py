import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "sentiment-analysis"

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
    assert "model_version" in response.json()

def test_sentiment_prediction_positive():
    response = client.post(
        "/predict",
        json={"text": "I love this product, it's amazing!"}
    )
    assert response.status_code == 200
    result = response.json()
    assert "sentiment" in result
    assert "confidence" in result
    assert result["sentiment"] in ["positive", "POSITIVE"]
    assert 0 <= result["confidence"] <= 1

def test_sentiment_prediction_negative():
    response = client.post(
        "/predict",
        json={"text": "This is terrible, I hate it."}
    )
    assert response.status_code == 200
    result = response.json()
    assert "sentiment" in result
    assert result["sentiment"] in ["negative", "NEGATIVE"]
    assert 0 <= result["confidence"] <= 1

def test_empty_input():
    response = client.post(
        "/predict",
        json={"text": ""}
    )
    assert response.status_code == 200
    result = response.json()
    assert result["sentiment"] == "neutral"
    assert result["confidence"] == 0.5