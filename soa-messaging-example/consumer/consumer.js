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
const messagesReceived = new promClient.Counter({
  name: 'consumer_messages_received_total',
  help: 'Total number of messages received from RabbitMQ',
  labelNames: ['type'],
  registers: [register]
});

const messagesProcessed = new promClient.Counter({
  name: 'consumer_messages_processed_total',
  help: 'Total number of messages successfully processed',
  labelNames: ['type'],
  registers: [register]
});

const messagesErrors = new promClient.Counter({
  name: 'consumer_messages_error_total',
  help: 'Total number of errors when processing messages',
  labelNames: ['type'],
  registers: [register]
});

const messageProcessingTime = new promClient.Histogram({
  name: 'consumer_message_processing_time_seconds',
  help: 'Time spent processing messages in seconds',
  labelNames: ['type'],
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
  defaultMeta: { service: 'consumer-service' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'consumer.log' })
  ]
});

// Initialize Express for the metrics endpoint
const app = express();
const METRICS_PORT = 8080;

// Constants
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
const EXCHANGE_NAME = 'orders';
const QUEUE_NAME = 'orders_processing';

// Connect to RabbitMQ and start consuming messages
async function connectAndConsume() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Setup exchange
    await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
    
    // Create queue
    const q = await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    // Bind queue to exchange
    await channel.bindQueue(q.queue, EXCHANGE_NAME, '');
    
    logger.info(`Connected to RabbitMQ, waiting for messages on queue: ${QUEUE_NAME}`);
    
    // Set prefetch to process one message at a time
    await channel.prefetch(1);
    
    // Start consuming messages
    await channel.consume(q.queue, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          const routingKey = msg.fields.routingKey;
          
          // Increment messages received counter
          messagesReceived.inc({ type: routingKey });
          
          logger.info(`Received message: ${routingKey}`, content);
          
          // Process the message based on the routing key and track processing time
          const timer = messageProcessingTime.startTimer({ type: routingKey });
          await processMessage(routingKey, content);
          timer();
          
          // Acknowledge the message
          channel.ack(msg);
          
          // Increment messages processed counter
          messagesProcessed.inc({ type: routingKey });
          
          logger.info(`Message processed successfully: ${routingKey}`);
        } catch (err) {
          // Increment error counter
          messagesErrors.inc({ type: msg.fields.routingKey || 'unknown' });
          
          logger.error('Error processing message', err);
          
          // Reject the message and requeue it
          channel.nack(msg, false, true);
        }
      }
    });
    
    // Handle connection events
    connection.on('error', (err) => {
      logger.error('RabbitMQ connection error', err);
      setTimeout(connectAndConsume, 5000);
    });
    
    connection.on('close', () => {
      logger.error('RabbitMQ connection closed');
      setTimeout(connectAndConsume, 5000);
    });
  } catch (err) {
    logger.error('Failed to connect to RabbitMQ', err);
    setTimeout(connectAndConsume, 5000);
  }
}

// Process the received message based on routing key
async function processMessage(routingKey, content) {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real-world scenario, you would store the data in a database,
  // trigger workflows, or perform other business logic
  switch (routingKey) {
    case 'new.order':
      logger.info(`Processing new order: ${content.id}`);
      // Example: Store order in database
      // await db.orders.insert(content);
      break;
      
    case 'update.order':
      logger.info(`Processing order update: ${content.id}`);
      // Example: Update order in database
      // await db.orders.update({ id: content.id }, content);
      break;
      
    default:
      logger.info(`Processing generic message: ${routingKey}`);
      // Handle other message types
  }
}

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Start the metrics server
app.listen(METRICS_PORT, () => {
  logger.info(`Metrics endpoint listening on port ${METRICS_PORT}`);
});

// Start the consumer
connectAndConsume().catch(err => {
  logger.error('Fatal error', err);
  process.exit(1);
});