// Global state
let likePopupShown = false;
let userInteractions = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    setupDynamicNavbar();
    showLikePopupAfterDelay();
});

// Initialize page elements
function initializePage() {
    // Add smooth scrolling to navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animate timeline items on scroll
    setupScrollAnimations();
    
    // Preload demo content
    preloadDemoContent();
}

// Setup event listeners
function setupEventListeners() {
    // Chat input enter key
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }

    // Email input enter key
    const emailInput = document.getElementById('emailInput');
    if (emailInput) {
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleSignup();
            }
        });
    }

    // Track user interactions for analytics
    document.addEventListener('click', trackUserInteraction);
    document.addEventListener('scroll', trackScrollBehavior);
}

// Handle chat message sending
function handleSendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    // Add user message to chat
    addMessageToChat(messageText, 'user');
    messageInput.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const responses = [
            "That's a great question! I can help you automate that workflow.",
            "I understand your needs. Let me suggest a solution that would work perfectly for your business.",
            "Excellent point! This is exactly what Amina is designed to handle efficiently.",
            "I can definitely assist with that. Would you like to see a demo of this feature?",
            "Perfect! This is one of my core capabilities. Let me show you how it works."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessageToChat(randomResponse, 'bot');
        
        // Show download suggestion after 2 messages
        if (document.querySelectorAll('.message').length >= 6) {
            setTimeout(() => {
                addMessageToChat("Ready to experience Amina's full capabilities? Click the download button below!", 'bot');
            }, 1000);
        }
    }, 800 + Math.random() * 1200);
    
    trackUserInteraction();
}

// Add message to chat interface
function addMessageToChat(text, sender) {
    const messagesContainer = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `<p>${text}</p>`;
    
    if (sender === 'user') {
        messageDiv.appendChild(content);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle hero button clicks
function handleChatbotDemo() {
    // Show chatbot modal or navigate to chat interface
    showChatbotModal();
    trackUserInteraction();
}

function handleEnterpriseDemo() {
    // Smooth scroll to timeline section
    const timelineSection = document.getElementById('roadmap');
    if (timelineSection) {
        timelineSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
    trackUserInteraction();
}

function showChatbotModal() {
    const modal = document.createElement('div');
    modal.className = 'chatbot-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeChatbotModal()">
            <div class="chatbot-modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>Chat with Amina</h3>
                    <button class="modal-close" onclick="closeChatbotModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chat-interface">
                    <div class="chat-messages" id="modalChatMessages">
                        <div class="message bot-message">
                            <div class="avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <p>Hello! I'm Amina, your AI employee. How can I help you today?</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chat-input-container">
                        <div class="chat-input">
                            <input type="text" placeholder="Type your message..." id="modalMessageInput">
                            <button class="send-btn" onclick="handleModalSendMessage()">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="download-section">
                    <button class="download-btn" onclick="handleDownload()">
                        <i class="fas fa-download"></i>
                        Download Amina
                    </button>
                    <p class="download-note">Available for Windows, Mac, and Linux</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('show');
    
    // Add modal styles dynamically
    addChatbotModalStyles();
    
    // Focus on input
    setTimeout(() => {
        const input = document.getElementById('modalMessageInput');
        if (input) {
            input.focus();
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    handleModalSendMessage();
                }
            });
        }
    }, 100);
}

function closeChatbotModal() {
    const modal = document.querySelector('.chatbot-modal');
    if (modal) {
        modal.remove();
    }
}

