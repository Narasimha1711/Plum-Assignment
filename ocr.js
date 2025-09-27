// ocr.js

const { createWorker } = require('tesseract.js');

/**
 * Run OCR on an image file
 * @param {string} filePath - Path to the image
 * @param {string} lang - Language code (e.g., 'eng')
 * @returns {Promise<Object>} - { text, words }
 */
async function runOCR(filePath, lang = 'eng') {
  try {
    const worker = await createWorker(lang);
    const { data } = await worker.recognize(filePath);
    await worker.terminate();
    return {
      text: data.text || '',
      words: data.words || [],
    };
  } catch (err) {
    console.error("OCR Error:", err);
    throw new Error(`OCR processing failed: ${err.message}`);
  }
}

module.exports = { runOCR };