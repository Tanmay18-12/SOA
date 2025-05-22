const Message = require('../models/message');
const storage = require('../storage/memoryStorage');

class MessageService {
    
    async saveMessage(messageData) {
        // Validate input
        if (!messageData.content || !messageData.sender) {
            throw new Error('Content and sender are required');
        }

        if (messageData.content.trim().length === 0) {
            throw new Error('Message content cannot be empty');
        }

        // Create new message
        const message = new Message(
            messageData.content.trim(),
            messageData.sender.trim()
        );

        // Save to storage
        const savedMessage = storage.save(message);
        
        return savedMessage.toJSON();
    }

    async getAllMessages() {
        const messages = storage.findAll();
        return messages.map(message => message.toJSON());
    }

    async getMessageById(id) {
        const message = storage.findById(id);
        return message ? message.toJSON() : null;
    }

    async getMessagesCount() {
        return storage.getCount();
    }

    async clearAllMessages() {
        storage.clear();
        return { message: 'All messages cleared successfully' };
    }
}

module.exports = new MessageService();