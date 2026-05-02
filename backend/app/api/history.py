from flask import Blueprint, request, jsonify
from app.database import get_all_scans, get_scan, delete_scan

history_bp = Blueprint('history', __name__)


@history_bp.get("/history")
def get_history():
    try:
        scans = get_all_scans()
        return jsonify(scans=scans, count=len(scans)), 200
    except Exception as e:
        print(f"History fetch error: {e}")
        return jsonify(error=str(e)), 500


@history_bp.get("/history/<scan_id>")
def get_single_scan(scan_id):
    try:
        scan = get_scan(scan_id)
        if not scan:
            return jsonify(error="Scan not found"), 404
        return jsonify(scan), 200
    except Exception as e:
        return jsonify(error=str(e)), 500


@history_bp.delete("/history/<scan_id>")
def delete_single_scan(scan_id):
    try:
        delete_scan(scan_id)
        return jsonify(message="Scan deleted successfully"), 200
    except Exception as e:
        return jsonify(error=str(e)), 500