function handleModalSendMessage() {
    const messageInput = document.getElementById('modalMessageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    // Add user message to modal chat
    addMessageToModalChat(messageText, 'user');
    messageInput.value = '';
    
    // Simulate AI response
    setTimeout(() => {
        const responses = [
            "That's an excellent question! I can definitely help you with that.",
            "I understand your workflow needs. Let me suggest an automated solution.",
            "Perfect! This is exactly what I was designed to handle efficiently.",
            "Great point! I can streamline that process for you.",
            "Absolutely! Would you like to see how I can integrate with your existing tools?"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessageToModalChat(randomResponse, 'bot');
    }, 800 + Math.random() * 1200);
}

function addMessageToModalChat(text, sender) {
    const messagesContainer = document.getElementById('modalChatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'avatar';
    avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    content.innerHTML = `<p>${text}</p>`;
    
    if (sender === 'user') {
        messageDiv.appendChild(content);
        messageDiv.appendChild(avatar);
    } else {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addChatbotModalStyles() {
    if (document.getElementById('chatbot-modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'chatbot-modal-styles';
    styles.textContent = `
        .chatbot-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .chatbot-modal.show {
            opacity: 1;
        }
        
        .chatbot-modal .modal-overlay {
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        
        .chatbot-modal-content {
            background: white;
            border-radius: 0;
            max-width: 500px;
            width: 100%;
            max-height: 80vh;
            overflow: hidden;
            border: 4px solid var(--mondrian-black);
        }
        
        .chatbot-modal .modal-header {
            padding: 1.5rem;
            border-bottom: 3px solid var(--mondrian-black);
            background: var(--mondrian-blue);
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .chatbot-modal .modal-header h3 {
            margin: 0;
            font-weight: 300;
            font-size: 1.5rem;
        }
        
        .chatbot-modal .modal-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            color: white;
            cursor: pointer;
            padding: 0.5rem;
            transition: all 0.3s ease;
        }
        
        .chatbot-modal .modal-close:hover {
            background: rgba(255, 255, 255, 0.2);
        }
        
        .chatbot-modal .chat-interface {
            background: var(--mondrian-gray);
            border: none;
            border-radius: 0;
        }
        
        .chatbot-modal .chat-messages {
            max-height: 250px;
        }
        
        .chatbot-modal .download-section {
            padding: 1.5rem;
            background: white;
            border-top: 3px solid var(--mondrian-black);
            text-align: center;
        }
        
        .chatbot-modal .download-btn {
            background: var(--mondrian-red);
            border-radius: 0;
            border: 2px solid var(--mondrian-black);
        }
        
        .chatbot-modal .download-btn:hover {
            background: var(--mondrian-yellow);
            color: var(--mondrian-black);
        }
    `;
    
    document.head.appendChild(styles);
}

// Handle download button click
function handleDownload() {
    // Show loading state
    const downloadBtn = document.querySelector('.download-btn');
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing Download...';
    downloadBtn.disabled = true;
    
    // Simulate download preparation
    setTimeout(() => {
        // In a real app, this would trigger an actual download
        showNotification('Download started! Check your downloads folder.', 'success');
        
        // Reset button
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
        
        // Track download event
        trackDownloadEvent();
    }, 2000);
    
    trackUserInteraction();
}

// Handle email signup
function handleSignup() {
    const emailInput = document.getElementById('emailInput');
    const email = emailInput.value.trim();
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }
    
    // Show loading state
    const signupBtn = document.querySelector('.signup-btn');
    const originalText = signupBtn.textContent;
    signupBtn.textContent = 'Joining...';
    signupBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Welcome to the testing team! Check your email for next steps.', 'success');
        emailInput.value = '';
        
        // Reset button
        signupBtn.textContent = originalText;
        signupBtn.disabled = false;
        
        // Track signup event
        trackSignupEvent(email);
    }, 1500);
    
    trackUserInteraction();
}

// Handle like popup interactions
function handleLike(category) {
    showNotification(`Thanks for your feedback on ${category}! This helps us prioritize features.`, 'success');
    
    // Track preference
    trackUserPreference(category);
    
    // Close popup
    closePopup();
}

// Close like popup
function closePopup() {
    const popup = document.getElementById('likePopup');
    popup.classList.remove('show');
    likePopupShown = true;
}

// Show like popup after user engagement
function showLikePopupAfterDelay() {
    setTimeout(() => {
        if (!likePopupShown && userInteractions >= 3) {
            const popup = document.getElementById('likePopup');
            popup.classList.add('show');
        }
    }, 10000); // Show after 10 seconds if user has interacted
}

// Setup scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);
    
    // Observe timeline items
    document.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
    });
}

// Preload demo content
function preloadDemoContent() {
    const demoButtons = document.querySelectorAll('.demo-btn:not(.disabled)');
    demoButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const title = this.closest('.timeline-content').querySelector('h3, h4').textContent;
            showDemoModal(title);
        });
    });
}

// Show demo modal
function showDemoModal(title) {
    const modal = document.createElement('div');
    modal.className = 'demo-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeDemoModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>${title} Demo</h3>
                    <button class="modal-close" onclick="closeDemoModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="video-placeholder">
                        <i class="fas fa-play-circle"></i>
                        <p>Demo video for ${title}</p>
                        <small>Click to play (video would be embedded here)</small>
                    </div>
                    <div class="demo-description">
                        <p>This demo showcases the key features and capabilities of ${title}. 
                        In a full implementation, this would include interactive examples and 
                        downloadable resources.</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('show');
    
    // Add modal styles dynamically
    addModalStyles();
}

