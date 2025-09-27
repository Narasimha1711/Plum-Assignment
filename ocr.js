// ocr.js
const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");

/**
 * Run OCR on an uploaded image file
 * @param {string} filePath - local path of uploaded file
 * @returns {Promise<string>} extracted text
 */
async function runOCR(filePath) {
  try {
    if (!filePath) {
      throw new Error("No file path provided for OCR");
    }

    console.log("🔍 Running OCR on:", filePath);

    // Run OCR using tesseract.js
    const { data: { text } } = await Tesseract.recognize(
      filePath,
      "eng", // Language: English
      {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`📖 Progress: ${Math.round(m.progress * 100)}%`);
          }
        }
      }
    );

    console.log("✅ OCR extraction done.");
    return text.trim();
  } catch (err) {
    console.error("❌ OCR Error:", err);
    throw err;
  }
}

module.exports = { runOCR };
