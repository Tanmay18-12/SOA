# Serverless Image Resizing Service - Architecture Documentation

## Overview

This project implements a serverless image resizing service integrated with an existing microservice ecosystem. It demonstrates the Function-as-a-Service (FaaS) approach to handle specific tasks within a Service-Oriented Architecture (SOA).

## Architecture Components

![Architecture Diagram](https://via.placeholder.com/800x400?text=Serverless+Image+Resizing+Architecture)

### 1. Serverless Function (AWS Lambda)
- **Purpose**: Handles image resizing operations
- **Implementation**: Node.js with Sharp library
- **Triggers**: HTTP requests via API Gateway
- **Storage**: Uploads resized images to S3 bucket

### 2. API Gateway
- Exposes the Lambda function as a RESTful API endpoint
- Handles authentication and request validation
- Provides CORS support for web clients

### 3. Client Application
- Simple Express.js web application
- Provides user interface for uploading and resizing images
- Communicates with the serverless function via HTTP

### 4. Storage Service (AWS S3)
- Stores the resized images
- Provides public URLs for accessing the images
- Manages image lifecycle (auto-deletion if needed)

### 5. Monitoring and Observability
- CloudWatch for metrics and logging
- Custom metrics for function performance
- Cost tracking for serverless invocations

## Data Flow

1. User uploads an image through the client application
2. Client application sends the image to the serverless function via API Gateway
3. Serverless function processes the image (resizing)
4. Resized image is stored in S3 bucket
5. URL to the resized image is returned to the client
6. Client displays the original and resized images to the user
7. Metrics about the operation are recorded in CloudWatch

## Key Characteristics

### Scalability
- Serverless functions automatically scale based on demand
- No infrastructure management required
- Can handle varying loads without provisioning

### Cost Efficiency
- Pay-per-use model for serverless functions
- No costs when the service is not in use
- Resource allocation matched to actual demand

### Cold Starts
- First request might experience latency due to cold starts
- Subsequent requests are faster as the function stays "warm"
- Configuration options like provisioned concurrency can mitigate cold starts

### Integration Points
- REST API for client-service communication
- S3 for persistent storage
- CloudWatch for monitoring and logging

## Deployment Process

1. Configure AWS credentials
2. Install dependencies (`npm install`)
3. Deploy serverless function (`npm run deploy`)
4. Note the endpoint URL returned from deployment
5. Start the client application with the endpoint URL (`RESIZE_SERVICE_URL=<endpoint> npm start`)

## Cost Monitoring

The architecture includes custom metrics for:
- Function invocation count
- Execution time
- Input/output image sizes
- Compression ratio

These metrics can be used to create CloudWatch dashboards for monitoring costs and performance.

## Limitations

- Maximum payload size limited by API Gateway (10MB)
- Maximum execution time for Lambda functions (default 30s)
- Cold starts can impact latency for infrequent requests