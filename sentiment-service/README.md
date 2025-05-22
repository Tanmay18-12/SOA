# Sentiment Analysis Service

A simple AI-driven service for text sentiment analysis within an SOA architecture.

## Features

- Text sentiment analysis (positive/negative classification)
- REST API with FastAPI
- Docker containerization
- MLOps capabilities (model versioning, testing)
- Integration with other services

## Architecture

This service follows SOA principles, encapsulating the ML model in a containerized service that communicates via REST endpoints.

```
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│  Client Service │─────▶│ Sentiment       │
│  (Frontend/API) │      │ Analysis Service│
│                 │◀─────│                 │
└─────────────────┘      └─────────────────┘
```

## Quickstart

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/sentiment-service.git
cd sentiment-service
```

### 2. Run with Docker

```bash
docker-compose up -d
```

This will:
- Build the Docker image
- Start the sentiment analysis service on port 8000
- Start a demo client on port 8080

### 3. Use the API

Send a request:

```bash
curl -X POST http://localhost:8000/predict \
     -H "Content-Type: application/json" \
     -d '{"text":"I really enjoyed this product!"}'
```

## Service Endpoints

- `GET /`: Service information
- `GET /health`: Health check with model version information
- `POST /predict`: Analyze text sentiment

## Updating the Model

To update the model:

1. Modify the `MODEL_VERSION` environment variable in `docker-compose.yml`
2. Restart the service:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Running Tests

```bash
pytest tests/
```

## Model Versioning and MLOps

This service includes:
- Model versioning
- Independent model scaling
- Automated testing for model behavior
- Health checks to monitor service status

## Integration Examples

See the `docker-compose.yml` file for an example of integrating this service with a frontend client.