# Logistics QR Tracking System (MVP)

An internal logistics management platform to track package handovers through QR codes and mobile geolocations.

## Tech Stack

- **Backend:** FastAPI, SQLite (Dev), SQLAlchemy, Pydantic, Pillow, QRCode
- **Frontend (Handler Portal):** React, Vite, TypeScript, TailwindCSS, React Query, React Hook Form, Chart.js
- **QR Scan Page:** Lightweight HTML5 + Vanilla JS, Geolocation API, Media Capture

## Setup Instructions

### Backend Setup

1. Open PowerShell and navigate to the backend directory:
   ```powershell
   cd backend
   ```
2. Activate the virtual environment (if not already active):
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
3. Install requirements (already installed in the supplied environment):
   ```powershell
   pip install -r requirements.txt
   ```
4. Start the FastAPI server:
   ```powershell
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Open a new PowerShell window and navigate to the frontend directory:
   ```powershell
   cd frontend
   ```
2. Start the Vite development server:
   ```powershell
   npm run dev
   ```
3. Open `http://localhost:5173` in your browser.

## Using the System

1. **Login:** Use `admin` / `admin123` to log in to the portal.
2. **Dashboard:** View statistics on packages created, scanned, and active.
3. **Shipments:** Create new shipments and print/download the generated QR code.
4. **Scan:** Open the QR code scan URL on a mobile device (or mock it in desktop Chrome using Sensors) to record a handling event with location, package photo, and selfie.
