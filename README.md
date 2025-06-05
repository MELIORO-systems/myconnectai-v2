# My AI Chat - Multi-Model Edition

AI Chat aplikace s podporou více jazykových modelů.

## Funkce

- 🤖 Podpora více AI modelů (GPT-3.5, GPT-4, připraveno pro Claude a další)
- 🎨 4 barevná témata
- 💾 Ukládání preferencí
- 📚 Knowledge base podpora
- 🔒 Bezpečné API volání přes Cloudflare Worker

## Instalace

1. Naklonovat repozitář
2. Upravit `config.js` - nastavit URL vašeho Cloudflare Workeru
3. Nahrát Cloudflare Worker
4. Nastavit API klíče v Cloudflare Worker environment
5. Deploy na GitHub Pages nebo jiný hosting

## Konfigurace

### Cloudflare Worker Environment Variables:
- `OPENAI_API_KEY` - pro OpenAI modely
- `CLAUDE_API_KEY` - pro Claude modely (budoucí)
- `GEMINI_API_KEY` - pro Google modely (budoucí)

### Přidání nového modelu:

1. Vytvořit `model-{provider}.js`
2. Implementovat model interface
3. Registrovat v model manageru
4. Přidat do konfigurace

## Struktura

```
├── index.html          # Hlavní HTML
├── style.css          # Styly + model selector
├── config.js          # Konfigurace
├── main.js            # Hlavní logika
├── ui-manager.js      # UI správa
├── model-manager.js   # Správa modelů
├── model-openai.js    # OpenAI implementace
└── knowledge-*.txt    # Knowledge base soubory
```

## Použití

1. Otevřít aplikaci
2. Vybrat AI model v hlavičce
3. Psát dotazy
4. Model lze kdykoliv změnit

## Licence

Copyright (c) 2024 MELIORO Systems
