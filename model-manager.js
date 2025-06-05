// Model Manager - Centrální správa AI modelů
// Verze: 1.0

class ModelManager {
    constructor() {
        this.models = new Map();
        this.activeModel = null;
        this.initialized = false;
    }

    // Registrace modelu
    registerModel(modelId, modelInstance) {
        console.log(`📦 Registering model: ${modelId}`);
        this.models.set(modelId, modelInstance);
    }

    // Inicializace
    async initialize() {
        if (this.initialized) return;
        
        console.log('🤖 Initializing Model Manager...');
        
        // Načíst uložený model nebo použít výchozí
        const savedModel = localStorage.getItem('selectedModel');
        const defaultModel = window.CONFIG?.MODELS?.DEFAULT || 'gpt-3.5-turbo';
        const modelToUse = savedModel || defaultModel;
        
        // Nastavit aktivní model
        await this.setActiveModel(modelToUse);
        
        this.initialized = true;
        console.log('✅ Model Manager ready');
    }

    // Nastavit aktivní model
    async setActiveModel(modelId) {
        if (!this.models.has(modelId)) {
            console.error(`❌ Model not found: ${modelId}`);
            return false;
        }

        console.log(`🔄 Switching to model: ${modelId}`);
        
        const model = this.models.get(modelId);
        
        // Inicializovat model pokud je potřeba
        if (model.initialize && !model.initialized) {
            await model.initialize();
        }
        
        this.activeModel = modelId;
        
        // Uložit preference
        localStorage.setItem('selectedModel', modelId);
        
        // Informovat UI o změně
        if (window.uiManager) {
            window.uiManager.updateModelIndicator(modelId);
        }
        
        console.log(`✅ Active model: ${modelId}`);
        return true;
    }

    // Získat aktivní model
    getActiveModel() {
        if (!this.activeModel || !this.models.has(this.activeModel)) {
            return null;
        }
        return this.models.get(this.activeModel);
    }

    // Poslat zprávu
    async sendMessage(messages, options = {}) {
        const model = this.getActiveModel();
        if (!model) {
            throw new Error('No active model selected');
        }

        console.log(`💬 Sending message via ${this.activeModel}`);
        
        try {
            // Volat model-specific implementaci
            const response = await model.sendMessage(messages, options);
            return response;
        } catch (error) {
            console.error(`❌ Model error (${this.activeModel}):`, error);
            
            // Zkusit fallback model
            if (options.allowFallback !== false) {
                return await this.tryFallbackModel(messages, options, error);
            }
            
            throw error;
        }
    }

    // Fallback strategie
    async tryFallbackModel(messages, options, originalError) {
        const fallbackChain = window.CONFIG?.MODELS?.FALLBACK_CHAIN || [];
        
        for (const fallbackId of fallbackChain) {
            if (fallbackId === this.activeModel) continue; // Skip failed model
            
            if (this.models.has(fallbackId)) {
                console.log(`🔄 Trying fallback model: ${fallbackId}`);
                
                try {
                    const model = this.models.get(fallbackId);
                    const response = await model.sendMessage(messages, {
                        ...options,
                        allowFallback: false // Prevent infinite loop
                    });
                    
                    // Přidat informaci o fallbacku
                    return `[Použit záložní model: ${fallbackId}]\n\n${response}`;
                } catch (fallbackError) {
                    console.error(`❌ Fallback failed: ${fallbackId}`);
                    continue;
                }
            }
        }
        
        // Všechny modely selhaly
        throw originalError;
    }

    // Získat informace o modelu
    getModelInfo(modelId = null) {
        const id = modelId || this.activeModel;
        const model = this.models.get(id);
        
        if (!model) return null;
        
        return {
            id: id,
            name: model.name || id,
            provider: model.provider || 'unknown',
            description: model.description || '',
            capabilities: model.capabilities || [],
            pricing: model.pricing || null,
            contextWindow: model.contextWindow || null,
            isActive: id === this.activeModel
        };
    }

    // Získat seznam všech modelů
    getAvailableModels() {
        const models = [];
        
        for (const [id, model] of this.models) {
            models.push(this.getModelInfo(id));
        }
        
        return models;
    }

    // Validovat konfiguraci
    validateConfiguration() {
        const issues = [];
        
        // Kontrola modelů
        if (this.models.size === 0) {
            issues.push('No models registered');
        }
        
        // Kontrola API klíčů
        for (const [id, model] of this.models) {
            if (model.validateConfig) {
                const modelIssues = model.validateConfig();
                if (modelIssues && modelIssues.length > 0) {
                    issues.push(`Model ${id}: ${modelIssues.join(', ')}`);
                }
            }
        }
        
        return issues;
    }

    // Získat statistiky použití
    getUsageStats() {
        const stats = {
            totalMessages: 0,
            totalTokens: 0,
            estimatedCost: 0,
            modelUsage: {}
        };
        
        // Agregovat statistiky ze všech modelů
        for (const [id, model] of this.models) {
            if (model.getStats) {
                const modelStats = model.getStats();
                stats.modelUsage[id] = modelStats;
                stats.totalMessages += modelStats.messages || 0;
                stats.totalTokens += modelStats.tokens || 0;
                stats.estimatedCost += modelStats.cost || 0;
            }
        }
        
        return stats;
    }

    // Reset statistik
    resetStats() {
        for (const [id, model] of this.models) {
            if (model.resetStats) {
                model.resetStats();
            }
        }
    }
}

// Vytvořit globální instanci
window.modelManager = new ModelManager();

console.log('📦 Model Manager loaded');
