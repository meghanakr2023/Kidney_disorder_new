from flask import Flask
from flask_cors import CORS
import os

from app.api.upload import upload_bp
from app.api.predict import predict_bp
from app.api.report import report_bp

def create_app():
    app = Flask(__name__)

    CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

    os.makedirs("static/uploads", exist_ok=True)
    os.makedirs("static/heatmaps", exist_ok=True)

    app.register_blueprint(upload_bp, url_prefix='/api')
    app.register_blueprint(predict_bp, url_prefix='/api')
    app.register_blueprint(report_bp, url_prefix='/api')

    @app.get('/')
    def root():
        return {'status': 'AI Radiology Assistant API running', 'version': '1.0.0'}

    @app.get('/health')
    def health():
        return {'status': 'healthy'}

    return app