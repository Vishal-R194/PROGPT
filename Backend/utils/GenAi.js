
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const models = [
    process.env.GEMINI_MODEL || "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.6-flash",
];

const wait = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

const getGeminiAPIResponse = async (message) => {
    let lastError;

    for (const model of [...new Set(models)]) {
        for (let attempt = 1; attempt <= 2; attempt++) {
            try {
                console.log(`Trying Gemini model: ${model}`);

                const response = await ai.models.generateContent({
                    model,
                    contents: message,
                });

                if (!response.text) {
                    throw new Error("Gemini returned an empty response");
                }

                return response.text;
            } catch (err) {
                lastError = err;

                console.error(
                    `Model ${model}, attempt ${attempt}:`,
                    err.status,
                    err.message
                );

                // Try another model for temporary availability errors.
                if (![429, 500, 502, 503, 504].includes(err.status)) {
                    throw err;
                }

                if (attempt < 2) {
                    await wait(1000 * attempt);
                }
            }
        }
    }

    throw lastError;
};

export default getGeminiAPIResponse;
