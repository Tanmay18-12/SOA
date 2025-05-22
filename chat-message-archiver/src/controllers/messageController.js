const messageService = require('../services/messageService');

class MessageController {
    
    async sendMessage(req, res) {
        try {
            const messageData = req.body;
            const savedMessage = await messageService.saveMessage(messageData);
            
            res.status(201).json({
                success: true,
                message: 'Message archived successfully',
                data: savedMessage
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message,
                data: null
            });
        }
    }

    async getMessages(req, res) {
        try {
            const messages = await messageService.getAllMessages();
            const count = await messageService.getMessagesCount();
            
            res.status(200).json({
                success: true,
                message: 'Messages retrieved successfully',
                data: messages,
                total: count
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
                data: null
            });
        }
    }

    async getMessageById(req, res) {
        try {
            const { id } = req.params;
            const message = await messageService.getMessageById(id);
            
            if (!message) {
                return res.status(404).json({
                    success: false,
                    message: 'Message not found',
                    data: null
                });
            }

            res.status(200).json({
                success: true,
                message: 'Message retrieved successfully',
                data: message
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
                data: null
            });
        }
    }

    async clearMessages(req, res) {
        try {
            const result = await messageService.clearAllMessages();
            res.status(200).json({
                success: true,
                message: result.message,
                data: null
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
                data: null
            });
        }
    }
}

module.exports = new MessageController();