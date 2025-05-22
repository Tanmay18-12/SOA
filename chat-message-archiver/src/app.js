const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const messageController = require('./controllers/messageController');

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ SECURITY & MIDDLEWARE
app.use(helmet({
    contentSecurityPolicy: false, // Allow inline scripts for our frontend
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌐 SERVE STATIC FILES (Frontend)
app.use(express.static(path.join(__dirname, '../public')));

// 🛤️ API ROUTES
app.post('/api/send', messageController.sendMessage);
app.get('/api/messages', messageController.getMessages);
app.get('/api/messages/:id', messageController.getMessageById);
app.delete('/api/messages', messageController.clearMessages);

// 🏥 HEALTH CHECK
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Chat Message Archiver Service is running',
        timestamp: new Date().toISOString()
    });
});

// 🏠 SERVE FRONTEND
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 🔍 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        data: null
    });
});

// 🚫 404 handler for other routes
app.use('*', (req, res) => {
    res.status(404).send(`
        <h1>404 - Page Not Found</h1>
        <p>The requested page was not found.</p>
        <a href="/">Go back to Chat App</a>
    `);
});

// ❌ Error handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        data: null
    });
});

// 🚀 START THE SERVER
app.listen(PORT, () => {
    console.log(`🚀 Chat Message Archiver Service running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;