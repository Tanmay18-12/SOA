class Message {
    constructor(content, sender, timestamp = new Date()) {
        this.id = this.generateId();
        this.content = content;
        this.sender = sender;
        this.timestamp = timestamp;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    toJSON() {
        return {
            id: this.id,
            content: this.content,
            sender: this.sender,
            timestamp: this.timestamp
        };
    }
}

module.exports = Message;