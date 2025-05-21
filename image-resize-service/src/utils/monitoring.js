const AWS = require('aws-sdk');

// Initialize CloudWatch client
const cloudwatch = new AWS.CloudWatch();

/**
 * Record custom metrics to CloudWatch
 * 
 * @param {string} metricName - Name of the metric
 * @param {number} value - Metric value
 * @param {string} unit - CloudWatch unit (Count, Milliseconds, etc.)
 */
async function recordMetric(metricName, value, unit = 'Count') {
  try {
    await cloudwatch.putMetricData({
      Namespace: 'ImageResizeService',
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Dimensions: [
          {
            Name: 'Environment',
            Value: process.env.STAGE || 'dev'
          }
        ]
      }]
    }).promise();
  } catch (error) {
    console.error(`Error recording metric ${metricName}:`, error);
  }
}

/**
 * Record function execution time
 * 
 * @param {number} duration - Duration in milliseconds
 */
function recordExecutionTime(duration) {
  return recordMetric('ExecutionTime', duration, 'Milliseconds');
}

/**
 * Record function invocation
 */
function recordInvocation() {
  return recordMetric('Invocations', 1);
}

/**
 * Record function errors
 */
function recordError() {
  return recordMetric('Errors', 1);
}

/**
 * Record image size
 * 
 * @param {number} inputSize - Input image size in bytes
 * @param {number} outputSize - Output image size in bytes
 */
function recordImageSizes(inputSize, outputSize) {
  return Promise.all([
    recordMetric('InputImageSize', inputSize, 'Bytes'),
    recordMetric('OutputImageSize', outputSize, 'Bytes'),
    recordMetric('CompressionRatio', inputSize / outputSize, 'None')
  ]);
}

/**
 * Create middleware to track function execution time
 * 
 * @param {Function} handler - Lambda handler function
 * @returns {Function} - Wrapped handler function
 */
function monitorHandler(handler) {
  return async (event, context) => {
    const startTime = Date.now();
    try {
      // Record invocation
      await recordInvocation();
      
      // Call the original handler
      const result = await handler(event, context);
      
      // Record execution time
      const duration = Date.now() - startTime;
      await recordExecutionTime(duration);
      
      return result;
    } catch (error) {
      // Record error
      await recordError();
      
      // Record execution time on error as well
      const duration = Date.now() - startTime;
      await recordExecutionTime(duration);
      
      // Re-throw the error
      throw error;
    }
  };
}

module.exports = {
  recordMetric,
  recordExecutionTime,
  recordInvocation,
  recordError,
  recordImageSizes,
  monitorHandler
};