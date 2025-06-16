import streamlit as st
import requests
import json
import base64
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Flask API URL from environment variable or use a default
FLASK_API_BASE_URL = os.getenv('FLASK_API_URL', 'https://ai-pitch-deck.onrender.com')

# Configure Streamlit page
st.set_page_config(
    page_title="AI Pitch Deck Generator",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Add custom CSS for better styling
st.markdown("""
    <style>
    .stButton>button {
        width: 100%;
        margin-top: 10px;
    }
    .stTextArea>div>div>textarea {
        font-size: 16px;
    }
    </style>
    """, unsafe_allow_html=True)

st.title("AI Pitch Deck Generator (Streamlit Interface)")

st.markdown("### Enter Startup Details")

with st.form("pitch_deck_form"):
    startup_name = st.text_input("Startup Name *")
    problem = st.text_area("Problem *", height=100)
    solution = st.text_area("Solution *", height=100)
    target_audience = st.text_input("Target Audience")
    industry = st.text_input("Industry")
    revenue_model = st.text_input("Revenue Model")
    stage = st.text_input("Stage of Startup (e.g., Seed, Series A)")
    team = st.text_area("Team (brief description of key members)", height=80)
    vision = st.text_area("Vision / Long-term Goal", height=80)
    usp = st.text_area("Unique Selling Proposition (USP)", height=80)
    competition = st.text_area("Competition (who are they, what do they do?)", height=80)

    submitted = st.form_submit_button("Generate Pitch Deck")

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

    if submitted:
        if not startup_name or not problem or not solution:
            st.error("Please fill in Startup Name, Problem, and Solution.")
        else:
            with st.spinner("Generating pitch deck..."):
                try:
                    # Add timeout to prevent hanging
                    response = requests.post(
                        f"{FLASK_API_BASE_URL}/api/generate-full-deck",
                        json=form_data,
                        timeout=30
                    )
                    response.raise_for_status()
                    deck_data = response.json()
                    st.session_state['deck'] = deck_data
                    st.success("Pitch deck generated successfully!")
                except requests.exceptions.ConnectionError:
                    st.error(f"Could not connect to the backend server at {FLASK_API_BASE_URL}. Please ensure the Flask backend is running.")
                except requests.exceptions.Timeout:
                    st.error("Request timed out. The server took too long to respond.")
                except requests.exceptions.RequestException as e:
                    st.error(f"Error generating pitch deck: {str(e)}")
                except json.JSONDecodeError:
                    st.error("Failed to parse response from backend. Please check the server logs.")
                except Exception as e:
                    st.error(f"An unexpected error occurred: {str(e)}")

if 'deck' in st.session_state and st.session_state['deck']:
    st.markdown("---विकास")
    st.subheader("Generated Pitch Deck Content")
    deck = st.session_state['deck']

    SLIDE_SECTIONS = [
        {'key': 'cover', 'label': 'Cover Slide'},
        {'key': 'problem', 'label': 'Problem'},
        {'key': 'solution', 'label': 'Solution'},
        {'key': 'market', 'label': 'Market Size'},
        {'key': 'product', 'label': 'Product/Technology Overview'},
        {'key': 'business_model', 'label': 'Business Model'},
        {'key': 'competition', 'label': 'Competitive Advantage'},
        {'key': 'team', 'label': 'Team'},
        {'key': 'traction', 'label': 'Traction / Milestones'},
        {'key': 'funding_needs', 'label': 'Ask'},
    ]

    for section in SLIDE_SECTIONS:
        st.markdown(f"### {section['label']}")
        st.markdown(deck.get(section['key'], 'No content generated for this section yet.'))
        
        if st.button(f"Regenerate {section['label']}", key=f"regen_{section['key']}"):
            with st.spinner(f"Regenerating {section['label']}..."):
                try:
                    response = requests.post(f"{FLASK_API_BASE_URL}/api/generate-slide", json={
                        "section": section['key'],
                        "context": form_data
                    })
                    response.raise_for_status()
                    data = response.json()
                    deck[section['key']] = data.get('content', 'No content generated.')
                    st.session_state['deck'] = deck # Update session state to force re-render
                    st.success(f"{section['label']} regenerated successfully!")
                except requests.exceptions.RequestException as e:
                    st.error(f"Error regenerating {section['label']} slide: {e}")
                except json.JSONDecodeError:
                    st.error("Failed to parse JSON response during regeneration.")
                except Exception as e:
                    st.error(f"An unexpected error occurred during regeneration: {e}")
        st.markdown("---")

    st.subheader("Export Options")
    
    # New structure for JSON export
    export_slides = []
    for section_info in SLIDE_SECTIONS:
        key = section_info['key']
        label = section_info['label']
        content = deck.get(key, 'No content generated for this section yet.')
        export_slides.append({
            'slide_title': label,
            'slide_content': content
        })

    json_export = json.dumps(export_slides, indent=2)
    st.download_button(
        label="Download JSON",
        data=json_export,
        file_name=f"{form_data['startup_name'].replace(' ', '_')}_pitch_deck.json",
        mime="application/json",
        help="Download the generated pitch deck as a JSON file."
    )

    # Download PowerPoint
    if st.button("Download PowerPoint"):
        if not form_data['startup_name']:
            st.warning("Please provide a Startup Name to generate the PowerPoint.")
        else:
            with st.spinner("Generating PowerPoint..."):
                try:
                    ppt_response = requests.post(
                        f"{FLASK_API_BASE_URL}/api/generate-ppt",
                        json={
                            "formData": form_data,
                            "deck": deck
                        },
                        timeout=60  # Longer timeout for PPT generation
                    )
                    ppt_response.raise_for_status()
                    
                    if ppt_response.headers.get('content-type') == 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                        ppt_bytes = ppt_response.content
                        st.download_button(
                            label="Click here to download PPTX",
                            data=ppt_bytes,
                            file_name=f"{form_data['startup_name'].replace(' ', '_')}_pitch_deck.pptx",
                            mime="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                            key="download_ppt_button",
                            help="Download the generated pitch deck as a PowerPoint file."
                        )
                        st.success("PowerPoint generated successfully!")
                    else:
                        st.error("Received invalid response format from server.")
                except requests.exceptions.ConnectionError:
                    st.error(f"Could not connect to the backend server at {FLASK_API_BASE_URL}. Please ensure the Flask backend is running.")
                except requests.exceptions.Timeout:
                    st.error("Request timed out. The server took too long to generate the PowerPoint.")
                except requests.exceptions.RequestException as e:
                    st.error(f"Error generating PowerPoint: {str(e)}")
                except Exception as e:
                    st.error(f"An unexpected error occurred during PowerPoint generation: {str(e)}")

    # Back to Input Form
    if st.button("Back to Input Form"):
        st.session_state['deck'] = None # Clear the deck to show the input form
        st.experimental_rerun() 