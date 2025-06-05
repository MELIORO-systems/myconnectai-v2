// OpenAI Model Implementation
// Verze: 1.0

class OpenAIModel {
    constructor(modelId, config = {}) {
        this.id = modelId;
        this.name = config.name || modelId;
        this.provider = 'openai';
        this.description = config.description || '';
        this.initialized = false;
        
        // Model specific config
        this.model = modelId;
        this.contextWindow = config.contextWindow || 4096;
        this.maxTokens = config.maxTokens || 2048;
        this.temperature = config.temperature || 0.7;
        
        // Capabilities
        this.capabilities = config.capabilities || ['chat'];
        
        // Pricing (per 1K tokens)
        this.pricing = config.pricing || {
            input: 0.0005,
            output: 0.0015
        };
        
        // Usage stats
        this.stats = {
            messages: 0,
            tokens: 0,
            cost: 0
        };
        
        // Knowledge base for knowledge mode
        this.knowledgeBase = '';
    }

    // Inicializace modelu
    async initialize() {
        if (this.initialized) return;
        
        console.log(`🚀 Initializing OpenAI model: ${this.id}`);
        
        // Načíst knowledge base pokud je v knowledge mode
        if (window.CONFIG?.MODE === 'knowledge') {
            await this.loadKnowledgeBase();
        }
        
        this.initialized = true;
        console.log(`✅ OpenAI model ready: ${this.id}`);
    }

