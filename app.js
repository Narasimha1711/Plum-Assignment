// app.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { runOCR } = require('./ocr');
const { askGeminiForAppointment } = require('./geminiClient');
const appointmentSchemaJoi = require('./schemas/appointmentJoi');

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const CONF_THRESHOLD = parseFloat(process.env.CONFIDENCE_THRESHOLD || '0.75');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.floor(Math.random() * 10000) + path.extname(file.originalname);
    cb(null, unique);
  }
});
const upload = multer({ storage });

const app = express();
app.use(express.json());
app.use(require('cors')());

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

/**
 * POST /appointments
 * body: multipart/form-data { image: file, timezone: optional }
 */
app.post('/appointments', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'image file required (field name: image)' });

  const filePath = req.file.path;
  try {
    // 1) OCR
    const ocrResult = await runOCR(filePath, process.env.OCR_LANG || 'eng');
    const ocrText = ocrResult.text || '';

    // 2) Call LLM (Gemini) for structured extraction
    // Optionally, pass base64 image for the model as well
    const imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
    const geminiParsed = await askGeminiForAppointment(ocrText, {
      imageBase64,
      timezone: req.body.timezone || null,
      filename: req.file.originalname
    });

    // 3) Validate returned structure and add guardrails
    const { error, value } = appointmentSchemaJoi.validate(geminiParsed, { abortEarly: false, stripUnknown: true });
    let final = value;
    final.raw_validation_error = error ? error.details.map(d => d.message) : null;

    // If the model gave confidence below threshold or flagged ambiguity, require human review.
    if (final.confidence === undefined || final.confidence < CONF_THRESHOLD) {
      final.requires_human_review = true;
      if (!final.ambiguity_flags) final.ambiguity_flags = [];
      final.ambiguity_flags.push('low_model_confidence');
    }

    // If appointment_date or appointment_time missing -> require human review and flag
    if (!final.appointment_date) {
      final.ambiguity_flags.push('missing_date');
      final.requires_human_review = true;
    }
    if (!final.appointment_time) {
      final.ambiguity_flags.push('missing_time');
      final.requires_human_review = true;
    }

    // Attach OCR metadata for audit
    final._ocr = {
      words_count: (ocrResult.words || []).length,
      raw_text_snippet: (ocrText || '').slice(0, 200)
    };

    // Save record (minimal): in production store in DB
    const outputPath = path.join(UPLOAD_DIR, filePath.split(path.sep).pop() + '.json');
    fs.writeFileSync(outputPath, JSON.stringify(final, null, 2));

    // Return structured JSON to caller
    return res.json({ success: true, data: final });
  } catch (err) {
    console.error('Processing error', err);
    return res.status(500).json({ error: 'processing_failed', message: err.message });
  } finally {
    // Optionally: keep uploaded image for audit; if not, delete file here
    // fs.unlinkSync(filePath);
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