// Close demo modal
function closeDemoModal() {
    const modal = document.querySelector('.demo-modal');
    if (modal) {
        modal.remove();
    }
}

// Add modal styles
function addModalStyles() {
    if (document.getElementById('modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'modal-styles';
    styles.textContent = `
        .demo-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .demo-modal.show {
            opacity: 1;
        }
        
        .modal-overlay {
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
        }
        
        .modal-content {
            background: white;
            border-radius: 1rem;
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow: hidden;
            box-shadow: var(--shadow-xl);
        }
        
        .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header h3 {
            margin: 0;
            color: var(--text-dark);
        }
        
        .modal-close {
            background: none;
            border: none;
            font-size: 1.25rem;
            color: var(--text-light);
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 0.25rem;
            transition: all 0.3s ease;
        }
        
        .modal-close:hover {
            background: var(--surface);
            color: var(--text-dark);
        }
        
        .modal-body {
            padding: 1.5rem;
        }
        
        .video-placeholder {
            background: var(--surface);
            border-radius: 0.5rem;
            padding: 3rem;
            text-align: center;
            margin-bottom: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .video-placeholder:hover {
            background: rgba(99, 102, 241, 0.1);
        }
        
        .video-placeholder i {
            font-size: 3rem;
            color: var(--primary-color);
            margin-bottom: 1rem;
        }
        
        .demo-description {
            color: var(--text-light);
            line-height: 1.6;
        }
    `;
    
    document.head.appendChild(styles);
}

// Setup dynamic navbar
function setupDynamicNavbar() {
    const header = document.querySelector('.header');
    let hideTimer;
    
    // Show navbar on mouse movement
    document.addEventListener('mousemove', function(e) {
        // Show navbar when mouse is near top of screen or moving
        if (e.clientY < 100) {
            header.classList.add('visible');
            clearTimeout(hideTimer);
        } else {
            // Hide after delay when mouse moves away
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                if (e.clientY > 150) {
                    header.classList.remove('visible');
                }
            }, 2000);
        }
    });
    
    // Show navbar on scroll up
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY < lastScrollY || currentScrollY < 100) {
            // Scrolling up or near top
            header.classList.add('visible');
            clearTimeout(hideTimer);
        } else {
            // Scrolling down
            clearTimeout(hideTimer);
            hideTimer = setTimeout(() => {
                header.classList.remove('visible');
            }, 1000);
        }
        
        lastScrollY = currentScrollY;
    });
}

