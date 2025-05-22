// 🌐 Chat Message Archiver Frontend
class ChatArchiver {
    constructor() {
        this.baseURL = window.location.origin;
        this.apiURL = `${this.baseURL}/api`;
        this.isOnline = false;
        
        this.init();
    }

    // 🚀 Initialize the application
    init() {
        this.bindEvents();
        this.checkServiceStatus();
        this.loadMessages();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.checkServiceStatus();
            this.loadMessages();
        }, 30000);
    }

    // 🎯 Bind event listeners
    bindEvents() {
        // Form submission
        document.getElementById('message-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage();
        });

        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadMessages();
        });

        // Clear all button
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.showConfirmModal('Are you sure you want to delete all messages?', () => {
                this.clearAllMessages();
            });
        });

        // Modal events
        document.getElementById('modal-cancel').addEventListener('click', () => {
            this.hideModal();
        });

        document.getElementById('modal-confirm').addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
            }
            this.hideModal();
        });

        // Close modal on overlay click
        document.getElementById('modal-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'modal-overlay') {
                this.hideModal();
            }
        });
    }

    // 🏥 Check service status
    async checkServiceStatus() {
        try {
            const response = await fetch(`${this.apiURL}/health`);
            const data = await response.json();
            
            if (data.success) {
                this.setOnlineStatus(true);
            } else {
                this.setOnlineStatus(false);
            }
        } catch (error) {
            this.setOnlineStatus(false);
            console.error('Service check failed:', error);
        }
    }

    // 📡 Set online/offline status
    setOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');

        if (isOnline) {
            statusIndicator.className = 'status online';
            statusText.textContent = 'Service Online';
        } else {
            statusIndicator.className = 'status offline';
            statusText.textContent = 'Service Offline';
        }
    }

    // 📨 Send a message
    async sendMessage() {
        const sender = document.getElementById('sender').value.trim();
        const content = document.getElementById('content').value.trim();

        // Validation
        if (!sender || !content) {
            this.showToast('error', 'Error', 'Please fill in both sender and message fields.');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('#message-form button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${this.apiURL}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sender, content })
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('success', 'Success', 'Message sent successfully!');
                
                // Clear form
                document.getElementById('content').value = '';
                document.getElementById('sender').focus();
                
                // Reload messages
                this.loadMessages();
            } else {
                this.showToast('error', 'Error', data.message || 'Failed to send message');
            }
        } catch (error) {
            this.showToast('error', 'Network Error', 'Failed to connect to server');
            console.error('Send message error:', error);
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // 📋 Load all messages
    async loadMessages() {
        const loading = document.getElementById('loading');
        const messagesList = document.getElementById('messages-list');
        const noMessages = document.getElementById('no-messages');

        // Show loading
        loading.classList.remove('hidden');
        messagesList.classList.add('hidden');
        noMessages.classList.add('hidden');

        try {
            const response = await fetch(`${this.apiURL}/messages`);
            const data = await response.json();

            if (data.success) {
                this.displayMessages(data.data);
                this.updateMessageCount(data.total);
            } else {
                this.showToast('error', 'Error', 'Failed to load messages');
                this.showNoMessages();
            }
        } catch (error) {
            this.showToast('error', 'Network Error', 'Failed to connect to server');
            this.showNoMessages();
            console.error('Load messages error:', error);
        } finally {
            loading.classList.add('hidden');
        }
    }

    // 🖼️ Display messages in the UI
    displayMessages(messages) {
        const messagesList = document.getElementById('messages-list');
        const noMessages = document.getElementById('no-messages');

        if (messages.length === 0) {
            this.showNoMessages();
            return;
        }

        // Sort messages by timestamp (newest first)
        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Generate HTML
        const messagesHTML = messages.map(message => `
            <div class="message-item" data-id="${message.id}">
                <div class="message-header">
                    <span class="message-sender">
                        <i class="fas fa-user"></i> ${this.escapeHtml(message.sender)}
                    </span>
                    <span class="message-time">
                        <i class="fas fa-clock"></i> ${this.formatTimestamp(message.timestamp)}
                    </span>
                </div>
                <div class="message-content">
                    ${this.escapeHtml(message.content)}
                </div>
                <div class="message-id">
                    ID: ${message.id}
                </div>
            </div>
        `).join('');

        messagesList.innerHTML = messagesHTML;
        messagesList.classList.remove('hidden');
        noMessages.classList.add('hidden');
    }

    // 📊 Update message count
    updateMessageCount(count) {
        const messageCount = document.getElementById('message-count');
        messageCount.textContent = `${count} message${count !== 1 ? 's' : ''}`;
    }

    // 🚫 Show no messages state
    showNoMessages() {
        const messagesList = document.getElementById('messages-list');
        const noMessages = document.getElementById('no-messages');
        
        messagesList.classList.add('hidden');
        noMessages.classList.remove('hidden');
        this.updateMessageCount(0);
    }

    // 🗑️ Clear all messages
    async clearAllMessages() {
        try {
            const response = await fetch(`${this.apiURL}/messages`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                this.showToast('success', 'Success', 'All messages cleared successfully!');
                this.loadMessages();
            } else {
                this.showToast('error', 'Error', 'Failed to clear messages');
            }
        } catch (error) {
            this.showToast('error', 'Network Error', 'Failed to connect to server');
            console.error('Clear messages error:', error);
        }
    }

    // 🍞 Show toast notification
    showToast(type, title, message) {
        const container = document.getElementById('toast-container');
        const toastId = 'toast-' + Date.now();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.id = toastId;
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${title}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="toast-message">${message}</div>
        `;

        container.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const toastElement = document.getElementById(toastId);
            if (toastElement) {
                toastElement.remove();
            }
        }, 5000);
    }

    // 🔒 Show confirmation modal
    showConfirmModal(message, callback) {
        this.confirmCallback = callback;
        document.getElementById('modal-message').textContent = message;
        document.getElementById('modal-overlay').classList.remove('hidden');
    }

    // 🚪 Hide modal
    hideModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
        this.confirmCallback = null;
    }

    // 🛡️ Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 📅 Format timestamp
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const minutes = Math.floor((now - date) / (1000 * 60));
            return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
        } else if (diffInHours < 24) {
            const hours = Math.floor(diffInHours);
            return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleString();
        }
    }
}

// 🚀 Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatArchiver();
    
    // Add some welcome interaction
    console.log('🚀 Chat Message Archiver loaded successfully!');
    console.log('💡 This is a Service-Oriented Architecture demo');
});

// 🎯 Add some keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to send message
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const form = document.getElementById('message-form');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }
    
    // F5 or Ctrl/Cmd + R to refresh messages
    if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && e.key === 'r')) {
        e.preventDefault();
        window.chatArchiver?.loadMessages();
    }
});

// Store instance globally for debugging
window.chatArchiver = null;
document.addEventListener('DOMContentLoaded', () => {
    window.chatArchiver = new ChatArchiver();
});