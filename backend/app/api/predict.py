from flask import Blueprint, request, jsonify
import os

from app.ml.model import predict_ct_scan

predict_bp = Blueprint('predict', __name__)

@predict_bp.post("/predict")
def predict():
    data = request.get_json()

    if not data or 'filename' not in data:
        return jsonify(error="Missing filename in request body"), 400

    filename = data['filename']
    file_id = data.get('file_id', '')
    filepath = os.path.join("static/uploads", filename)

    if not os.path.exists(filepath):
        return jsonify(error=f"Image not found: {filename}"), 404

    try:
        result = predict_ct_scan(filepath)
    except Exception as e:
        return jsonify(error=f"Model inference failed: {str(e)}"), 500

    return jsonify(
        file_id=file_id,
        prediction=result["prediction"],
        label=result["label"],
        confidence=result["confidence"],
        probabilities=result["probabilities"],
        heatmap_b64=result["heatmap_b64"],
        overlay_b64=result["overlay_b64"],
        original_b64=result["original_b64"],
    ), 200