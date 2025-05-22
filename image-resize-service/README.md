# Image Resizing Serverless Function

This project implements a serverless image resizing service using AWS Lambda and API Gateway. The function can be integrated into existing SOA/microservice architectures to handle image processing tasks.

## Prerequisites

1. AWS CLI installed and configured
2. AWS SAM CLI installed
3. Node.js and npm installed
4. An AWS account with appropriate permissions

## Setup Instructions

### 1. Install Dependencies

Navigate to the function directory and install dependencies:

```bash
cd function
npm install
```

### 2. Deploy the Stack

Navigate to the infrastructure directory and deploy using SAM:

```bash
cd ../infrastructure
sam build
sam deploy --guided
```

Follow the prompts to complete the deployment. When the deployment is complete, note the API Gateway endpoint URL from the outputs.

## Testing the Function

You can test the function using curl or any API client:

```bash
curl -X POST \
  https://your-api-id.execute-api.your-region.amazonaws.com/Prod/resize \
  -H 'Content-Type: application/json' \
  -d '{
    "bucket": "source-bucket-name",
    "key": "path/to/source-image.jpg",
    "width": 300,
    "height": 200,
    "outputBucket": "destination-bucket-name",
    "outputKey": "path/to/resized-image.jpg"
  }'
```

## Integration with Microservices

This function can be integrated with other services by:

1. Making HTTP calls to the API Gateway endpoint
2. Setting up event-driven triggers (e.g., S3 events)
3. Orchestrating with AWS Step Functions

## Monitoring and Observability

The deployment includes a CloudWatch dashboard that provides metrics for:

- Function invocations
- Error rates
- Execution duration
- API Gateway latency
- 4XX and 5XX errors

You can access this dashboard in the CloudWatch console under "Dashboards" with the name "ImageResizeFunctionDashboard-{stack-name}".

## Cost Considerations

This serverless architecture incurs costs based on:

- Number of invocations
- Function execution time
- API Gateway requests
- Data transfer
- S3 storage and operations

The pay-per-use model ensures you only pay for what you use, but be mindful of potential cold starts affecting performance.