# Pitch Agent: AI-Generated Pitch Presentation Setup Guide

This guide provides a step-by-step walkthrough to set up and run the AI-powered Pitch Deck Generator. It covers both the backend (Python Flask) and the frontend (React).

## 1. Project Initialization and Structure

The project was initialized with the following structure:

```
.
├── .env                  # Environment variables (e.g., API keys)
├── app.py                # Backend Flask application
├── package.json          # Frontend Node.js dependencies
├── public/               # Frontend public assets
│   └── index.html        # Main HTML file for the React app
├── ppt_generator.py      # Python script for PowerPoint generation
├── README.md             # Project overview and main documentation
├── requirements.txt      # Backend Python dependencies
└── src/                  # Frontend source code
    └── App.js            # Main React application component
    └── index.js          # React entry point
```

## 2. Backend Setup

The backend is built with Python Flask and uses the Google Gemini API for content generation and `python-pptx` for PowerPoint generation.

### 2.1. Create and Activate Virtual Environment

It's highly recommended to use a virtual environment to manage Python dependencies.

1.  **Create the virtual environment:**
    ```bash
    python -m venv venv
    ```

2.  **Activate the virtual environment:**
    *   **On Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
    *   **On macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```

### 2.2. Install Backend Dependencies

With the virtual environment activated, install the required Python packages:

```bash
pip install -r requirements.txt
```

The `requirements.txt` file contains:
```
flask==2.3.2
flask-cors==4.0.0
python-dotenv==1.0.1
google-generativeai==0.3.0
python-pptx==0.6.21
requests==2.31.0
```

### 2.3. Configure Environment Variables

Create a `.env` file in the root directory of your project (if it doesn't already exist) and add your Google Gemini API key:

```
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```
**Important:** Replace `"YOUR_GEMINI_API_KEY"` with your actual API key.

## 3. Frontend Setup

The frontend is a React application.

### 3.1. Install Frontend Dependencies

Navigate to the project root directory and install the Node.js dependencies using npm:

```bash
npm install
```

This command reads the `package.json` file and installs all listed dependencies, including Material-UI for the UI components.

## 4. Running the Application

### 4.1. Start the Backend Server

With your virtual environment activated, run the Flask application:

```bash
python app.py
```
The backend server will typically run on `http://127.0.0.1:5000`.

### 4.2. Start the Frontend Development Server

In a new terminal (keep the backend server running), navigate to the project root and start the React development server:

```bash
npm start
```
This will usually open the application in your browser at `http://localhost:3000`.

## 5. File Descriptions

### `app.py` (Backend)
This is the main Flask application file. It handles:
- **API Endpoints:** Defines endpoints for generating full pitch decks (`/api/generate-full-deck`), regenerating individual slides (`/api/generate-slide`), and generating PowerPoint files (`/api/generate-ppt`).
- **Google Gemini Integration:** Communicates with the Google Gemini API to generate slide content based on user input.
- **Error Handling:** Manages API errors and ensures proper responses.
- **CORS:** Configured to allow cross-origin requests from the frontend.

### `ppt_generator.py` (Backend Utility)
This file contains the `generate_ppt` function responsible for creating a PowerPoint presentation (`.pptx`) from the generated pitch deck data. It uses the `python-pptx` library to programmatically create slides, add titles and content, and apply basic styling.

### `src/App.js` (Frontend)
This is the main React component for the user interface. It handles:
- **User Input Form:** Collects startup details from the user.
- **API Calls:** Sends user data to the backend to generate the pitch deck and PowerPoint.
- **State Management:** Manages the application state, including form data, generated deck content, loading states, and error messages.
- **Slide Display:** Renders the generated pitch deck content in a structured format.
- **JSON Export:** Provides functionality to export the generated deck as a JSON file.
- **PowerPoint Download:** Triggers the download of the generated PowerPoint file from the backend.
- **Dynamic Slide Regeneration:** Allows users to regenerate individual slides.

### `src/index.js` (Frontend Entry Point)
This file is the entry point for the React application. It:
- Renders the `App` component into the `root` element of `public/index.html`.
- **Material-UI Theme:** Configures and applies the global Material-UI theme, defining the color palette, typography, and component styles for a modern and consistent look.

### `public/index.html` (Frontend HTML)
The base HTML file for the React application. It's a simple HTML page that serves as the canvas for the React app. The React components are "mounted" into the `<div id="root"></div>` element within this file.

### `.env` (Environment Variables)
Stores sensitive information like API keys, keeping them separate from the codebase and preventing them from being committed to version control.

### `requirements.txt` (Backend Dependencies)
Lists all the Python packages required for the backend, allowing for easy installation via `pip install -r requirements.txt`.

### `package.json` (Frontend Dependencies and Scripts)
Defines metadata for the frontend project and lists all Node.js (npm) dependencies. It also contains scripts for starting the development server (`npm start`), building the production bundle, etc.

## 6. Frontend Design Notes

The frontend design in `src/App.js` and `src/index.js` has been updated to be modern, futuristic, and minimalistic.
- **Dark Mode:** A dark color palette is used with vibrant primary and secondary accents.
- **Typography:** Uses "Montserrat" as the primary font for a clean, modern feel.
- **Component Styling:** Custom styles have been applied to buttons, text fields, and other Material-UI components to give them a sleek, rounded, and elevated appearance with subtle hover effects.
- **Animations:** A subtle `fadeIn` animation is applied to the input form to enhance the user experience.

--- 