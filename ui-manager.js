// UI Manager - správa uživatelského rozhraní
// Verze: 2.0 - Multi-Model Support

class UIManager {
    constructor() {
        this.currentTheme = 'claude';
        this.isWelcomeScreenVisible = true;
        this.lastSystemMessageElement = null;
    }

    // Inicializace UI
    init() {
        console.log('🎨 UI Manager initializing...');
        
        // Načíst uložené téma
        const savedTheme = localStorage.getItem('selectedTheme');
        if (savedTheme && this.isValidTheme(savedTheme)) {
            this.currentTheme = savedTheme;
        } else {
            this.currentTheme = CONFIG.UI.DEFAULT_THEME || 'claude';
        }
        
        // Aplikovat téma
        this.applyTheme(this.currentTheme);
        
        // Nastavit příklady dotazů
        this.setupExampleQueries();
        
        // Inicializovat model selector
        this.initializeModelSelector();
        
        // Označit aktivní tlačítko tématu
        this.updateThemeButtons();
        
        console.log('🎨 UI Manager ready');
    }

    // === MODEL SELECTOR - NOVÉ FUNKCE ===
    
    // Inicializace model selectoru
    initializeModelSelector() {
        console.log('🤖 Initializing model selector...');
        
        // Získat container pro model selector
        const headerButtons = document.querySelector('.header-buttons');
        if (!headerButtons) {
            console.error('❌ Header buttons container not found');
            return;
        }
        
        // Vytvořit model selector element
        const modelSelector = this.createModelSelector();
        
        // Vložit před theme selector
        const themeSelector = headerButtons.querySelector('.theme-selector-inline');
        if (themeSelector) {
            headerButtons.insertBefore(modelSelector, themeSelector);
        } else {
            headerButtons.appendChild(modelSelector);
        }
        
        // Nastavit aktivní model
        this.updateModelIndicator();
    }
    
    // Vytvořit model selector HTML
    createModelSelector() {
        const modelSelector = document.createElement('div');
        modelSelector.className = 'model-selector-inline';
        
        // Získat dostupné modely
        const models = window.modelManager?.getAvailableModels() || [];
        const activeModelId = window.modelManager?.getActiveModel()?.id || CONFIG.MODELS.DEFAULT;
        
        // Vytvořit HTML
        let selectorHTML = `<div class="model-selector-wrapper">`;
        
        // Indikátor aktuálního modelu
        selectorHTML += `<span class="current-model-indicator" id="current-model-indicator">🤖</span>`;
        
        // Dropdown
        selectorHTML += `<select class="model-select" id="model-select" onchange="window.changeModel(this.value)" title="Vyberte AI model">`;
        
        // Přidat modely
        models.forEach(model => {
            const config = CONFIG.MODELS.CONFIGS[model.id] || {};
            const selected = model.id === activeModelId ? 'selected' : '';
            const emoji = config.emoji || '🤖';
            const name = config.name || model.name;
            
            selectorHTML += `<option value="${model.id}" ${selected}>${emoji} ${name}</option>`;
        });
        
        selectorHTML += `</select>`;
        
        // Info o ceně
        selectorHTML += `<span class="model-info" id="model-info" title="Odhadovaná cena za 1000 tokenů"></span>`;
        
        selectorHTML += `</div>`;
        
        modelSelector.innerHTML = selectorHTML;
        
        return modelSelector;
    }
    
    // Aktualizovat indikátor modelu
    updateModelIndicator(modelId = null) {
        const indicator = document.getElementById('current-model-indicator');
        const select = document.getElementById('model-select');
        const info = document.getElementById('model-info');
        
        if (!indicator || !select) return;
        
        // Získat info o modelu
        const currentModelId = modelId || window.modelManager?.getActiveModel()?.id;
        const modelInfo = window.modelManager?.getModelInfo(currentModelId);
        const config = CONFIG.MODELS.CONFIGS[currentModelId] || {};
        
        if (modelInfo) {
            // Update indicator
            indicator.textContent = config.emoji || '🤖';
            indicator.style.color = config.color || 'var(--primary-color)';
            
            // Update select
            select.value = currentModelId;
            
            // Update info
            if (info && modelInfo.pricing) {
                const avgPrice = (modelInfo.pricing.input + modelInfo.pricing.output) / 2;
                info.textContent = `💰 $${avgPrice.toFixed(3)}/1K`;
                info.title = `Input: $${modelInfo.pricing.input}/1K, Output: $${modelInfo.pricing.output}/1K`;
            }
        }
    }
    