    // Načíst knowledge base (zkopírováno z main.js)
    async loadKnowledgeBase() {
        if (!window.CONFIG?.KNOWLEDGE_BASE?.ENABLED) {
            console.log('📚 Knowledge base is disabled');
            return;
        }
        
        console.log('📚 Loading knowledge base for OpenAI...');
        let loadedFiles = 0;
        let allKnowledge = "";
        
        for (const file of window.CONFIG.KNOWLEDGE_BASE.FILES) {
            try {
                const filename = `${window.CONFIG.KNOWLEDGE_BASE.FILE_PREFIX}${file.name}.txt`;
                const response = await fetch(filename);
                
                if (response.ok) {
                    const content = await response.text();
                    if (content.trim()) {
                        allKnowledge += `\n\n=== ${file.description.toUpperCase()} ===\n${content}`;
                        loadedFiles++;
                        console.log(`✅ Loaded: ${filename}`);
                    }
                } else {
                    console.warn(`⚠️ Could not load: ${filename}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error loading ${file.name}:`, error);
            }
        }
        
        if (loadedFiles > 0) {
            this.knowledgeBase = window.CONFIG.KNOWLEDGE_BASE.CONTEXT_TEMPLATE.replace('{knowledge}', allKnowledge);
            console.log(`✅ Knowledge base ready (${loadedFiles} files loaded)`);
        } else {
            console.warn('⚠️ No knowledge files were loaded');
        }
    }

    // Poslat zprávu
    async sendMessage(messages, options = {}) {
        // Použít agent nebo knowledge mode podle konfigurace
        if (window.CONFIG?.MODE === 'agent' && window.CONFIG?.AGENT?.AGENT_ID) {
            return await this.sendViaAgent(messages[messages.length - 1].content, options);
        } else {
            return await this.sendViaKnowledge(messages, options);
        }
    }

    // Knowledge mode (chat completions)
    async sendViaKnowledge(messages, options = {}) {
        console.log(`💬 OpenAI Knowledge mode: ${this.id}`);
        
        // Sestavit systémový prompt s knowledge base
        let systemPrompt = window.CONFIG?.API?.OPENAI?.SYSTEM_PROMPT || 'You are a helpful assistant.';
        if (this.knowledgeBase) {
            systemPrompt = `${systemPrompt}\n\n${this.knowledgeBase}`;
        }
        
        const requestPayload = {
            model: this.model,
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                ...messages
            ],
            temperature: options.temperature || this.temperature,
            max_tokens: options.maxTokens || this.maxTokens
        };
        
        console.log('📊 Request details:');
        console.log('  - Model:', requestPayload.model);
        console.log('  - Messages count:', requestPayload.messages.length);
        console.log('  - Temperature:', requestPayload.temperature);
        console.log('  - Max tokens:', requestPayload.max_tokens);
        
        const response = await fetch(`${window.CONFIG.PROXY.URL}${window.CONFIG.PROXY.ENDPOINTS.KNOWLEDGE}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestPayload)
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ API Error details:', errorData);
            throw new Error(`OpenAI API error: ${errorData.error || response.status}`);
        }
        
        const data = await response.json();
        
        // Update stats
        if (data.usage) {
            this.updateStats(data.usage);
        }
        
        console.log('✅ Response received successfully');
        return data.choices[0].message.content;
    }

    // Agent mode
    async sendViaAgent(userMessage, options = {}) {
        console.log(`🤖 OpenAI Agent mode: ${this.id}`);
        console.log('📝 Agent ID:', window.CONFIG.AGENT.AGENT_ID);
        
        // 1. Vytvořit thread pokud neexistuje
        if (!this.agentThreadId) {
            console.log('🔄 Creating new thread...');
            const threadResponse = await fetch(`${window.CONFIG.PROXY.URL}${window.CONFIG.PROXY.ENDPOINTS.AGENT}/threads`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (!threadResponse.ok) {
                const errorData = await threadResponse.json();
                console.error('❌ Thread creation error:', errorData);
                throw new Error(`Agent API error: ${errorData.error || threadResponse.status}`);
            }
            
            const threadData = await threadResponse.json();
            this.agentThreadId = threadData.id;
            console.log('✅ Created thread:', this.agentThreadId);
        }
        
        // 2. a 3. Přidat zprávu a spustit agenta
        console.log('📨 Adding message and starting run...');
        
        const [messageResponse, runResponse] = await Promise.all([
            // Přidat zprávu
            fetch(`${window.CONFIG.PROXY.URL}${window.CONFIG.PROXY.ENDPOINTS.AGENT}/threads/${this.agentThreadId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    role: "user",
                    content: userMessage
                })
            }),
            // Počkat 100ms a pak spustit run
            new Promise(resolve => setTimeout(resolve, 100)).then(() =>
                fetch(`${window.CONFIG.PROXY.URL}${window.CONFIG.PROXY.ENDPOINTS.AGENT}/threads/${this.agentThreadId}/runs`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        assistant_id: window.CONFIG.AGENT.AGENT_ID
                    })
                })
            )
        ]);
        
        if (!messageResponse.ok) {
            const error = await messageResponse.json();
            console.error('❌ Failed to add message:', error);
        }
        
        if (!runResponse.ok) {
            const errorData = await runResponse.json();
            throw new Error(`Assistant run error: ${errorData.error || runResponse.status}`);
        }
        
        const runData = await runResponse.json();
        const runId = runData.id;
        console.log('🏃 Run started with ID:', runId);
        
        // 4. Čekat na dokončení
        let runStatus = "in_progress";
        let attempts = 0;
        const maxAttempts = 60; // 30 sekund
        
        while ((runStatus === "in_progress" || runStatus === "queued") && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
            
            if (attempts % 4 === 1) {
                console.log(`⏳ Checking run status... (${Math.ceil(attempts/2)}s)`);
            }
            
            const statusResponse = await fetch(
                `${window.CONFIG.PROXY.URL}${window.CONFIG.PROXY.ENDPOINTS.AGENT}/threads/${this.agentThreadId}/runs/${runId}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            
            if (!statusResponse.ok) {
                const error = await statusResponse.json();
                console.error('❌ Status check failed:', error);
                break;
            }
            
            const statusData = await statusResponse.json();
            runStatus = statusData.status;
            
            if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
                console.error('❌ Run failed with status:', runStatus);
                throw new Error(`Agent run ${runStatus}`);
            }
        }
        
        if (attempts >= maxAttempts) {
            throw new Error('Agent timeout - took too long to respond');
        }
        
        // 5. Získat odpověď
        console.log('📩 Getting messages...');
        const messagesResponse = await fetch(
            `${window.CONFIG.PROXY.URL}${window.CONFIG.PROXY.ENDPOINTS.AGENT}/threads/${this.agentThreadId}/messages`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
        
        if (!messagesResponse.ok) {
            const error = await messagesResponse.json();
            console.error('❌ Failed to get messages:', error);
            throw new Error('Failed to retrieve agent response');
        }
        
        const messagesData = await messagesResponse.json();
        const agentMessages = messagesData.data.filter(msg => msg.role === 'assistant');
        
        if (agentMessages.length === 0) {
            console.error('❌ No agent response found');
            throw new Error('Agent did not respond');
        }
        
        const lastMessage = agentMessages[0];
        const responseText = lastMessage.content[0].text.value;
        console.log('✅ Agent response received');
        
        return responseText;
    }

    // Update statistik
    updateStats(usage) {
        if (!usage) return;
        
        this.stats.messages++;
        this.stats.tokens += (usage.total_tokens || 0);
        
        // Vypočítat cenu
        const inputCost = ((usage.prompt_tokens || 0) / 1000) * this.pricing.input;
        const outputCost = ((usage.completion_tokens || 0) / 1000) * this.pricing.output;
        this.stats.cost += inputCost + outputCost;
        
        console.log(`📊 Usage: ${usage.total_tokens} tokens, $${(inputCost + outputCost).toFixed(4)}`);
    }

    // Validace konfigurace
    validateConfig() {
        const issues = [];
        
        if (!window.CONFIG?.PROXY?.URL) {
            issues.push('Missing proxy URL');
        }
        
        if (window.CONFIG?.MODE === 'agent' && !window.CONFIG?.AGENT?.AGENT_ID) {
            issues.push('Agent mode enabled but no Agent ID configured');
        }
        
        return issues;
    }

    // Získat statistiky
    getStats() {
        return { ...this.stats };
    }

    // Reset statistik
    resetStats() {
        this.stats = {
            messages: 0,
            tokens: 0,
            cost: 0
        };
    }
}

// Registrace OpenAI modelů
if (window.modelManager) {
    // GPT-3.5 Turbo
    window.modelManager.registerModel('gpt-3.5-turbo', new OpenAIModel('gpt-3.5-turbo', {
        name: 'GPT-3.5 Turbo',
        description: 'Rychlý a cenově efektivní model',
        contextWindow: 16384,
        maxTokens: 4096,
        capabilities: ['chat', 'analysis'],
        pricing: {
            input: 0.0005,
            output: 0.0015
        }
    }));

    // GPT-4
    window.modelManager.registerModel('gpt-4', new OpenAIModel('gpt-4', {
        name: 'GPT-4',
        description: 'Nejvýkonnější model pro komplexní úlohy',
        contextWindow: 8192,
        maxTokens: 4096,
        capabilities: ['chat', 'analysis', 'reasoning', 'coding'],
        pricing: {
            input: 0.03,
            output: 0.06
        }
    }));

    // GPT-4 Turbo
    window.modelManager.registerModel('gpt-4-turbo-preview', new OpenAIModel('gpt-4-turbo-preview', {
        name: 'GPT-4 Turbo',
        description: 'Rychlejší verze GPT-4 s větším kontextem',
        contextWindow: 128000,
        maxTokens: 4096,
        capabilities: ['chat', 'analysis', 'reasoning', 'coding', 'vision'],
        pricing: {
            input: 0.01,
            output: 0.03
        }
    }));
}

console.log('📦 OpenAI models loaded');
