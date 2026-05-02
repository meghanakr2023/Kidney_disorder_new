from flask import Blueprint, request, jsonify
import os
import json
from groq import Groq
from app.database import append_chat_message

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

    groq_key     = os.getenv("GROQ_API_KEY")
    if not groq_key:
        return jsonify(error="Groq API key not configured"), 500

    message      = data['message']
    report       = data['report']
    prediction   = data['prediction']
    confidence   = data.get('confidence', 'N/A')
    mode         = data['mode']
    history      = data.get('history', [])
    patient_info = data.get('patient_info', {})
    mongo_id     = data.get('mongo_id')

    print(f"Chat request - mongo_id: {mongo_id}")

    report_json = json.dumps(report, ensure_ascii=False, indent=2)

    if mode == 'doctor':
        system_prompt = f"""You are an expert AI radiologist assistant with access to the following CT scan report.

PATIENT: {patient_info.get('name', 'Unknown')}, Age: {patient_info.get('age', 'N/A')}, Gender: {patient_info.get('gender', 'N/A')}
AI DIAGNOSIS: {prediction} ({confidence}% confidence)

FULL REPORT:
{report_json}

INSTRUCTIONS:
- Answer based strictly on this report
- Use proper medical terminology
- Be precise and clinically accurate
- If asked something not in the report, say "This information is not available in the current report"
- Keep answers concise but complete"""

    else:
        system_prompt = f"""You are a friendly medical assistant helping a patient understand their CT scan report in simple language.

PATIENT: {patient_info.get('name', 'Unknown')}, Age: {patient_info.get('age', 'N/A')}
DIAGNOSIS: {prediction} detected ({confidence}% confidence)

THEIR REPORT:
{report_json}

INSTRUCTIONS:
- Use very simple language, no complex medical terms
- Be warm, calm, and reassuring
- Base answers strictly on this report
- Never cause unnecessary panic
- Always remind them to consult their doctor for final decisions"""

    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-10:]:
        messages.append({"role": h['role'], "content": h['content']})
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

        # Save chat to MongoDB if mongo_id provided
        if mongo_id:
            try:
                append_chat_message(mongo_id, {"role": "user", "content": message})
                append_chat_message(mongo_id, {"role": "assistant", "content": reply})
                print(f"Chat saved to MongoDB: {mongo_id}")
            except Exception as e:
                print(f"Chat MongoDB save error: {e}")
        else:
            print("No mongo_id provided — chat not saved")

        return jsonify(reply=reply), 200

    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify(error=f"Chat failed: {str(e)}"), 500