    // === PŮVODNÍ FUNKCE (zachované) ===
    
    // Nastavit téma
    setTheme(themeKey) {
        if (!this.isValidTheme(themeKey)) {
            console.warn(`Invalid theme: ${themeKey}`);
            return;
        }
        
        this.currentTheme = themeKey;
        this.applyTheme(themeKey);
        this.updateThemeButtons();
        
        // Uložit preferenci
        localStorage.setItem('selectedTheme', themeKey);
        
        console.log(`🎨 Theme changed to: ${themeKey}`);
    }

    // Aplikovat téma
    applyTheme(themeKey) {
        // Odstranit všechny theme třídy
        document.body.classList.remove('theme-claude', 'theme-google', 'theme-replit', 'theme-carrd');
        
        // Přidat novou theme třídu
        if (themeKey !== 'claude') {
            document.body.classList.add(`theme-${themeKey}`);
        }
    }

    // Validace tématu
    isValidTheme(themeKey) {
        return ['claude', 'google', 'replit', 'carrd'].includes(themeKey);
    }

    // Aktualizovat tlačítka témat
    updateThemeButtons() {
        const buttons = document.querySelectorAll('.theme-btn');
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.classList.contains(`theme-${this.currentTheme}`)) {
                btn.classList.add('active');
            }
        });
    }

    // Nastavit příklady dotazů
    setupExampleQueries() {
        const container = document.getElementById('example-queries');
        if (!container) return;
        
        const queries = CONFIG.UI.EXAMPLE_QUERIES || [];
        
        container.innerHTML = queries.map(query => `
            <div class="example-query" onclick="window.uiManager.useExampleQuery('${query.replace(/'/g, "\\'")}')">
                ${query}
            </div>
        `).join('');
    }

    // Použít příklad dotazu
    useExampleQuery(query) {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = query;
            chatInput.focus();
            
            // Automaticky odeslat
            if (window.sendMessage) {
                window.sendMessage();
            }
        }
    }

    // Přidat zprávu do chatu
    addMessage(type, content) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        // Skrýt welcome screen při první zprávě
        if (this.isWelcomeScreenVisible) {
            this.hideWelcomeScreen();
        }
        
        // Odstranit loading zprávu pokud přidáváme odpověď
        if ((type === 'assistant' || type === 'error') && this.lastSystemMessageElement) {
            this.lastSystemMessageElement.remove();
            this.lastSystemMessageElement = null;
        }
        
        // Vytvořit element zprávy
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = content;
        
        // Uložit referenci na system zprávy (loading)
        if (type === 'system' && content.includes(CONFIG.MESSAGES.LOADING)) {
            this.lastSystemMessageElement = messageDiv;
        }
        
        // Přidat zprávu
        chatMessages.appendChild(messageDiv);
        
        // Scrollovat dolů
        this.scrollToBottom();
    }

    // Skrýt welcome screen
    hideWelcomeScreen() {
        const welcomeContainer = document.querySelector('.welcome-container');
        if (welcomeContainer) {
            welcomeContainer.style.display = 'none';
        }
        this.isWelcomeScreenVisible = false;
    }

    // Zobrazit welcome screen
    showWelcomeScreen() {
        // Vyčistit chat
        this.clearChat();
        
        // Znovu zobrazit welcome container
        const welcomeContainer = document.querySelector('.welcome-container');
        if (welcomeContainer) {
            welcomeContainer.style.display = 'flex';
        }
        this.isWelcomeScreenVisible = true;
        
        // Vyčistit input
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = '';
        }
        
        // Reset zpráv v main.js
        if (window.chatSystem) {
            window.chatSystem.clearMessages();
        }
    }

    // Vyčistit chat
    clearChat() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        // Odstranit všechny zprávy kromě welcome containeru
        const messages = chatMessages.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());
        
        this.lastSystemMessageElement = null;
    }

    // Scrollovat dolů
    scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
}

// Vytvořit globální instanci
window.uiManager = new UIManager();

// Inicializovat po načtení DOM
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager.init();
});

console.log('📦 UI Manager loaded (Multi-Model Edition)');
