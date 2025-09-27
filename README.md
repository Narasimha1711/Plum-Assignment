# AI-Powered Appointment Scheduler Assistant

A **Node.js backend service** that processes appointment requests from images using OCR and Google's Gemini AI to extract structured scheduling data. It converts natural language or document-based appointment details into JSON format with robust guardrails for ambiguity handling.

---

## Table of Contents

- [Features](#features)  
- [Architecture](#architecture)  
- [Tech Stack](#tech-stack)  
- [Setup Instructions](#setup-instructions)  
- [Project Structure](#project-structure)  
- [API Usage](#api-usage)  
- [Debugging Tips](#debugging-tips)  
- [Production Considerations](#production-considerations)  
- [Troubleshooting](#troubleshooting)  
- [License](#license)  

---

## Features

- **OCR Processing**: Extracts text from images using Tesseract.js.  
- **Entity Extraction**: Uses Gemini AI (`gemini-2.5-flash`) to parse text into structured fields like date, time, and department.  
- **Normalization**:  
  - Dates formatted as `YYYY-MM-DD` (e.g., "tomorrow" → "2025-09-28").  
  - Times converted to 24-hour `HH:MM` format (e.g., "2 PM" → "14:00").  
  - Departments standardized (e.g., "dentist" → "Dentistry").  
- **Guardrails**: Flags missing or ambiguous fields, marking low-confidence outputs for human review.  
- **API Endpoint**: Accepts image uploads via `multipart/form-data` and returns structured JSON responses.  

---

## Architecture

The backend follows a modular pipeline:

1. **Image Upload**: Express.js with Multer handles secure file storage.  
2. **OCR**: Tesseract.js extracts text, enhanced by Sharp for preprocessing (resize, grayscale, normalize).  
3. **Entity Extraction**: Gemini AI converts OCR text into structured JSON.  
4. **Validation**: Joi ensures extracted data follows the schema.  
5. **Guardrails**: Flags low-confidence or missing fields (`requires_human_review`).  
6. **Output**: Returns JSON response and saves to file for audit (can be extended to a database).  

---

## Tech Stack

- **Node.js**: Backend runtime (v16+)  
- **Express.js**: Web framework for APIs  
- **Multer**: File uploads  
- **Tesseract.js**: OCR processing  
- **Sharp**: Image preprocessing  
- **Google Generative AI**: Entity extraction & normalization  
- **Joi**: JSON validation  
- **dotenv**: Environment variables  
- **CORS**: Cross-origin requests  

---

## Setup Instructions

### Prerequisites

- **Node.js**: v16+  
- **Tesseract OCR**:  
  ```bash
  # macOS
  brew install tesseract

  # Ubuntu
  sudo apt-get install tesseract-ocr

  # Verify installation
  tesseract -v

  ---

## API Reference

#### Book Appointment

```http
  POST /appointments
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `image` | `string` | **Required**. Your API key |



## Run Locally

Clone the project

```bash
  git clone https://github.com/<your-username>/appointment-scheduler.git

```

Go to the project directory

```bash
  cd appointment-scheduler
```

Install dependencies

```bash
  npm install
```

Set Up Environment Variables
```bash
    GEMINI_API_KEY=your_actual_key
    PORT=3000
    UPLOAD_DIR=./Uploads
    CONFIDENCE_THRESHOLD=0.75
    OCR_LANG=eng
```

Start the server

```bash
  node server.js
```



