# AI Pitch Deck Generator

An AI-powered application that generates professional pitch decks for startups using the Gemini API. The application allows users to input their startup information and generates a complete pitch deck with the ability to regenerate individual slides.

## Features

- Generate complete pitch decks with AI
- Regenerate individual slides
- Modern, responsive UI
- Real-time slide preview
- Markdown support for rich text formatting

## Tech Stack

- Backend: Python (Flask)
- Frontend: React with Material-UI
- AI: Google Gemini API
- Styling: Material-UI with custom theme

## Setup

1. Clone the repository
2. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   FLASK_ENV=development
   FLASK_APP=app.py
   ```

## Running the Application

1. Start the backend server:
   ```bash
   python app.py
   ```
2. In a separate terminal, start the frontend development server:
   ```bash
   npm start
   ```
3. Open http://localhost:3000 in your browser

## Usage

1. Fill in the required fields in the input form:
   - Problem
   - Solution
   - Target Audience
   - Industry
   - Revenue Model
   - Stage
   (Optional fields: Team, Vision, USP, Competition)

2. Click "Generate Pitch Deck" to create your pitch deck

3. Review the generated slides

4. Use the "Regenerate" button on any slide to generate new content for that specific section

5. Click "Back to Input Form" to make changes to your input data

## API Endpoints

- `POST /api/generate-full-deck`: Generate a complete pitch deck
- `POST /api/generate-slide`: Regenerate a specific slide

## License

MIT

## Deployment

### 1. Deploying to GitHub

To deploy your project to GitHub, follow these steps:

1.  **Initialize a Git repository (if you haven't already):**
    ```bash
    git init
    ```

2.  **Add your files to the repository:**
    ```bash
    git add .
    ```

3.  **Commit your changes:**
    ```bash
    git commit -m "Initial commit: AI Pitch Deck Generator"
    ```

4.  **Create a new repository on GitHub:** Go to [GitHub](https://github.com/) and create a new empty repository. Do NOT initialize it with a README, .gitignore, or license.

5.  **Add the remote origin:** Replace `YOUR_GITHUB_USERNAME` and `YOUR_REPOSITORY_NAME` with your actual GitHub username and repository name.
    ```bash
    git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
    ```

6.  **Push your code to GitHub:**
    ```bash
    git push -u origin master
    ```

Your project is now on GitHub! You can share the repository link with others.

### 2. Deploying to Streamlit

For Streamlit deployment, both your frontend and backend need to be accessible. A common approach is to deploy the Flask backend separately (e.g., on Heroku, Render, or a VPS) and then have the Streamlit app (which runs Python) act as a client to your Flask API. Streamlit itself is primarily for Python applications.

**Note:** Direct deployment of a React app within a Streamlit application is not straightforward, as Streamlit is designed for Python-based web applications. You would typically use Streamlit for a Python-only application or as a frontend for a Python backend. Given this project's structure (React frontend, Flask backend), deploying the React part directly to Streamlit is not feasible. If you intend to use Streamlit, you would primarily use it to host a Python script that interacts with your Flask backend and perhaps renders some basic output.

**Recommended approach for this project with Streamlit:**

1.  **Deploy your Flask Backend:** Deploy `app.py` (and `ppt_generator.py`) to a platform that can host Python web applications (e.g., Heroku, Render, AWS EC2, Google Cloud Run). Once deployed, you will get a public URL for your Flask API.

2.  **Create a Streamlit Application (e.g., `streamlit_app.py`):**
    *   This Python script will use the `requests` library to call your deployed Flask API.
    *   It will present a simplified input form (using Streamlit widgets) and display the generated pitch deck content.
    *   It will also handle the download of the PowerPoint file by making a request to your Flask API and serving the received file.

    Here's a conceptual example of `streamlit_app.py`:

    ```python
    import streamlit as st
    import requests
    import json
    import base64

    # Replace with your deployed Flask API URL
    FLASK_API_BASE_URL = "YOUR_DEPLOYED_FLASK_API_URL"

    st.set_page_config(layout="wide")

    st.title("AI Pitch Deck Generator (Streamlit Interface)")

    with st.expander("Enter Startup Details"):
        startup_name = st.text_input("Startup Name", key="st_startup_name")
        problem = st.text_area("Problem", key="st_problem")
        solution = st.text_area("Solution", key="st_solution")
        target_audience = st.text_input("Target Audience", key="st_target_audience")
        industry = st.text_input("Industry", key="st_industry")
        revenue_model = st.text_input("Revenue Model", key="st_revenue_model")
        stage = st.text_input("Stage", key="st_stage")
        team = st.text_area("Team", help="Brief description of key members", key="st_team")
        vision = st.text_area("Vision / Long-term Goal", key="st_vision")
        usp = st.text_area("Unique Selling Proposition (USP)", key="st_usp")
        competition = st.text_area("Competition", help="Who are they, what do they do?", key="st_competition")

    form_data = {
        "startup_name": startup_name,
        "problem": problem,
        "solution": solution,
        "target_audience": target_audience,
        "industry": industry,
        "revenue_model": revenue_model,
        "stage": stage,
        "team": team,
        "vision": vision,
        "USP": usp,
        "competition": competition,
    }

    if st.button("Generate Pitch Deck (via Flask Backend)"):
        if not startup_name or not problem or not solution:
            st.error("Please fill in Startup Name, Problem, and Solution.")
        else:
            with st.spinner("Generating pitch deck..."):
                try:
                    response = requests.post(f"{FLASK_API_BASE_URL}/generate-full-deck", json=form_data)
                    response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
                    deck_data = response.json()
                    st.session_state['deck'] = deck_data
                    st.success("Pitch deck generated successfully!")
                except requests.exceptions.RequestException as e:
                    st.error(f"Error generating pitch deck: {e}")

    if 'deck' in st.session_state and st.session_state['deck']:
        st.subheader("Generated Pitch Deck Content")
        deck = st.session_state['deck']

        for section_key, section_label in [
            ('cover', 'Cover Slide'),
            ('problem', 'Problem'),
            ('solution', 'Solution'),
            ('market', 'Market Size'),
            ('product', 'Product/Technology Overview'),
            ('business_model', 'Business Model'),
            ('competition', 'Competitive Advantage'),
            ('team', 'Team'),
            ('traction', 'Traction / Milestones'),
            ('funding_needs', 'Ask'),
        ]:
            st.markdown(f"### {section_label}")
            st.markdown(deck.get(section_key, 'No content generated.'))

        st.markdown("---विकास")
        st.subheader("Export Options")
        
        # Download JSON
        json_export = json.dumps(deck, indent=2)
        st.download_button(
            label="Download JSON",
            data=json_export,
            file_name=f"{startup_name.replace(' ', '_')}_pitch_deck.json",
            mime="application/json",
            help="Download the generated pitch deck as a JSON file."
        )

        # Download PowerPoint
        if st.button("Download PowerPoint (via Flask Backend)"):
            with st.spinner("Generating PowerPoint..."):
                try:
                    ppt_response = requests.post(f"{FLASK_API_BASE_URL}/generate-ppt", json={"formData": form_data, "deck": deck})
                    ppt_response.raise_for_status()
                    
                    # Streamlit's download_button expects bytes for files
                    ppt_bytes = ppt_response.content
                    st.download_button(
                        label="Click to Download PPTX",
                        data=ppt_bytes,
                        file_name=f"{startup_name.replace(' ', '_')}_pitch_deck.pptx",
                        mime="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                        key="download_ppt_button",
                        help="Download the generated pitch deck as a PowerPoint file."
                    )
                    st.success("PowerPoint generated successfully!")
                except requests.exceptions.RequestException as e:
                    st.error(f"Error generating PowerPoint: {e}")
    ```

3.  **Deploy your Streamlit app:** Once you have `streamlit_app.py` (and any necessary `requirements.txt` for Streamlit-specific dependencies like `streamlit` and `requests`), you can deploy it to Streamlit Cloud directly from your GitHub repository.
    *   Push your `streamlit_app.py` and its `requirements.txt` to your GitHub repository.
    *   Go to [Streamlit Cloud](https://share.streamlit.io/) and connect your GitHub repository to deploy the app.

This approach ensures that your React frontend remains independent for its optimal user experience, while providing a separate, functional Streamlit interface for those who prefer or require a Python-centric deployment or a simplified interaction with the backend. 