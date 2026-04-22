from flask import Blueprint, request, jsonify
import os

from app.rag.pipeline import generate_report_with_llm

report_bp = Blueprint('report', __name__)

@report_bp.post("/generate-report")
def generate_report():
    data = request.get_json()

    if not data:
        return jsonify(error="Missing JSON body"), 400

    mode = data.get('mode', 'doctor')
    if mode not in ('doctor', 'patient'):
        return jsonify(error="Mode must be 'doctor' or 'patient'"), 400

    required = ['file_id', 'prediction', 'confidence', 'probabilities', 'patient_info']
    for field in required:
        if field not in data:
            return jsonify(error=f"Missing field: {field}"), 400

    try:
        report_data = generate_report_with_llm(
            prediction=data['prediction'],
            confidence=data['confidence'],
            probabilities=data['probabilities'],
            patient_info=data['patient_info'],
            mode=mode,
            api_key=data.get('api_key') or os.getenv("ANTHROPIC_API_KEY"),
        )
    except Exception as e:
        return jsonify(error=f"Report generation failed: {str(e)}"), 500

    return jsonify(
        file_id=data['file_id'],
        mode=mode,
        patient_info=data['patient_info'],
        prediction=data['prediction'],
        confidence=data['confidence'],
        report=report_data,
    ), 200