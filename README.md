# MyConnectAI v2 - Multi-Model AI Chat

AI Chat aplikace s podporou více jazykových modelů a jednoduchým přidáváním nových.

## ✨ Funkce

- 🤖 Podpora více AI modelů (GPT-3.5, GPT-4, GPT-4o Mini, připraveno pro Claude a Gemini)
- 🎨 4 barevná témata (Claude, Google, Replit, Carrd)
- 💾 Ukládání preferencí (vybraný model a téma)
- 📚 Knowledge base podpora
- 🤝 Agent mode s OpenAI Assistant API
- 🔒 Bezpečné API volání přes Cloudflare Worker
- ⚡ Jednoduché přidávání nových modelů (úprava jediného souboru)

## 🚀 Instalace

1. Naklonovat repozitář
2. Upravit `config.js` - nastavit URL vašeho Cloudflare Workeru
3. Nahrát Cloudflare Worker
4. Nastavit API klíče v Cloudflare Worker environment
5. Deploy na GitHub Pages nebo jiný hosting

## ⚙️ Konfigurace

### Cloudflare Worker Environment Variables:
- `OPENAI_API_KEY` - pro OpenAI modely (GPT)
- `ANTHROPIC_API_KEY` nebo `CLAUDE_API_KEY` - pro Claude modely
- `GOOGLE_API_KEY` nebo `GEMINI_API_KEY` - pro Google modely

### Základní nastavení v `config.js`:
```javascript
// Debug mode - zobrazí detaily o modelech v konzoli
DEBUG_MODE: false,

// Whitelist viditelných modelů (prázdné = použít výchozí z registry)
VISIBLE_MODELS: ["gpt-3.5-turbo", "gpt-4o-mini"],

// Výchozí model
MODELS: {
    DEFAULT: 'gpt-4o-mini'
}
```

## 📁 Struktura

```
├── index.html            # Hlavní HTML
├── style.css            # Styly včetně témat
├── config.js            # Konfigurace aplikace
├── models-registry.js   # ⭐ Definice všech AI modelů
├── model-loader.js      # Automatické načítání modelů
├── model-manager.js     # Správa aktivních modelů
├── model-openai.js      # OpenAI implementace
├── ui-manager.js        # Správa UI a témat
├── main.js             # Hlavní aplikační logika
└── knowledge-*.txt      # Knowledge base soubory
```

## 🎯 Použití

1. Otevřít aplikaci
2. Vybrat AI model v hlavičce
3. Psát dotazy
4. Model lze kdykoliv změnit
5. Téma lze změnit kliknutím na barevná kolečka

---

# 📖 Návod pro přidání nového AI modelu

## 🚀 Rychlý start

Pro přidání nového modelu stačí upravit **jediný soubor**: `models-registry.js`

## 📋 Krok za krokem

### 1. Otevřete soubor `models-registry.js`

### 2. Přidejte nový objekt do pole `MODELS_REGISTRY`

```javascript
{
    id: "nazev-modelu",           // Unikátní ID modelu
    provider: "openai",            // Provider: "openai", "anthropic" nebo "google"
    name: "Zobrazovaný název",     // Název který uvidí uživatelé
    enabled: true,                 // true = model je technicky funkční
    visible: true,                 // true = model se zobrazí v UI
    config: {
        model: "nazev-modelu",     // Název modelu pro API
        contextWindow: 128000,     // Velikost kontextového okna
        maxTokens: 4096,          // Max. počet tokenů v odpovědi
        temperature: 0.7,          // Výchozí teplota (0-1)
        capabilities: ["chat"],    // Schopnosti modelu
        description: "Popis"       // Krátký popis modelu
    }
}
```

### 3. Uložte soubor a obnovte aplikaci

## 📝 Příklady

### Přidání GPT-4 Vision
```javascript
{
    id: "gpt-4-vision-preview",
    provider: "openai",
    name: "GPT-4 Vision",
    enabled: true,
    visible: true,
    config: {
        model: "gpt-4-vision-preview",
        contextWindow: 128000,
        maxTokens: 4096,
        temperature: 0.7,
        capabilities: ["chat", "vision", "analysis"],
        description: "GPT-4 s podporou analýzy obrázků"
    }
}
```

### Přidání Claude 3.5 Sonnet
```javascript
{
    id: "claude-3-5-sonnet-20241022",
    provider: "anthropic",
    name: "Claude 3.5 Sonnet",
    enabled: true,
    visible: true,
    config: {
        model: "claude-3-5-sonnet-20241022",
        contextWindow: 200000,
        maxTokens: 8192,
        temperature: 0.7,
        capabilities: ["chat", "analysis", "coding", "vision"],
        description: "Nejnovější a nejchytřejší Claude model"
    }
}
```

