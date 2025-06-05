// Model Loader - Automatické načítání modelů z registry
// Verze: 1.0

class ModelLoader {
    constructor() {
        this.loadedModels = [];
        this.stats = {
            configured: 0,
            enabled: 0,
            visible: 0,
            loaded: 0,
            failed: 0
        };
    }

    // Načíst a zaregistrovat všechny modely
    async loadModels() {
        console.log('🔄 Model Loader starting...');
        
        // Zkontrolovat že máme registry
        if (typeof window.MODELS_REGISTRY === 'undefined') {
            console.error('❌ MODELS_REGISTRY not found! Make sure models-registry.js is loaded first.');
            return false;
        }

        // Zkontrolovat že máme model manager
        if (!window.modelManager) {
            console.error('❌ Model Manager not found!');
            return false;
        }

        // Získat whitelist z konfigurace
        const visibleModels = window.CONFIG?.VISIBLE_MODELS || [];
        const hasWhitelist = visibleModels.length > 0;
        const debugMode = window.CONFIG?.DEBUG_MODE || false;

        // Statistiky
        this.stats.configured = window.MODELS_REGISTRY.length;

        // Procházet všechny modely v registry
        for (const modelDef of window.MODELS_REGISTRY) {
            try {
                // Kontrola enabled
                if (!modelDef.enabled) {
                    if (debugMode) {
                        console.log(`⏭️ Skipping disabled model: ${modelDef.id}`);
                    }
                    continue;
                }
                
                this.stats.enabled++;

                // Určit viditelnost - whitelist má přednost před výchozí hodnotou
                let isVisible = modelDef.visible;
                if (hasWhitelist) {
                    isVisible = visibleModels.includes(modelDef.id);
                }

                if (isVisible) {
                    this.stats.visible++;
                }

                // Vytvořit instanci modelu podle providera
                const modelInstance = await this.createModelInstance(modelDef);
                
                if (modelInstance) {
                    // Přidat info o viditelnosti
                    modelInstance.visible = isVisible;
                    
                    // Zaregistrovat v model manageru
                    window.modelManager.registerModel(modelDef.id, modelInstance);
                    
                    this.loadedModels.push({
                        id: modelDef.id,
                        name: modelDef.name,
                        provider: modelDef.provider,
                        visible: isVisible
                    });
                    
                    this.stats.loaded++;
                    
                    if (debugMode) {
                        console.log(`✅ Loaded model: ${modelDef.id} (visible: ${isVisible})`);
                    }
                }
            } catch (error) {
                console.error(`❌ Failed to load model ${modelDef.id}:`, error);
                this.stats.failed++;
            }
        }

        // Zobrazit souhrn
        this.displaySummary(debugMode);
        
        // Validace
        this.validateConfiguration();
        
        return true;
    }

    // Vytvořit instanci modelu
    async createModelInstance(modelDef) {
        const { id, provider, name, config } = modelDef;
        
        switch (provider) {
            case 'openai':
                // Použít existující OpenAIModel class
                if (typeof OpenAIModel === 'undefined') {
                    console.error('❌ OpenAIModel class not found!');
                    return null;
                }
                
                return new OpenAIModel(id, {
                    name: name,
                    description: config.description,
                    contextWindow: config.contextWindow,
                    maxTokens: config.maxTokens,
                    temperature: config.temperature,
                    capabilities: config.capabilities
                });
                
            case 'anthropic':
                // Připraveno pro budoucnost
                if (typeof ClaudeModel !== 'undefined') {
                    return new ClaudeModel(id, {
                        name: name,
                        ...config
                    });
                } else {
                    if (window.CONFIG?.DEBUG_MODE) {
                        console.log(`⏭️ ClaudeModel class not available for ${id}`);
                    }
                    return null;
                }
                
            case 'google':
                // Připraveno pro budoucnost
                if (typeof GeminiModel !== 'undefined') {
                    return new GeminiModel(id, {
                        name: name,
                        ...config
                    });
                } else {
                    if (window.CONFIG?.DEBUG_MODE) {
                        console.log(`⏭️ GeminiModel class not available for ${id}`);
                    }
                    return null;
                }
                
            default:
                console.warn(`⚠️ Unknown provider: ${provider}`);
                return null;
        }
    }

    // Zobrazit souhrn
    displaySummary(debugMode) {
        if (!debugMode) return;
        
        console.log('📋 Model Registry Summary:');
        console.log(`- Configured: ${this.stats.configured}`);
        console.log(`- Enabled: ${this.stats.enabled}`);
        console.log(`- Visible: ${this.stats.visible}`);
        console.log(`- Loaded: ${this.stats.loaded}`);
        if (this.stats.failed > 0) {
            console.log(`- Failed: ${this.stats.failed}`);
        }
        
        // Seznam viditelných modelů
        const visibleModels = this.loadedModels.filter(m => m.visible);
        if (visibleModels.length > 0) {
            console.log(`✅ Ready models: ${visibleModels.map(m => m.id).join(', ')}`);
        }
    }

    // Validace konfigurace
    validateConfiguration() {
        const visibleModels = this.loadedModels.filter(m => m.visible);
        
        // Kontrola že máme alespoň jeden viditelný model
        if (visibleModels.length === 0) {
            console.error('❌ No visible models available! Check VISIBLE_MODELS in config.js');
            return false;
        }
        
        // Kontrola že výchozí model existuje a je viditelný
        const defaultModel = window.CONFIG?.MODELS?.DEFAULT || 'gpt-3.5-turbo';
        const defaultIsVisible = visibleModels.some(m => m.id === defaultModel);
        
        if (!defaultIsVisible) {
            console.warn(`⚠️ Default model '${defaultModel}' is not visible. Using first visible model.`);
            // Nastavit první viditelný model jako výchozí
            if (window.CONFIG && window.CONFIG.MODELS) {
                window.CONFIG.MODELS.DEFAULT = visibleModels[0].id;
            }
        }
        
        // Kontrola whitelistu
        const configuredWhitelist = window.CONFIG?.VISIBLE_MODELS || [];
        if (configuredWhitelist.length > 0) {
            const invalidModels = configuredWhitelist.filter(id => 
                !this.loadedModels.some(m => m.id === id)
            );
            
            if (invalidModels.length > 0) {
                console.warn(`⚠️ Invalid models in VISIBLE_MODELS: ${invalidModels.join(', ')}`);
            }
        }
        
        return true;
    }

    // Získat dostupné modely pro UI
    getVisibleModels() {
        return this.loadedModels.filter(m => m.visible);
    }

    // Získat všechny načtené modely
    getAllModels() {
        return this.loadedModels;
    }

    // Získat statistiky
    getStats() {
        return { ...this.stats };
    }
}

// Vytvořit globální instanci
window.modelLoader = new ModelLoader();

// Automatické načtení při startu
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Auto-loading models from registry...');
    
    // Počkat na načtení všech závislostí
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryLoadModels = async () => {
        attempts++;
        
        // Kontrola závislostí
        if (window.MODELS_REGISTRY && window.modelManager && window.CONFIG) {
            await window.modelLoader.loadModels();
        } else {
            if (attempts < maxAttempts) {
                if (window.CONFIG?.DEBUG_MODE) {
                    console.log(`⏳ Waiting for dependencies... (${attempts}/${maxAttempts})`);
                }
                setTimeout(tryLoadModels, 200);
            } else {
                console.error('❌ Failed to load models - dependencies not ready');
            }
        }
    };
    
    // Začít načítání
    setTimeout(tryLoadModels, 100);
});

console.log('📦 Model Loader ready');
