// Hlavní aplikační logika - My AI Chat - Multi-Model verze
// Verze: 2.0 - Refactored pro podporu více modelů

const APP_VERSION = "2.0";

// Globální proměnné
let messages = [];
let rateLimitCounter = 0;
let rateLimitTimer = null;

// Odeslání zprávy - nyní používá Model Manager
async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const messageText = chatInput.value.trim();
    
    if (!messageText) return;
    
    // Kontrola rate limitingu
    if (CONFIG.RATE_LIMITING.ENABLED && !checkRateLimit()) {
        if (window.uiManager) {
            window.uiManager.addMessage('system', CONFIG.RATE_LIMITING.COOLDOWN_MESSAGE);
        }
        return;
    }
    
    // Přidat uživatelovu zprávu
    if (window.uiManager) {
        window.uiManager.addMessage('user', messageText);
    }
    messages.push({ role: 'user', content: messageText });
    
    // Vyčistit input a nastavit loading stav
    chatInput.value = '';
    chatInput.style.height = 'auto';
    chatInput.style.overflowY = 'hidden';
    chatInput.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = CONFIG.MESSAGES.LOADING;
    
    // Přidat loading indikátor s info o modelu
    const activeModel = window.modelManager?.getActiveModel();
    const modelInfo = window.modelManager?.getModelInfo();
    const loadingMessage = `${CONFIG.MESSAGES.LOADING} (${modelInfo?.name || 'AI'})`;
    
    if (window.uiManager) {
        window.uiManager.addMessage('system', loadingMessage);
    }
    
    try {
        // Použít Model Manager pro odeslání zprávy
        const response = await window.modelManager.sendMessage(messages);
        
        // Přidat odpověď
        if (window.uiManager) {
            window.uiManager.addMessage('assistant', response);
        }
        messages.push({ role: 'assistant', content: response });
        
    } catch (error) {
        console.error('❌ Error:', error);
        let errorMessage = CONFIG.MESSAGES.ERROR;
        
        // Specifické chybové hlášky
        if (error.message.includes('401')) {
            errorMessage = 'Neplatný API klíč. Zkontrolujte nastavení.';
        } else if (error.message.includes('429')) {
            errorMessage = 'Překročen limit požadavků. Zkuste to později.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Chyba připojení k internetu.';
        } else if (error.message.includes('No active model')) {
            errorMessage = 'Není vybrán žádný model. Obnovte stránku.';
        }
        
        if (window.uiManager) {
            window.uiManager.addMessage('error', errorMessage);
        }
    } finally {
        // Obnovit UI
        chatInput.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = CONFIG.UI.SEND_BUTTON_TEXT || 'Odeslat';
        chatInput.focus();
    }
}

// Rate limiting
function checkRateLimit() {
    if (!CONFIG.RATE_LIMITING.ENABLED) return true;
    
    rateLimitCounter++;
    
    if (!rateLimitTimer) {
        rateLimitTimer = setTimeout(() => {
            rateLimitCounter = 0;
            rateLimitTimer = null;
        }, 60000); // Reset po minutě
    }
    
    return rateLimitCounter <= CONFIG.RATE_LIMITING.MAX_MESSAGES_PER_MINUTE;
}

// Změna modelu (volá se z UI)
async function changeModel(modelId) {
    console.log(`🔄 User requested model change to: ${modelId}`);
    
    try {
        const success = await window.modelManager.setActiveModel(modelId);
        if (success) {
            // Zobrazit potvrzení
            const modelInfo = window.modelManager.getModelInfo(modelId);
            if (window.uiManager) {
                window.uiManager.addMessage('system', 
                    `✅ Přepnuto na model: ${modelInfo.name}`
                );
            }
        }
    } catch (error) {
        console.error('❌ Failed to change model:', error);
        if (window.uiManager) {
            window.uiManager.addMessage('error', 'Nepodařilo se změnit model');
        }
    }
}

// Inicializace aplikace
async function initApp() {
    console.log('🚀 Starting My AI Chat...');
    console.log('📌 App Version:', APP_VERSION);
    console.log('📌 Config Version:', CONFIG.VERSION || 'not set');
    console.log('📌 Last Update:', CONFIG.LAST_UPDATE || 'not set');
    
    // Inicializovat Model Manager
    if (window.modelManager) {
        await window.modelManager.initialize();
        
        // Validovat konfiguraci
        const issues = window.modelManager.validateConfiguration();
        if (issues.length > 0) {
            console.warn('⚠️ Configuration issues:', issues);
        }
        
        // Zobrazit dostupné modely
        const models = window.modelManager.getAvailableModels();
        console.log('🤖 Available models:', models.map(m => m.id).join(', '));
        
        // Zobrazit aktivní model
        const activeModel = window.modelManager.getModelInfo();
        console.log('✅ Active model:', activeModel?.name || 'none');
    } else {
        console.error('❌ Model Manager not found!');
    }
    
    // Načíst uložené téma
    if (window.uiManager) {
        const savedTheme = localStorage.getItem('selectedTheme');
        const themeToUse = savedTheme || CONFIG.UI.DEFAULT_THEME;
        console.log('🎨 Loading theme:', themeToUse, savedTheme ? '(saved)' : '(default)');
        window.uiManager.setTheme(themeToUse);
    }
    
    console.log('✅ My AI Chat ready - Multi-Model Edition');
}

// Spuštění aplikace
window.addEventListener('load', function() {
    console.log('🌟 Window loaded, waiting for dependencies...');
    
    // Počkat na načtení všech závislostí
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkDependencies = () => {
        attempts++;
        
        if (window.modelManager && window.uiManager) {
            console.log('✅ All dependencies loaded');
            setTimeout(initApp, 100);
        } else {
            if (attempts < maxAttempts) {
                console.log(`⏳ Waiting for dependencies... (${attempts}/${maxAttempts})`);
                setTimeout(checkDependencies, 200);
            } else {
                console.error('❌ Failed to load dependencies');
                alert('Chyba při načítání aplikace. Obnovte stránku.');
            }
        }
    };
    
    checkDependencies();
});

// Export pro testování a globální přístup
window.chatSystem = {
    messages: messages,
    sendMessage: sendMessage,
    changeModel: changeModel,
    clearMessages: () => { 
        messages = [];
        if (window.uiManager) {
            window.uiManager.clearChat();
        }
    },
    version: APP_VERSION
};

// Zachování kompatibility
window.sendMessage = sendMessage;
window.changeModel = changeModel;

console.log('📦 Main.js loaded successfully (Multi-Model Edition)');
