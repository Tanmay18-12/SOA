class MemoryStorage {
    constructor() {
        this.messages = [];
    }

    save(message) {
        this.messages.push(message);
        return message;
    }

    findAll() {
        return this.messages.slice(); // Return a copy
    }

    findById(id) {
        return this.messages.find(message => message.id === id);
    }

    clear() {
        this.messages = [];
    }

    getCount() {
        return this.messages.length;
    }
}

// Singleton instance
const storage = new MemoryStorage();
module.exports = storage;