// Article modal functions
function showArticleModal(feature) {
    const articles = {
        'nlp': {
            title: 'Natural Language Processing: Technical Deep Dive',
            content: `
                <h3>Advanced NLP Architecture</h3>
                <p>Amina's NLP engine is built on a hybrid architecture combining transformer models with domain-specific fine-tuning.</p>
                
                <h4>Core Technologies</h4>
                <ul>
                    <li><strong>Multi-Modal Transformers:</strong> Custom GPT-based models trained on enterprise communications</li>
                    <li><strong>Context Memory:</strong> Persistent conversation state across sessions</li>
                    <li><strong>Domain Adaptation:</strong> Industry-specific vocabulary and terminology recognition</li>
                    <li><strong>Intent Classification:</strong> 99.2% accuracy in understanding user requests</li>
                </ul>
                
                <h4>Language Support</h4>
                <div class="lang-grid">
                    <div class="lang-item">🇺🇸 English (Native)</div>
                    <div class="lang-item">🇨🇳 中文 (Simplified & Traditional)</div>
                    <div class="lang-item">🇪🇸 Español</div>
                    <div class="lang-item">🇫🇷 Français</div>
                </div>
                
                <h4>Performance Metrics</h4>
                <div class="metrics">
                    <div class="metric"><span class="value">< 200ms</span><span class="label">Response Time</span></div>
                    <div class="metric"><span class="value">99.7%</span><span class="label">Uptime</span></div>
                    <div class="metric"><span class="value">15M+</span><span class="label">Conversations Processed</span></div>
                </div>
            `
        },
        'automation': {
            title: 'Workflow Automation: Implementation Guide',
            content: `
                <h3>Intelligent Process Automation</h3>
                <p>Transform your business operations with Amina's comprehensive automation framework.</p>
                
                <h4>Automation Categories</h4>
                <div class="automation-grid">
                    <div class="automation-card">
                        <h5>📧 Email Management</h5>
                        <ul>
                            <li>Smart inbox prioritization</li>
                            <li>Auto-response generation</li>
                            <li>Email classification & routing</li>
                        </ul>
                    </div>
                    <div class="automation-card">
                        <h5>📄 Document Processing</h5>
                        <ul>
                            <li>OCR & content extraction</li>
                            <li>Automated filing & tagging</li>
                            <li>Report generation</li>
                        </ul>
                    </div>
                    <div class="automation-card">
                        <h5>📅 Calendar & Scheduling</h5>
                        <ul>
                            <li>Meeting coordination</li>
                            <li>Resource booking</li>
                            <li>Conflict resolution</li>
                        </ul>
                    </div>
                </div>
                
                <h4>ROI Impact</h4>
                <div class="roi-stats">
                    <div class="roi-item">
                        <span class="roi-number">75%</span>
                        <span class="roi-desc">Reduction in manual tasks</span>
                    </div>
                    <div class="roi-item">
                        <span class="roi-number">4.2hrs</span>
                        <span class="roi-desc">Time saved per employee/day</span>
                    </div>
                    <div class="roi-item">
                        <span class="roi-number">300%</span>
                        <span class="roi-desc">Typical ROI in first year</span>
                    </div>
                </div>
            `
        }
    };
    
    const article = articles[feature];
    if (!article) return;
    
    const modal = document.createElement('div');
    modal.className = 'article-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeArticleModal()">
            <div class="article-modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h2>${article.title}</h2>
                    <button class="modal-close" onclick="closeArticleModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="article-body">
                    ${article.content}
                </div>
                <div class="article-footer">
                    <button class="action-btn demo-btn-small" onclick="showMiniDemo('${feature}')">
                        <i class="fas fa-play"></i>
                        Try Interactive Demo
                    </button>
                    <button class="action-btn" onclick="downloadResource('${feature}')">
                        <i class="fas fa-download"></i>
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('show');
    addArticleModalStyles();
    trackUserInteraction();
}

function closeArticleModal() {
    const modal = document.querySelector('.article-modal');
    if (modal) {
        modal.remove();
    }
}

// Mini demo functions
function showMiniDemo(feature) {
    const demos = {
        'nlp': {
            title: 'NLP Demo: Multi-Language Chat',
            type: 'interactive-chat'
        },
        'automation': {
            title: 'Automation Simulator',
            type: 'workflow-demo'
        }
    };
    
    const demo = demos[feature];
    if (!demo) return;
    
    const modal = document.createElement('div');
    modal.className = 'demo-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeMiniDemo()">
            <div class="demo-modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3>${demo.title}</h3>
                    <button class="modal-close" onclick="closeMiniDemo()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="demo-body" id="demoBody">
                    ${getDemoContent(feature, demo.type)}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.classList.add('show');
    addDemoModalStyles();
    initializeDemo(feature, demo.type);
    trackUserInteraction();
}

function getDemoContent(feature, type) {
    if (type === 'interactive-chat') {
        return `
            <div class="nlp-demo">
                <div class="language-selector">
                    <label>Select Language:</label>
                    <select id="demoLanguage">
                        <option value="en">English</option>
                        <option value="zh">中文</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                    </select>
                </div>
                <div class="demo-chat">
                    <div class="demo-messages" id="demoMessages">
                        <div class="demo-message bot">
                            <strong>Amina:</strong> Hello! Try asking me something in any supported language.
                        </div>
                    </div>
                    <div class="demo-input">
                        <input type="text" id="demoInput" placeholder="Type your message...">
                        <button onclick="sendDemoMessage()">Send</button>
                    </div>
                </div>
            </div>
        `;
    } else if (type === 'workflow-demo') {
        return `
            <div class="automation-demo">
                <div class="workflow-simulator">
                    <h4>Email Processing Workflow</h4>
                    <div class="workflow-steps">
                        <div class="step" id="step1">
                            <span class="step-number">1</span>
                            <span class="step-text">Email Received</span>
                            <div class="step-status pending">⏳</div>
                        </div>
                        <div class="step" id="step2">
                            <span class="step-number">2</span>
                            <span class="step-text">Content Analysis</span>
                            <div class="step-status pending">⏳</div>
                        </div>
                        <div class="step" id="step3">
                            <span class="step-number">3</span>
                            <span class="step-text">Priority Classification</span>
                            <div class="step-status pending">⏳</div>
                        </div>
                        <div class="step" id="step4">
                            <span class="step-number">4</span>
                            <span class="step-text">Auto-Response Generated</span>
                            <div class="step-status pending">⏳</div>
                        </div>
                    </div>
                    <button class="demo-run-btn" onclick="runAutomationDemo()">
                        <i class="fas fa-play"></i>
                        Start Automation
                    </button>
                </div>
            </div>
        `;
    }
}

