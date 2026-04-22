from flask import Blueprint, request, jsonify
import uuid
import os
from PIL import Image

upload_bp = Blueprint('upload', __name__)
UPLOAD_DIR = "static/uploads"
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE_MB = 20

@upload_bp.post("/upload")
def upload_ct_scan():
    if 'file' not in request.files:
        return jsonify(error="No file provided"), 400

    file = request.files['file']
<<<<<<< HEAD
    
    print(f"Uploaded file: {file.filename}, content type: {file.content_type}")
    if file.content_type not in ALLOWED_TYPES and not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
        return jsonify(error="Unsupported file type. Use JPG or PNG."), 400
=======

    if file.content_type not in ALLOWED_TYPES:
        return jsonify(error=f"Unsupported file type. Use JPG or PNG."), 400
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171

    content = file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        return jsonify(error=f"File exceeds {MAX_SIZE_MB}MB limit."), 413

    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1] or ".png"
    filename = f"{file_id}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
<<<<<<< HEAD

=======
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171
    with open(filepath, "wb") as f:
        f.write(content)

    try:
        img = Image.open(filepath)
<<<<<<< HEAD
        img.load()
        img.close()
    except Exception as e:
        try:
            os.remove(filepath)
        except:
            pass
        return jsonify(error="File is not a valid image. Please try a different image."), 400
=======
        img.verify()
    except Exception:
        os.remove(filepath)
        return jsonify(error="File is not a valid image."), 400
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171

    return jsonify(
        file_id=file_id,
        filename=filename,
        filepath=filepath,
        url=f"/static/uploads/{filename}",
        size_kb=round(len(content) / 1024, 1),
    ), 200