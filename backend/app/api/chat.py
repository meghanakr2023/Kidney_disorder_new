from flask import Blueprint, request, jsonify
import os
import json
from groq import Groq

chat_bp = Blueprint('chat', __name__)

@chat_bp.post("/chat")
def chat_with_report():
    data = request.get_json()

    if not data:
        return jsonify(error="Missing JSON body"), 400

    required = ['message', 'report', 'prediction', 'mode']
    for field in required:
        if field not in data:
            return jsonify(error=f"Missing field: {field}"), 400

    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return jsonify(error="Groq API key not configured"), 500

    message     = data['message']
    report      = data['report']
    prediction  = data['prediction']
    confidence  = data.get('confidence', 'N/A')
    mode        = data['mode']
    history     = data.get('history', [])
    patient_info = data.get('patient_info', {})

    report_json = json.dumps(report, ensure_ascii=False, indent=2)

    if mode == 'doctor':
        system_prompt = f"""You are an expert AI radiologist assistant. You have access to the following CT scan radiology report and must answer clinical questions about it accurately.

PATIENT: {patient_info.get('name', 'Unknown')}, Age: {patient_info.get('age', 'N/A')}, Gender: {patient_info.get('gender', 'N/A')}
AI DIAGNOSIS: {prediction} ({confidence}% confidence)

FULL REPORT:
{report_json}

INSTRUCTIONS:
- Answer questions based strictly on this report
- Use proper medical terminology
- Be precise and clinically accurate
- If asked something not in the report, say "This information is not available in the current report"
- Do not make up findings not present in the report
- Keep answers concise but complete
- You may explain medical terms when asked"""

    else:
        system_prompt = f"""You are a friendly medical assistant helping a patient understand their CT scan report. You must answer questions in very simple, easy-to-understand language — as if explaining to someone with no medical background.

PATIENT: {patient_info.get('name', 'Unknown')}, Age: {patient_info.get('age', 'N/A')}
DIAGNOSIS: {prediction} detected ({confidence}% confidence)

THEIR REPORT:
{report_json}

INSTRUCTIONS:
- Use very simple language, no complex medical terms
- If you must use a medical term, always explain it simply
- Be warm, calm, and reassuring
- Base answers strictly on this report
- If asked something not in the report, say "I don't have that information in your report"
- Never cause unnecessary panic — be honest but compassionate
- Keep answers short and easy to read
- Always remind them to consult their doctor for final decisions"""

    # Build messages with history
    messages = [{"role": "system", "content": system_prompt}]

    # Add conversation history (last 10 exchanges to stay within token limits)
    for h in history[-10:]:
        messages.append({"role": h['role'], "content": h['content']})

    # Add current message
    messages.append({"role": "user", "content": message})

    try:
        client = Groq(api_key=groq_key)
        completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1000,
        )
        reply = completion.choices[0].message.content
        return jsonify(reply=reply), 200

    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify(error=f"Chat failed: {str(e)}"), 500