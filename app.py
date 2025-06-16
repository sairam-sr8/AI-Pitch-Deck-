from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import requests
import json
import os
from dotenv import load_dotenv
from ppt_generator import generate_ppt

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set. Please set it in your .env file or environment variables.")
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

# Define slide sections in order
SLIDE_SECTIONS = [
    'cover',
    'problem',
    'solution',
    'market',
    'product',
    'business_model',
    'competition',
    'team',
    'traction',
    'funding_needs'
]

def generate_content(prompt):
    """Generate content using Gemini API directly."""
    headers = {
        'Content-Type': 'application/json'
    }
    
    data = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }
    
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=data)
        if response.status_code != 200:
            print(f"Gemini API error: {response.status_code} {response.text}")
            raise Exception(f"Gemini API error: {response.status_code} {response.text}")
        result = response.json()
        if 'candidates' in result and len(result['candidates']) > 0:
            if 'content' in result['candidates'][0] and 'parts' in result['candidates'][0]['content']:
                return result['candidates'][0]['content']['parts'][0]['text']
        print(f"Unexpected Gemini API response: {result}")
        raise Exception(f"Unexpected Gemini API response: {result}")
    except Exception as e:
        print(f"API request failed: {str(e)}")
        raise Exception(str(e))

def generate_pitch_deck_section(section, context):
    """Generate content for a specific pitch deck section."""
    startup_name = context.get('startup_name', '')
    
    if section == 'cover':
        prompt = f"""Create a compelling cover slide for a startup pitch deck.
        Startup Name: {startup_name}
        Industry: {context.get('industry', '')}
        Create a tagline that captures the essence of the startup.
        Format: Return only the text in this format: "{startup_name} - [tagline]"
        Keep it concise and impactful."""
    else:
        prompt = f"""As an expert pitch deck generator, create content for the {section} section of a startup pitch deck.
        Startup Name: {startup_name}
        Context: {context}
        Requirements:
        - Be concise and impactful
        - Focus on key points only
        - Use bullet points where appropriate
        - Maintain professional tone
        - Be specific and data-driven where possible
        Output only the content, no explanations."""
    
    try:
        content = generate_content(prompt)
        return content
    except Exception as e:
        print(f"Error generating content for {section}: {str(e)}")
        raise Exception(f"Failed to generate content: {str(e)}")

@app.route('/api/generate-slide', methods=['POST'])
def generate_slide():
    data = request.json
    section = data.get('section')
    context = data.get('context', {})
    
    if not section:
        return jsonify({'error': 'Section is required'}), 400
    
    if not context.get('startup_name'):
        return jsonify({'error': 'Startup name is required'}), 400
        
    try:
        content = generate_pitch_deck_section(section, context)
        return jsonify({
            'section': section,
            'content': content
        })
    except Exception as e:
        print(f"Error in generate_slide: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-full-deck', methods=['POST'])
def generate_full_deck():
    data = request.json
    required_fields = ['startup_name', 'problem', 'solution', 'target_audience', 'industry', 'revenue_model', 'stage']
    
    # Validate required fields
    missing_fields = [field for field in required_fields if field not in data or not data[field].strip()]
    if missing_fields:
        return jsonify({'error': f'Missing or empty required fields: {", ".join(missing_fields)}'}), 400
    
    try:
        deck = {}
        for section in SLIDE_SECTIONS:
            try:
                content = generate_pitch_deck_section(section, data)
                deck[section] = content
            except Exception as e:
                print(f"Error generating {section}: {str(e)}")
                deck[section] = f"Error generating content for {section}. Please try regenerating this slide."
            
        return jsonify(deck)
    except Exception as e:
        print(f"Error in generate_full_deck: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-ppt', methods=['POST'])
def generate_powerpoint():
    """Generate a PowerPoint presentation from the pitch deck data"""
    try:
        # Expecting a combined payload: {formData: {...}, deck: {...}}
        data = request.json
        form_data = data.get('formData', {})
        generated_deck = data.get('deck', {})

        # Validate required fields from form_data (checking for non-empty values)
        required_fields = ['startup_name', 'problem', 'solution', 'target_audience', 'industry', 'revenue_model', 'stage']
        missing_fields = [field for field in required_fields if field not in form_data or not form_data[field].strip()]
        if missing_fields:
            return jsonify({'error': f'Missing or empty required fields from formData: {", ".join(missing_fields)}'}), 400
            
        # Ensure we have the generated deck content
        if not generated_deck:
            return jsonify({'error': 'Generated pitch deck content is missing.'}), 400

        # Pass both form_data and generated_deck to ppt_generator
        ppt_path = generate_ppt(form_data, generated_deck)
        
        # Send the file
        return send_file(
            ppt_path,
            mimetype='application/vnd.openxmlformats-officedocument.presentationml.presentation',
            as_attachment=True,
            download_name=os.path.basename(ppt_path)
        )
        
    except Exception as e:
        print(f"Error generating PowerPoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 