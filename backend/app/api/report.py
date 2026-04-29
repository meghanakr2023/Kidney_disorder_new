from flask import Blueprint, request, jsonify
import os
from app.report_generator.report_generator import generate_report_with_llm

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

    filename = data.get('filename')
    image_path = os.path.join("static/uploads", filename) if filename else None
    gemini_key = data.get('api_key') or os.getenv("GEMINI_API_KEY")
    measurements = data.get('measurements', {})

    print(f"Filename received: {filename}")
    print(f"Image path: {image_path}")
    print(f"Image exists: {os.path.exists(image_path) if image_path else False}")
    print(f"API key received: {gemini_key[:15] if gemini_key else 'None'}")
    print(f"Measurements available: {measurements.get('available', False)}")

    try:
        report_data = generate_report_with_llm(
            prediction=data['prediction'],
            confidence=data['confidence'],
            probabilities=data['probabilities'],
            patient_info=data['patient_info'],
            mode=mode,
            api_key=gemini_key,
            image_path=image_path,
            measurements=measurements,
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify(error=f"Report generation failed: {str(e)}"), 500

    return jsonify(
        file_id=data['file_id'],
        filename=filename,
        mode=mode,
        patient_info=data['patient_info'],
        prediction=data['prediction'],
        confidence=data['confidence'],
        report=report_data,
    ), 200


@report_bp.post("/translate-report")
def translate_report_endpoint():
    data = request.get_json()

    if not data:
        return jsonify(error="Missing JSON body"), 400

    required = ['report', 'target_language', 'mode']
    for field in required:
        if field not in data:
            return jsonify(error=f"Missing field: {field}"), 400

    target_language = data['target_language']
    mode = data['mode']
    report = data['report']

    supported = ['kn', 'hi', 'ta', 'te', 'ml', 'mr']
    if target_language not in supported:
        return jsonify(error=f"Unsupported language. Choose from: {supported}"), 400

    try:
        translated = translate_report(report, target_language, mode)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify(error=f"Translation failed: {str(e)}"), 500

    return jsonify(
        translated_report=translated,
        language=target_language,
        mode=mode,
    ), 200