# Pitch Agent: Architecture Overview

This document details the architectural design of the AI Pitch Deck Generator, explaining the frameworks used, the interaction between different components, and the flow of data.

## 1. System Architecture

The Pitch Agent operates on a client-server architecture:
- **Frontend (Client):** A React application built with Material-UI, running in the user's web browser. It provides the user interface for input, display, and interaction.
- **Backend (Server):** A Flask application running on a Python server. It handles API requests, interacts with the Google Gemini API for AI-powered content generation, and uses `python-pptx` to create PowerPoint presentations.

```mermaid
graph TD
    A[User Browser] -->|HTTP/HTTPS| B(Frontend: React/Material-UI)
    B -->|API Calls (JSON)| C(Backend: Flask App)
    C -->|Gemini API Request (HTTP)| D[Google Gemini API]
    D -->|AI-Generated Content (JSON)| C
    C -->|PowerPoint Generation| E(ppt_generator.py)
    E -->|PPT File Stream| C
    C -->|Generated Data (JSON)/PPT File (Binary)| B
    B -->|Display/Download| A
```

## 2. Frameworks and Technologies

### 2.1. Frontend
- **React:** A JavaScript library for building user interfaces. It allows for the creation of reusable UI components and efficient rendering of dynamic data.
- **Material-UI (MUI):** A popular React UI framework that implements Google's Material Design. It provides pre-built, customizable UI components that ensure a consistent and modern look and feel.
- **CSS Baseline & ThemeProvider:** Used to apply global CSS resets and manage a custom Material-UI theme across the application, enabling a consistent, dark, and futuristic design.

### 2.2. Backend
- **Flask:** A lightweight Python web framework. It's used to build the RESTful API endpoints that the frontend consumes.
- **Google Generative AI (via `requests`):** Although an official Google library exists, direct HTTP `requests` are used to interact with the Google Gemini API (specifically `gemini-pro-flash` model) for generating text-based content for the pitch deck slides.
- **`python-pptx`:** A Python library for creating and updating PowerPoint (.pptx) files. It enables programmatic generation of slides, adding text, and basic formatting, which is crucial for the PowerPoint export feature.
- **`flask-cors`:** A Flask extension to handle Cross-Origin Resource Sharing (CORS), allowing the frontend (running on a different port/origin) to communicate with the backend.
- **`python-dotenv`:** Used to load environment variables from a `.env` file, ensuring sensitive information like API keys are kept out of the codebase.

## 3. Data Flow and Interaction

### 3.1. Initial Pitch Deck Generation
1.  **User Input (Frontend):** The user fills out a form in `src/App.js` with details about their startup (startup name, problem, solution, etc.).
2.  **Form Submission (Frontend to Backend):** When the user clicks "Generate Pitch Deck", the `formData` (JSON object) is sent via a `POST` request to the backend's `/api/generate-full-deck` endpoint.
3.  **Content Generation (Backend):**
    *   `app.py` receives the `formData`.
    *   It constructs a comprehensive prompt using the input data.
    *   It sends this prompt to the Google Gemini API (`gemini-pro-flash` model) via `requests`.
    *   The Gemini API processes the prompt and returns structured JSON content for all 10 pitch deck slides (Cover, Problem, Solution, etc.).
4.  **Response to Frontend:** The backend sends the generated pitch deck `deck` (JSON object) back to the frontend.
5.  **Display (Frontend):** `src/App.js` receives the `deck` data, updates its state, and renders the content of each slide using `ReactMarkdown` for rich text display.

### 3.2. Individual Slide Regeneration
1.  **User Action (Frontend):** The user clicks "Regenerate" next to a specific slide section.
2.  **API Call (Frontend to Backend):** `src/App.js` sends a `POST` request to the `/api/generate-slide` endpoint, providing the `section` to regenerate and the current `formData` as context.
3.  **Regeneration (Backend):**
    *   `app.py` receives the request.
    *   It generates a specific prompt for the requested slide section using the provided context.
    *   It calls the Google Gemini API.
    *   The API returns updated content for that single slide.
4.  **Update Display (Frontend):** The backend sends the new slide content back. `src/App.js` updates only the specific slide's content in the `deck` state and re-renders that section.

### 3.3. JSON Export
1.  **User Action (Frontend):** The user clicks "Export JSON".
2.  **Client-Side Processing:** `src/App.js` takes the current `deck` state (a JSON object) and converts it into a human-readable JSON string using `JSON.stringify(deck, null, 2)`.
3.  **Display/Copy:** The JSON string is displayed in a Material-UI Dialog, and a button allows the user to copy it to their clipboard.

### 3.4. PowerPoint (PPTX) Download
1.  **User Action (Frontend):** The user clicks "Download PowerPoint".
2.  **API Call (Frontend to Backend):** `src/App.js` sends a `POST` request to the backend's `/api/generate-ppt` endpoint. Importantly, it sends both the original `formData` (for startup name, etc.) and the generated `deck` content.
3.  **PPT Generation (Backend):**
    *   `app.py` receives the `formData` and `deck`.
    *   It passes this data to the `generate_ppt` function in `ppt_generator.py`.
    *   `ppt_generator.py` uses `python-pptx` to create a new PowerPoint presentation, populating slides with titles and content from the `deck`.
    *   The generated PowerPoint file is saved to an in-memory byte stream.
4.  **File Download (Backend to Frontend):** The backend sends the in-memory PPTX file as a binary stream (with appropriate `Content-Type` headers) back to the frontend.
5.  **Client-Side Download:** `src/App.js` receives the binary blob, creates a temporary URL for it, and triggers a programmatic download using a hidden anchor tag. The file is named using the startup name.

## 4. User Interface (UI) and User Experience (UX)

The frontend is designed for a clean, intuitive, and engaging user experience:
- **Input Form:** A clear, vertical layout for all input fields, making it easy for users to provide information.
- **Loading States:** Visual indicators (e.g., `CircularProgress`) are provided during API calls to inform the user that content is being generated or regenerated.
- **Feedback System:** `Snackbar` components provide non-intrusive feedback (success, error, info messages) for user actions.
- **Slide-by-Slide Review:** After generation, each slide's content is presented in distinct, scrollable sections, allowing users to review and regenerate individual parts.
- **Export Options:** Clear buttons for JSON export and PowerPoint download are readily available.
- **Modern Aesthetic:** The custom Material-UI theme ensures a consistent dark mode, vibrant accents, and subtle animations, creating a contemporary and appealing visual design.

--- 