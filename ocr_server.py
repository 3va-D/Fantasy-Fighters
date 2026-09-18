import re
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

@app.route('/ocr', methods=['POST'])
def ocr():
    try:
        if 'image' not in request.files:
            return jsonify({"error": "No image uploaded"}), 400

        file = request.files['image']
        question = request.form.get('question', 'Unknown Question')
        
        image_bytes = file.read()
        base64_image = base64.b64encode(image_bytes).decode('utf-8')

        # First Call: Transcribe the Handwritten Math
        ocr_response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": "Transcribe the handwritten math in this image. Output ONLY plain text math equations. Do NOT use LaTeX."},
                        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{base64_image}"}}
                    ]
                }
            ],
            temperature=0.0
        )

        raw_ocr = ocr_response.choices[0].message.content.strip()
        clean_transcription = re.sub(r'<think>[\s\S]*?</think>', '', raw_ocr).strip()

        # Second Call: Generate Feedback Based on the Question & Student Work
        feedback_response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a friendly math tutor providing brief, constructive feedback to a student."
                },
                {
                    "role": "user",
                    "content": f"Question: {question}\nStudent Work/Transcription: {clean_transcription}\nProvide 1-2 short sentences of direct feedback pointing out where the mistake happened."
                }
            ],
            temperature=0.3
        )

        feedback_text = feedback_response.choices[0].message.content.strip()

        # Second Call: Generate Feedback Based on the Question & Student Work
        feedback_response = client.chat.completions.create(
            model="qwen/qwen3.6-27b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a concise math tutor. Do NOT show any thinking, reasoning steps, or notes. Respond ONLY with the final 1-2 sentence feedback message."
                },
                {
                    "role": "user",
                    "content": f"Question: {question}\nStudent Work/Transcription: {clean_transcription}\nProvide 1-2 short sentences of direct feedback pointing out where the mistake happened."
                }
            ],
            temperature=0.1
        )

        raw_feedback = feedback_response.choices[0].message.content.strip()

        # Clean out any leftover <think> tags if present
        clean_feedback = re.sub(r'<think>[\s\S]*?</think>', '', raw_feedback).strip()

        # Fallback regex: extract text inside quotes if the model still formats output as 5. "Text"
        quoted_match = re.search(r'"([^"]+)"', clean_feedback)
        if quoted_match:
            clean_feedback = quoted_match.group(1)

        return jsonify({
            "transcription": clean_transcription,
            "feedback": clean_feedback
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)