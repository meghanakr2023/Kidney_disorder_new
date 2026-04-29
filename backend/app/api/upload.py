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

    print(f"Uploaded file: {file.filename}, content type: {file.content_type}")

    # Accept .dcm files too
    is_dicom = file.filename.lower().endswith('.dcm')
    is_image = (
        file.content_type in ALLOWED_TYPES or
        file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))
    )

    if not is_dicom and not is_image:
        return jsonify(error="Unsupported file type. Use JPG, PNG, or DCM."), 400

    content = file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        return jsonify(error=f"File exceeds {MAX_SIZE_MB}MB limit."), 413

    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1] or (".dcm" if is_dicom else ".png")
    filename = f"{file_id}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)

    with open(filepath, "wb") as f:
        f.write(content)

    # Validate file
    if is_dicom:
        try:
            import pydicom
            ds = pydicom.dcmread(filepath)
            ds.pixel_array  # trigger load to validate
        except Exception as e:
            try:
                os.remove(filepath)
            except:
                pass
            return jsonify(error="File is not a valid DICOM."), 400
    else:
        try:
            img = Image.open(filepath)
            img.load()
            img.close()
        except Exception as e:
            try:
                os.remove(filepath)
            except:
                pass
            return jsonify(error="File is not a valid image."), 400

    return jsonify(
        file_id=file_id,
        filename=filename,
        filepath=filepath,
        url=f"/static/uploads/{filename}",
        size_kb=round(len(content) / 1024, 1),
        is_dicom=is_dicom,
    ), 200