function closeMiniDemo() {
    const modal = document.querySelector('.demo-modal');
    if (modal) {
        modal.remove();
    }
}

function showPreview(feature) {
    showNotification(`${feature} preview will be available soon! Join our testing team for early access.`, 'info');
    // Auto-scroll to signup section
    setTimeout(() => {
        document.getElementById('join').scrollIntoView({ behavior: 'smooth' });
    }, 1000);
}

function downloadResource(feature) {
    showNotification(`${feature} documentation download started!`, 'success');
    trackUserInteraction();
}

function addArticleModalStyles() {
    if (document.getElementById('article-modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'article-modal-styles';
    styles.textContent = `
        .article-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 3000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .article-modal.show {
            opacity: 1;
        }
        
        .article-modal .modal-overlay {
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            overflow-y: auto;
        }
        
        .article-modal-content {
            background: var(--mondrian-white);
            border: 4px solid var(--mondrian-black);
            max-width: 800px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .article-modal .modal-header {
            padding: 2rem;
            background: var(--mondrian-red);
            color: var(--mondrian-white);
            border-bottom: 3px solid var(--mondrian-black);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .article-modal .modal-header h2 {
            margin: 0;
            font-weight: 300;
            font-size: 1.75rem;
        }
        
        .article-body {
            padding: 2rem;
            line-height: 1.6;
        }
        
        .article-body h3 {
            color: var(--mondrian-blue);
            margin-bottom: 1rem;
            font-weight: 500;
        }
        
        .article-body h4 {
            color: var(--mondrian-red);
            margin: 1.5rem 0 1rem 0;
            font-weight: 500;
        }
        
        .lang-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }
        
        .lang-item {
            background: var(--mondrian-gray);
            padding: 0.75rem;
            border: 2px solid var(--mondrian-black);
            text-align: center;
            font-weight: 500;
        }
        
        .metrics {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }
        
        .metric {
            text-align: center;
            background: var(--mondrian-blue);
            color: var(--mondrian-white);
            padding: 1rem;
            border: 2px solid var(--mondrian-black);
        }
        
        .metric .value {
            display: block;
            font-size: 1.5rem;
            font-weight: 600;
        }
        
        .metric .label {
            font-size: 0.875rem;
            opacity: 0.9;
        }
        
        .automation-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1rem 0;
        }
        
        .automation-card {
            background: var(--mondrian-gray);
            border: 2px solid var(--mondrian-black);
            padding: 1rem;
        }
        
        .automation-card h5 {
            margin-bottom: 0.5rem;
            color: var(--mondrian-blue);
        }
        
        .roi-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin: 1rem 0;
        }
        
        .roi-item {
            text-align: center;
            background: var(--mondrian-yellow);
            color: var(--mondrian-black);
            padding: 1rem;
            border: 2px solid var(--mondrian-black);
        }
        
        .roi-number {
            display: block;
            font-size: 2rem;
            font-weight: 700;
        }
        
        .roi-desc {
            font-size: 0.875rem;
            font-weight: 500;
        }
        
        .article-footer {
            padding: 1.5rem 2rem;
            background: var(--mondrian-gray);
            border-top: 3px solid var(--mondrian-black);
            display: flex;
            gap: 1rem;
            justify-content: center;
        }
    `;
    
    document.head.appendChild(styles);
}

function addDemoModalStyles() {
    if (document.getElementById('demo-modal-styles2')) return;
    
    const styles = document.createElement('style');
    styles.id = 'demo-modal-styles2';
    styles.textContent = `
        .demo-modal-content {
            background: var(--mondrian-white);
            border: 4px solid var(--mondrian-black);
            max-width: 600px;
            width: 100%;
            max-height: 80vh;
            overflow: hidden;
        }
        
        .demo-body {
            padding: 2rem;
        }
        
        .nlp-demo .language-selector {
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .nlp-demo select {
            border: 2px solid var(--mondrian-black);
            padding: 0.5rem;
            background: var(--mondrian-white);
        }
        
        .demo-chat {
            border: 3px solid var(--mondrian-black);
            background: var(--mondrian-gray);
        }
        
        .demo-messages {
            height: 200px;
            padding: 1rem;
            overflow-y: auto;
            background: var(--mondrian-white);
        }
        
        .demo-message {
            margin-bottom: 0.5rem;
            padding: 0.5rem;
        }
        
        .demo-message.bot {
            background: var(--mondrian-blue);
            color: var(--mondrian-white);
        }
        
        .demo-message.user {
            background: var(--mondrian-yellow);
            color: var(--mondrian-black);
            text-align: right;
        }
        
        .demo-input {
            display: flex;
            padding: 1rem;
            gap: 0.5rem;
            background: var(--mondrian-gray);
        }
        
        .demo-input input {
            flex: 1;
            border: 2px solid var(--mondrian-black);
            padding: 0.5rem;
        }
        
        .demo-input button {
            background: var(--mondrian-red);
            color: var(--mondrian-white);
            border: 2px solid var(--mondrian-black);
            padding: 0.5rem 1rem;
            cursor: pointer;
        }
        
        .workflow-steps {
            margin: 2rem 0;
        }
        
        .step {
            display: flex;
            align-items: center;
            padding: 1rem;
            margin-bottom: 1rem;
            background: var(--mondrian-gray);
            border: 2px solid var(--mondrian-black);
            gap: 1rem;
        }
        
        .step-number {
            background: var(--mondrian-blue);
            color: var(--mondrian-white);
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
        }
        
        .step-text {
            flex: 1;
            font-weight: 500;
        }
        
        .step-status {
            font-size: 1.25rem;
        }
        
        .step.completed .step-number {
            background: var(--mondrian-green);
        }
        
        .step.completed .step-status:after {
            content: '✅';
        }
        
        .demo-run-btn {
            background: var(--mondrian-red);
            color: var(--mondrian-white);
            border: 2px solid var(--mondrian-black);
            padding: 1rem 2rem;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin: 0 auto;
        }
    `;
    
    document.head.appendChild(styles);
}

// Demo interaction functions
function sendDemoMessage() {
    const input = document.getElementById('demoInput');
    const messages = document.getElementById('demoMessages');
    const language = document.getElementById('demoLanguage').value;
    
    if (!input.value.trim()) return;
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'demo-message user';
    userMsg.innerHTML = `<strong>You:</strong> ${input.value}`;
    messages.appendChild(userMsg);
    
    const userText = input.value;
    input.value = '';
    
    // Generate multilingual response
    setTimeout(() => {
        const responses = {
            'en': [
                "I understand your request. Let me help you with that.",
                "That's a great question! I can process that information.",
                "I can handle that task across multiple languages."
            ],
            'zh': [
                "我明白您的请求。让我来帮助您。",
                "这是一个很好的问题！我可以处理这些信息。",
                "我可以用多种语言处理这个任务。"
            ],
            'es': [
                "Entiendo su solicitud. Permítame ayudarle con eso.",
                "¡Esa es una gran pregunta! Puedo procesar esa información.",
                "Puedo manejar esa tarea en múltiples idiomas."
            ],
            'fr': [
                "Je comprends votre demande. Laissez-moi vous aider avec cela.",
                "C'est une excellente question ! Je peux traiter cette information.",
                "Je peux gérer cette tâche dans plusieurs langues."
            ]
        };
        
        const langResponses = responses[language] || responses['en'];
        const response = langResponses[Math.floor(Math.random() * langResponses.length)];
        
        const botMsg = document.createElement('div');
        botMsg.className = 'demo-message bot';
        botMsg.innerHTML = `<strong>Amina:</strong> ${response}`;
        messages.appendChild(botMsg);
        
        messages.scrollTop = messages.scrollHeight;
    }, 1000);
    
    messages.scrollTop = messages.scrollHeight;
}

function runAutomationDemo() {
    const steps = ['step1', 'step2', 'step3', 'step4'];
    let currentStep = 0;
    
    const runStep = () => {
        if (currentStep < steps.length) {
            const stepElement = document.getElementById(steps[currentStep]);
            stepElement.classList.add('completed');
            stepElement.querySelector('.step-status').textContent = '✅';
            
            currentStep++;
            setTimeout(runStep, 1500);
        } else {
            showNotification('Automation workflow completed! Email processed and response generated.', 'success');
        }
    };
    
    // Reset all steps
    steps.forEach(stepId => {
        const step = document.getElementById(stepId);
        step.classList.remove('completed');
        step.querySelector('.step-status').textContent = '⏳';
    });
    
    setTimeout(runStep, 500);
}

function initializeDemo(feature, type) {
    if (type === 'interactive-chat') {
        const input = document.getElementById('demoInput');
        if (input) {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendDemoMessage();
                }
            });
        }
    }
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add notification styles if not present
    addNotificationStyles();
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'notification-styles';
    styles.textContent = `
        .notification {
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: white;
            border-radius: 0.5rem;
            box-shadow: var(--shadow-lg);
            padding: 1rem;
            min-width: 300px;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1500;
            border-left: 4px solid var(--primary-color);
        }
        
        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification.success {
            border-left-color: var(--success);
        }
        
        .notification.error {
            border-left-color: var(--error);
        }
        
        .notification.warning {
            border-left-color: var(--warning);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .notification i {
            font-size: 1.25rem;
        }
        
        .notification.success i {
            color: var(--success);
        }
        
        .notification.error i {
            color: var(--error);
        }
        
        .notification.warning i {
            color: var(--warning);
        }
        
        .notification.info i {
            color: var(--primary-color);
        }
    `;
    
    document.head.appendChild(styles);
}