### Přidání Gemini 1.5 Pro
```javascript
{
    id: "gemini-1.5-pro",
    provider: "google",
    name: "Gemini 1.5 Pro",
    enabled: true,
    visible: true,
    config: {
        model: "gemini-1.5-pro",
        contextWindow: 1000000,
        maxTokens: 8192,
        temperature: 0.7,
        capabilities: ["chat", "analysis", "vision", "long-context"],
        description: "Google Gemini s obrovským kontextovým oknem"
    }
}
```

## ⚙️ Parametry modelu

### Povinné parametry:
- **id**: Unikátní identifikátor (musí odpovídat API názvu)
- **provider**: Určuje který API provider se použije
  - `"openai"` - pro GPT modely
  - `"anthropic"` - pro Claude modely
  - `"google"` - pro Gemini modely
- **name**: Zobrazovaný název v UI
- **enabled**: Zda je model technicky připraven k použití
- **visible**: Zda se model zobrazí uživatelům

### Config parametry:
- **model**: Přesný název modelu pro API volání
- **contextWindow**: Kolik tokenů model zvládne (kontext)
- **maxTokens**: Maximální délka odpovědi
- **temperature**: Kreativita modelu (0 = deterministický, 1 = kreativní)
- **capabilities**: Seznam schopností (pro budoucí filtrování)
- **description**: Popis pro uživatele

## 🎯 Viditelnost modelů

### Globální whitelist (v `config.js`):
```javascript
VISIBLE_MODELS: ["gpt-3.5-turbo", "gpt-4o-mini", "claude-3-5-sonnet"]
```

- Pokud je whitelist prázdný, použije se `visible` flag z registry
- Pokud whitelist obsahuje modely, zobrazí se pouze ty

### Pravidla viditelnosti:
1. Model musí mít `enabled: true` (jinak se vůbec nenačte)
2. Model musí mít `visible: true` NEBO být ve whitelistu
3. Whitelist má přednost před `visible` flagem

## 🔧 Cloudflare Worker

Worker automaticky detekuje providera podle prefixu modelu:
- `gpt-*` → OpenAI
- `claude-*` → Anthropic  
- `gemini-*` → Google

**Důležité**: V Cloudflare Worker musí být nastavený příslušný API klíč:
- OpenAI: `OPENAI_API_KEY`
- Anthropic: `ANTHROPIC_API_KEY` nebo `CLAUDE_API_KEY`
- Google: `GOOGLE_API_KEY` nebo `GEMINI_API_KEY`

## 🐛 Debug mode

V `config.js` nastavte:
```javascript
DEBUG_MODE: true
```

Zobrazí v konzoli:
- Seznam všech načtených modelů
- Které modely jsou enabled/visible
- Případné chyby při načítání

## ❓ Časté otázky

### Proč se můj model nezobrazuje?
1. Zkontrolujte že má `enabled: true`
2. Zkontrolujte že má `visible: true` nebo je ve whitelistu
3. Zapněte DEBUG_MODE a podívejte se do konzole

### Jak přidat úplně nový provider?
Pro nové providery (např. Cohere, Mistral) je potřeba:
1. Přidat detekci do Cloudflare Worker
2. Vytvořit nový model soubor (např. `model-cohere.js`)
3. Přidat podporu do `model-loader.js`

### Mohu mít více modelů se stejným názvem?
Ne, každý model musí mít unikátní `id`. Název (`name`) může být stejný.

## 📌 Best practices

1. **Testujte nové modely** nejdřív s `visible: false`
2. **Používejte výstižné názvy** které uživatelé pochopí
3. **Aktualizujte popisy** aby uživatelé věděli, který model vybrat
4. **Kontrolujte limity** - contextWindow a maxTokens podle dokumentace
5. **Zálohujte** `models-registry.js` před úpravami

## 🛠️ Technické detaily

### Architektura
- **Models Registry**: Centrální definice všech modelů
- **Model Loader**: Automatické načítání při startu
- **Model Manager**: Runtime správa modelů
- **Provider Models**: Implementace pro jednotlivé providery
- **Cloudflare Worker**: Proxy s auto-detekcí providerů

### Přidání nového providera
1. Přidat model class (např. `model-mistral.js`)
2. Upravit `model-loader.js` - přidat case do `createModelInstance()`
3. Upravit Cloudflare Worker - přidat detekci prefixu
4. Přidat modely do `models-registry.js`

## 📄 Licence

Copyright (c) 2024 MELIORO Systems

## 🙏 Poděkování

- OpenAI za GPT modely
- Anthropic za Claude
- Google za Gemini
- Cloudflare za Workers platform
