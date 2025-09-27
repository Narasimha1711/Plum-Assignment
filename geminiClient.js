// geminiClient.js - Fixed to use correct GoogleGenerativeAI API structure

require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Initialize Gemini client
 */
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY not set. Gemini requests will fail.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * askGeminiForAppointment
 * Extract structured appointment data from OCR text
 *
 * @param {string} ocrText - text extracted from image
 * @returns {Promise<Object>} structured JSON
 */
async function askGeminiForAppointment(ocrText) {
  const responseSchema = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {
      "patient_name": { "type": ["string", "null"] },
      "contact": { "type": ["string", "null"] },
      "appointment_date": { "type": ["string", "null"] },
      "appointment_time": { "type": ["string", "null"] },
      "department": { "type": ["string", "null"] },
      "location": { "type": ["string", "null"] },
      "original_text": { "type": "string" },
      "ambiguity_flags": { "type": "array", "items": { "type": "string" } },
      "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
      "requires_human_review": { "type": "boolean" }
    },
    "required": ["original_text", "ambiguity_flags", "confidence", "requires_human_review"]
  };

  const prompt = `
Extract structured appointment data from the OCR text below.
Return ONLY valid JSON matching this schema (no explanations, no extra text).
- Normalize appointment_date to YYYY-MM-DD format (current date is ${new Date().toISOString().split('T')[0]} for relative dates like "tomorrow").
- Normalize appointment_time to 24-hour HH:MM format.
- Standardize department (e.g., "dentist" -> "Dentistry", "skin doctor" -> "Dermatology").
- If ambiguous, unclear, or missing, set field to null and explain in ambiguity_flags.

OCR Text:
${ocrText}

Response Schema:
${JSON.stringify(responseSchema, null, 2)}
`;

console.log("this", ocrText);

  try {
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Call generateContent on the model instance
    const result = await model.generateContent({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0, // Low temperature for deterministic output
        // maxOutputTokens: 1000, // Uncomment if you need to limit output size
      }
    });

    // Extract raw text output
    let text = result.response.text();

    // Clean up if wrapped in code blocks
    if (text.startsWith('```json') && text.endsWith('```')) {
      text = text.slice(7, -3).trim();
    }

    // Parse into JSON safely
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("❌ Could not parse JSON:", text);
      throw new Error(`Failed to parse Gemini response: ${e.message}`);
    }

    return parsed;
  } catch (err) {
    console.error("Gemini error:", err);
    throw err;
  }
}

module.exports = { askGeminiForAppointment };