// Analytics and tracking functions
function trackUserInteraction() {
    userInteractions++;
    
    // Show like popup after sufficient interactions
    if (userInteractions >= 3 && !likePopupShown) {
        setTimeout(() => {
            const popup = document.getElementById('likePopup');
            if (popup && !popup.classList.contains('show')) {
                popup.classList.add('show');
            }
        }, 2000);
    }
    
    // In a real app, send to analytics service
    console.log('User interaction tracked:', userInteractions);
}

function trackScrollBehavior() {
    // Track how far user scrolls
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    
    // In a real app, send to analytics service
    if (scrollPercent > 50 && !localStorage.getItem('scroll_50_tracked')) {
        console.log('User scrolled past 50%');
        localStorage.setItem('scroll_50_tracked', 'true');
    }
}

function trackDownloadEvent() {
    // In a real app, send to analytics service
    console.log('Download event tracked');
    
    // Track in localStorage for demo
    const downloads = JSON.parse(localStorage.getItem('downloads') || '[]');
    downloads.push({
        timestamp: new Date().toISOString(),
        source: 'landing_page'
    });
    localStorage.setItem('downloads', JSON.stringify(downloads));
}

function trackSignupEvent(email) {
    // In a real app, send to analytics service and CRM
    console.log('Signup event tracked:', email);
    
    // Track in localStorage for demo
    const signups = JSON.parse(localStorage.getItem('signups') || '[]');
    signups.push({
        email: email,
        timestamp: new Date().toISOString(),
        source: 'testing_team_signup'
    });
    localStorage.setItem('signups', JSON.stringify(signups));
}

function trackUserPreference(category) {
    // In a real app, send to analytics service
    console.log('User preference tracked:', category);
    
    // Track in localStorage for demo
    const preferences = JSON.parse(localStorage.getItem('preferences') || '{}');
    preferences[category] = (preferences[category] || 0) + 1;
    localStorage.setItem('preferences', JSON.stringify(preferences));
}

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // ↑↑↓↓←→←→BA

document.addEventListener('keydown', function(e) {
    konamiCode.push(e.keyCode);
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (JSON.stringify(konamiCode) === JSON.stringify(konamiSequence)) {
        showNotification('🎉 Easter egg found! You discovered the secret developer mode!', 'success');
        document.body.style.animation = 'rainbow 2s infinite';
        
        // Add rainbow animation
        const rainbowStyles = document.createElement('style');
        rainbowStyles.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(rainbowStyles);
        
        setTimeout(() => {
            document.body.style.animation = '';
            rainbowStyles.remove();
        }, 4000);
        
        konamiCode = [];
    }
});