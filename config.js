// Konfigurace aplikace - My AI Chat
// Verze: 2.0 - Multi-Model Support

const CONFIG = {
    // === ZÁKLADNÍ NASTAVENÍ ===
    VERSION: "2.0",
    LAST_UPDATE: new Date().toISOString(),
    
    // === REŽIM APLIKACE ===
    MODE: "agent", // "knowledge" nebo "agent" - NASTAVENO NA AGENT
    
    // === MODELY - NOVÁ SEKCE ===
    MODELS: {
        // Dostupné modely
        AVAILABLE: [
            'gpt-3.5-turbo',
            'gpt-4',
            'gpt-4-turbo-preview',
            'gpt-4o-mini'  // PŘIDÁN GPT-4o-mini
        ],
        
        // Výchozí model
        DEFAULT: 'gpt-4o-mini', // ZMĚNĚNO na gpt-4o-mini
        
        // Fallback chain - záložní modely při selhání
        FALLBACK_CHAIN: ['gpt-4o-mini', 'gpt-3.5-turbo'],
        
        // Konfigurace jednotlivých modelů
        CONFIGS: {
            'gpt-3.5-turbo': {
                name: 'GPT-3.5 Turbo'
            },
            'gpt-4': {
                name: 'GPT-4'
            },
            'gpt-4-turbo-preview': {
                name: 'GPT-4 Turbo'
            },
            'gpt-4o-mini': {
                name: 'GPT-4o Mini'
            }
        }
    },
    
    // === PROXY NASTAVENÍ ===
    PROXY: {
        URL: "https://ai-chat-proxy.pavel-2ce.workers.dev", // Vaše Cloudflare Worker URL
        ENDPOINTS: {
            KNOWLEDGE: "/knowledge",
            AGENT: "/agent",
            // Připraveno pro budoucí endpointy
            CHAT: "/api/chat" // Univerzální endpoint pro všechny modely
        }
    },
    
    // === API NASTAVENÍ ===
    API: {
        OPENAI: {
            SYSTEM_PROMPT: "Jsi přátelský a nápomocný AI asistent společnosti MELIORO Systems. Odpovídáš v češtině, pokud není požadováno jinak.",
            MODEL: "gpt-3.5-turbo", // Nyní se bere z MODELS.DEFAULT
            TEMPERATURE: 0.7,
            MAX_TOKENS: 2048
        }
    },
    
    // === AGENT NASTAVENÍ ===
    AGENT: {
        AGENT_ID: "asst_zTqY6AIGJZUprgy04VK2Bw0S", // Váš Assistant ID
        THREAD_TTL: 3600000 // 1 hodina v ms
    },
    
    // === KNOWLEDGE BASE ===
    KNOWLEDGE_BASE: {
        ENABLED: true,
        FILE_PREFIX: "knowledge-", // Opraveno - soubory jsou v root
        FILES: [
            { name: "company", description: "Informace o společnosti" },
            { name: "services", description: "Naše služby" },
            { name: "products", description: "Naše produkty" },
            { name: "contacts", description: "Kontaktní údaje" }
        ],
        CONTEXT_TEMPLATE: "Následující informace používej jako znalostní bázi pro zodpovězení dotazů:\n\n{knowledge}"
    },
    
    // === UI NASTAVENÍ ===
    UI: {
        PAGE_TITLE: "MyConnectAI v2 - Multi-Model Chat",
        APP_TITLE: "MyConnectAI v2",
        APP_SUBTITLE: "Multi-Model AI Assistant",
        
        // Tlačítka a vstupy
        SEND_BUTTON_TEXT: "Odeslat",
        INPUT_PLACEHOLDER: "Napište svůj dotaz...",
        RELOAD_BUTTON_TEXT: "Reload",
        RELOAD_BUTTON_TOOLTIP: "Znovu načíst chat",
        SHOW_RELOAD_BUTTON: true,
        
        // Témata
        DEFAULT_THEME: "claude",
        THEMES: {
            claude: {
                name: "Claude",
                tooltip: "Claude téma - výchozí světlé",
                emoji: "🟠"
            },
            google: {
                name: "Google",
                tooltip: "Google téma - čisté a moderní",
                emoji: "🔵"
            },
            replit: {
                name: "Replit",
                tooltip: "Tmavé téma pro noční práci",
                emoji: "🌙"
            },
            carrd: {
                name: "Carrd",
                tooltip: "Carrd téma - futuristické",
                emoji: "🎨"
            }
        },
        
        // Příklady dotazů
        EXAMPLE_QUERIES: [
            "Jaké služby nabízí MELIORO Systems?",
            "Jak funguje produkt Konektor?",
            "Můžete mi pomoci s automatizací procesů?",
            "Jaké jsou výhody vašich řešení?"
        ],
        
        // Patička
        FOOTER: {
            POWERED_BY_TEXT: "Powered by",
            COMPANY_NAME: "MELIORO Systems",
            COMPANY_URL: "http://melioro.cz",
            RETURN_TEXT: "Návrat na stránky",
            RETURN_LINK_TEXT: "MELIORO"
        }
    },
    
    // === ZPRÁVY ===
    MESSAGES: {
        LOADING: "Přemýšlím...",
        ERROR: "Omlouvám se, došlo k chybě. Zkuste to prosím znovu.",
        WELCOME: "Vítejte! Jak vám mohu pomoci?",
        CONNECTION_ERROR: "Chyba připojení. Zkontrolujte internetové připojení.",
        MODEL_CHANGED: "Model byl úspěšně změněn."
    },
    
    // === RATE LIMITING ===
    RATE_LIMITING: {
        ENABLED: true,
        MAX_MESSAGES_PER_MINUTE: 20,
        COOLDOWN_MESSAGE: "Příliš mnoho zpráv. Počkejte chvíli před dalším dotazem."
    },
    
    // === VÝVOJÁŘSKÉ NASTAVENÍ ===
    DEBUG: false,
    SHOW_STATS: false, // Zobrazovat statistiky použití
    LOG_LEVEL: "info" // "debug", "info", "warn", "error"
};

// Zmrazit konfiguraci proti změnám
Object.freeze(CONFIG);

// Explicitní export do window objektu
window.CONFIG = CONFIG;

console.log('📋 Config loaded - Multi-Model Edition v' + CONFIG.VERSION);
