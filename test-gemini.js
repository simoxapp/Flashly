const fs = require('fs');
const path = require('path');

function loadEnv() {
    try {
        const envPath = path.join(__dirname, '.env');
        const content = fs.readFileSync(envPath, 'utf8');
        const env = {};
        content.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                if (key && !key.startsWith('#')) {
                    env[key] = value;
                }
            }
        });
        return env;
    } catch (e) {
        console.error("Could not read .env file:", e.message);
        return {};
    }
}

async function listModels() {
    const env = loadEnv();
    const apiKey = env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("GEMINI_API_KEY not found in .env");
        return;
    }

    console.log("Listing models with API Key:", apiKey.substring(0, 5) + "...");

    // Test v1beta
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error("Error listing models:", data);
            return;
        }

        console.log("Available Models:");
        if (data.models) {
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name} (${m.displayName})`);
                }
            });
        } else {
            console.log("No models returned in response:", data);
        }

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

listModels();
