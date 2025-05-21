const express = require('express');
const amqp = require('amqplib');
const winston = require('winston');
const promClient = require('prom-client');

// Initialize Prometheus metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
const Registry = promClient.Registry;
const register = new Registry();
collectDefaultMetrics({ register });

// Create custom metrics
const messagesSent = new promClient.Counter({
  name: 'publisher_messages_sent_total',
  help: 'Total number of messages sent to RabbitMQ',
  labelNames: ['type'],
  registers: [register]
});

const messageSendErrors = new promClient.Counter({
  name: 'publisher_message_send_errors_total',
  help: 'Total number of errors when sending messages to RabbitMQ',
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'publisher_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'publisher-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'publisher.log' })
  ]
});

// Constants
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const EXCHANGE_NAME = 'orders';
const PORT = 3000;

// Initialize Express
const app = express();
app.use(express.json());

// Add response time metrics middleware
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
  });
  next();
});

// Message broker connection
let channel;

// Connect to RabbitMQ
async function connectToRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Create exchange if it doesn't exist
    await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
    
    logger.info('Connected to RabbitMQ');
    
    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error', err);
      setTimeout(connectToRabbitMQ, 5000);
    });
    
    connection.on('close', () => {
      logger.error('RabbitMQ connection closed');
      setTimeout(connectToRabbitMQ, 5000);
    });
  } catch (err) {
    logger.error('Failed to connect to RabbitMQ', err);
    setTimeout(connectToRabbitMQ, 5000);
  }
}

// Publish message to RabbitMQ
function publishMessage(routingKey, message) {
  try {
    if (channel) {
      channel.publish(
        EXCHANGE_NAME,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
      
      // Increment message counter
      messagesSent.inc({ type: routingKey });
      
      logger.info(`Message published: ${JSON.stringify(message)}`);
      return true;
    }
    return false;
  } catch (err) {
    // Increment error counter
    messageSendErrors.inc();
    
    logger.error('Error publishing message', err);
    return false;
  }
}

// API endpoint to create a new order
app.post('/orders', (req, res) => {
  const order = {
    id: Math.floor(Math.random() * 10000),
    customer: req.body.customer,
    items: req.body.items,
    total: req.body.total,
    timestamp: new Date().toISOString()
  };
  
  const published = publishMessage('new.order', order);
  
  if (published) {
    logger.info(`New order created: ${order.id}`);
    res.status(202).json({
      message: 'Order has been accepted for processing',
      orderId: order.id
    });
  } else {
    logger.error('Failed to publish order message');
    res.status(503).json({
      message: 'Service unavailable, please try again later'
    });
  }
});

// API endpoint to update order data
app.put('/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id);
  const updateData = {
    id: orderId,
    ...req.body,
    timestamp: new Date().toISOString()
  };
  
  const published = publishMessage('update.order', updateData);
  
  if (published) {
    logger.info(`Order updated: ${orderId}`);
    res.status(202).json({
      message: 'Order update has been accepted for processing',
      orderId: orderId
    });
  } else {
    logger.error('Failed to publish order update message');
    res.status(503).json({
      message: 'Service unavailable, please try again later'
    });
  }
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Start the server
app.listen(PORT, () => {
  logger.info(`Publisher service listening on port ${PORT}`);
  connectToRabbitMQ();
});