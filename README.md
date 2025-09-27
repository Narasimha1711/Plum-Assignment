AI-Powered Appointment Scheduler Assistant
This is a Node.js-based backend service that processes appointment requests from images using OCR and Gemini AI to extract structured scheduling data. It takes an image with appointment details, extracts text via Tesseract.js, parses it with Google's Gemini API, and returns structured JSON with guardrails for ambiguities.
Features

OCR Processing: Extracts text from images using Tesseract.js.
Entity Extraction: Uses Gemini AI to parse natural language into structured fields (e.g., date, time, department).
Normalization: Converts dates to YYYY-MM-DD, times to HH:MM (24-hour), and standardizes departments (e.g., "dentist" → "Dentistry").
Guardrails: Flags ambiguities and low-confidence outputs for human review.
API Endpoint: Accepts image uploads via multipart/form-data and returns JSON responses.

Architecture
The application follows a modular pipeline:

Image Upload: Handled by Express.js with Multer for file storage.
OCR: Tesseract.js extracts text from the uploaded image, with optional preprocessing using Sharp for improved accuracy.
Entity Extraction: Gemini AI (model: gemini-2.5-flash) processes OCR text to extract structured data based on a JSON schema.
Validation: Joi validates the extracted data against a predefined schema.
Guardrails: Checks for missing fields, low confidence, or ambiguities, setting requires_human_review if needed.
Output: Returns structured JSON and saves it to a file for audit (can be extended to a database).

Tech Stack

Node.js: Backend runtime.
Express.js: Web framework for API.
Multer: Handles file uploads.
Tesseract.js: OCR for text extraction.
Sharp: Image preprocessing for better OCR results.
Google Generative AI: Entity extraction and normalization.
Joi: Schema validation.
dotenv: Environment variable management.

Setup Instructions
Prerequisites

Node.js: v16 or higher.
Tesseract: Ensure Tesseract is installed (tesseract -v in terminal). On macOS: brew install tesseract. On Ubuntu: sudo apt-get install tesseract-ocr.
Google AI API Key: Obtain from Google AI Studio.

Installation

Clone the Repository:
git clone <repository-url>
cd appointment-scheduler


Install Dependencies:
npm install express multer tesseract.js @google/generative-ai dotenv joi cors sharp


Set Up Environment Variables:Create a .env file in the project root:
GEMINI_API_KEY=your_actual_key
PORT=3000
UPLOAD_DIR=./uploads
CONFIDENCE_THRESHOLD=0.75
OCR_LANG=eng


Create Uploads Directory:
mkdir Uploads


Run the Server:
node app.js

The server will start on http://localhost:3000.


Project Structure
appointment-scheduler/
├── Uploads/                # Temporary storage for uploaded images
├── schemas/                # Joi validation schemas
│   └── appointmentJoi.js
├── app.js                  # Main Express server
├── geminiClient.js         # Gemini AI client for entity extraction
├── ocr.js                  # OCR processing with Tesseract.js
├── .env                    # Environment variables
├── package.json
└── README.md

API Usage
Endpoint: /appointments

Method: POST
Content-Type: multipart/form-data
Parameters:
image (file): Image containing appointment details (e.g., PNG, JPEG).
timezone (string, optional): Timezone for date normalization (e.g., UTC).


Response: JSON with structured appointment data.

Example Request (cURL)
curl -X POST \
  -F "image=@path/to/appointment.png" \
  -F "timezone=UTC" \
  http://localhost:3000/appointments

Example Image Content
An image with text:
APPOINTMENT REMINDER
Patient: Jane Smith
Contact: 555-987-6543
Date: October 1, 2025
Time: 2:30 PM
Department: Dermatology
Location: City Central Clinic

Example Response
{
  "success": true,
  "data": {
    "patient_name": "Jane Smith",
    "contact": "555-987-6543",
    "appointment_date": "2025-10-01",
    "appointment_time": "14:30",
    "department": "Dermatology",
    "location": "City Central Clinic",
    "original_text": "APPOINTMENT REMINDER\nPatient: Jane Smith\nContact: 555-987-6543\nDate: October 1, 2025\nTime: 2:30 PM\nDepartment: Dermatology\nLocation: City Central Clinic",
    "ambiguity_flags": [],
    "confidence": 0.95,
    "requires_human_review": false,
    "_ocr": {
      "words_count": 24,
      "raw_text_snippet": "APPOINTMENT REMINDER\nPatient: Jane Smith\nContact: 555-987-6543\n..."
    }
  }
}

Error Response (e.g., OCR Failure)
{
  "error": "ocr_failed",
  "message": "No text extracted from image. Ensure the image contains clear, readable text.",
  "_ocr": {
    "words_count": 0,
    "raw_text_snippet": ""
  }
}

Health Check

Endpoint: GET /health
Response:{ "ok": true }



Debugging Tips

OCR Issues:
Ensure images have clear, high-contrast text.
Check Uploads/*.json for extracted data and logs for OCR Full Result.
Test OCR independently:const { runOCR } = require('./ocr');
async function testOCR() {
  const result = await runOCR('path/to/image.png', 'eng');
  console.log(result);
}
testOCR();




Gemini Issues:
Verify GEMINI_API_KEY is valid.
Check logs for Gemini Raw Response.


Image Preprocessing: The sharp library enhances OCR accuracy by adjusting resolution and contrast.

Production Considerations

File Cleanup: Enable fs.unlinkSync(filePath) in app.js to delete uploaded images after processing.
Database: Replace file-based storage (Uploads/*.json) with a database (e.g., MongoDB).
Security: Add JWT authentication to secure the /appointments endpoint.
Rate Limits: Handle Gemini API rate limits with retry logic.
Logging: Use a logging library (e.g., Winston) for production logs.

Troubleshooting

Empty OCR Output: Ensure images are clear and text is readable. Adjust OCR_LANG if needed (e.g., hin for Hindi).
Gemini Errors: Check GEMINI_API_KEY and ensure the gemini-2.5-flash model is available in your region.
Same Response: Verify different images are uploaded and check Uploads/ for processed JSON files.

License
MIT License. See LICENSE for details.
