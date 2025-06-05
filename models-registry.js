// Models Registry - Centrální definice všech AI modelů
// Verze: 1.0
// 
// Tento soubor obsahuje definice VŠECH dostupných modelů.
// Pro přidání nového modelu stačí přidat nový objekt do pole MODELS_REGISTRY.

const MODELS_REGISTRY = [
    // === OPENAI MODELS ===
    {
        id: "gpt-3.5-turbo",
        provider: "openai",
        name: "GPT-3.5 Turbo",
        enabled: true,
        visible: true, // Výchozí viditelnost - může být přepsána v config.js
        config: {
            model: "gpt-3.5-turbo",
            contextWindow: 16384,
            maxTokens: 4096,
            temperature: 0.7,

            capabilities: ["chat", "analysis"],
            description: "Rychlý a cenově efektivní model pro běžné úlohy"
        }
    },
    {
        id: "gpt-4",
        provider: "openai",
        name: "GPT-4",
        enabled: true,
        visible: false,
        config: {
            model: "gpt-4",
            contextWindow: 8192,
            maxTokens: 4096,
            temperature: 0.7,

            capabilities: ["chat", "analysis", "reasoning", "coding"],
            description: "Nejvýkonnější model pro komplexní úlohy"
        }
    },
    {
        id: "gpt-4-turbo-preview",
        provider: "openai",
        name: "GPT-4 Turbo",
        enabled: true,
        visible: false,
        config: {
            model: "gpt-4-turbo-preview",
            contextWindow: 128000,
            maxTokens: 4096,
            temperature: 0.7,

            capabilities: ["chat", "analysis", "reasoning", "coding", "vision"],
            description: "Rychlejší verze GPT-4 s větším kontextem"
        }
    },
    {
        id: "gpt-4o-mini",
        provider: "openai",
        name: "GPT-4o Mini",
        enabled: true,
        visible: true,
        config: {
            model: "gpt-4o-mini",
            contextWindow: 128000,
            maxTokens: 4096,
            temperature: 0.7,

            capabilities: ["chat", "analysis", "reasoning"],
            description: "Optimalizovaná verze GPT-4 pro rychlé odpovědi"
        }
    },
    
    // === ANTHROPIC MODELS (připraveno pro budoucnost) ===
    {
        id: "claude-3-opus-20240229",
        provider: "anthropic",
        name: "Claude 3 Opus",
        enabled: false, // Zatím neaktivní
        visible: false,
        config: {
            model: "claude-3-opus-20240229",
            contextWindow: 200000,
            maxTokens: 4096,
            temperature: 0.7,

            capabilities: ["chat", "analysis", "reasoning", "coding", "vision"],
            description: "Nejvýkonnější model od Anthropic"
        }
    },
    {
        id: "claude-3-sonnet-20240229",
        provider: "anthropic",
        name: "Claude 3 Sonnet",
        enabled: false,
        visible: false,
        config: {
            model: "claude-3-sonnet-20240229",
            contextWindow: 200000,
            maxTokens: 4096,
            temperature: 0.7,

            capabilities: ["chat", "analysis", "reasoning", "coding"],
            description: "Vyvážený model pro většinu úloh"
        }
    },
    {
        id: "claude-3-haiku-20240229",
        provider: "anthropic",
        name: "Claude 3 Haiku",
        enabled: false,
        visible: false,
        config: {
            model: "claude-3-haiku-20240229",
            contextWindow: 200000,
            maxTokens: 4096,
            temperature: 0.7,

            capabilities: ["chat", "analysis"],
            description: "Rychlý a cenově efektivní model"
        }
    },
    
    // === GOOGLE MODELS (připraveno pro budoucnost) ===
    {
        id: "gemini-pro",
        provider: "google",
        name: "Gemini Pro",
        enabled: false,
        visible: false,
        config: {
            model: "gemini-pro",
            contextWindow: 32000,
            maxTokens: 8192,
            temperature: 0.7,

            capabilities: ["chat", "analysis", "reasoning"],
            description: "Google Gemini Pro model"
        }
    }
];

// Export pro použití v jiných souborech
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MODELS_REGISTRY;
} else {
    window.MODELS_REGISTRY = MODELS_REGISTRY;
}

console.log('📋 Models Registry loaded with', MODELS_REGISTRY.length, 'models');
