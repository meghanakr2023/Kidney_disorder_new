import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import numpy as np
import cv2
import base64
import io
import os

CLASSES = ["Cyst", "Normal", "Stone", "Tumor"]
CLASS_LABELS = {
    "Cyst": "Kidney Cyst",
    "Normal": "Normal (No Abnormality)",
    "Stone": "Kidney Stone",
    "Tumor": "Kidney Tumor",
}
IMG_SIZE = 224
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

val_transforms = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])


# ─── CLASSIFICATION MODEL ─────────────────────────────────────────────────────

def build_model(num_classes=4):
    model = models.efficientnet_b3(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, num_classes)
    )
    return model


_model = None

def get_model():
    global _model
    if _model is None:
        _model = build_model(num_classes=len(CLASSES))
        model_path = os.path.join("models", "ct_model.pth")
        print(f"Trying to load model from: {os.path.abspath(model_path)}")
        print(f"File exists: {os.path.exists(model_path)}")
        if os.path.exists(model_path):
            try:
                checkpoint = torch.load(model_path, map_location=DEVICE)
                if "model_state_dict" in checkpoint:
                    _model.load_state_dict(checkpoint["model_state_dict"])
                else:
                    _model.load_state_dict(checkpoint)
                print("Model loaded successfully")
            except Exception as e:
                print(f"Error loading model: {e}")
        else:
            print("No trained model found — using random weights (demo mode)")
        _model.to(DEVICE)
        _model.eval()
    return _model


# ─── AUTOENCODER ──────────────────────────────────────────────────────────────

class ConvAutoencoder(nn.Module):
    def __init__(self):
        super(ConvAutoencoder, self).__init__()

        # Encoder — compress image down
        self.encoder = nn.Sequential(
            # 3 x 224 x 224 → 32 x 112 x 112
            nn.Conv2d(3, 32, kernel_size=3, stride=2, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(32),

            # 32 x 112 x 112 → 64 x 56 x 56
            nn.Conv2d(32, 64, kernel_size=3, stride=2, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(64),

            # 64 x 56 x 56 → 128 x 28 x 28
            nn.Conv2d(64, 128, kernel_size=3, stride=2, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(128),

            # 128 x 28 x 28 → 256 x 14 x 14
            nn.Conv2d(128, 256, kernel_size=3, stride=2, padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(256),
        )

        # Decoder — reconstruct image back
        self.decoder = nn.Sequential(
            # 256 x 14 x 14 → 128 x 28 x 28
            nn.ConvTranspose2d(256, 128, kernel_size=3, stride=2,
                               padding=1, output_padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(128),

            # 128 x 28 x 28 → 64 x 56 x 56
            nn.ConvTranspose2d(128, 64, kernel_size=3, stride=2,
                               padding=1, output_padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(64),

            # 64 x 56 x 56 → 32 x 112 x 112
            nn.ConvTranspose2d(64, 32, kernel_size=3, stride=2,
                               padding=1, output_padding=1),
            nn.ReLU(),
            nn.BatchNorm2d(32),

            # 32 x 112 x 112 → 3 x 224 x 224
            nn.ConvTranspose2d(32, 3, kernel_size=3, stride=2,
                               padding=1, output_padding=1),
            nn.Sigmoid(),
        )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded


_autoencoder = None
_anomaly_threshold = None


def get_autoencoder():
    global _autoencoder, _anomaly_threshold

    if _autoencoder is None:
        ae_path = os.path.join("models", "autoencoder.pth")

        if os.path.exists(ae_path):
            _autoencoder = ConvAutoencoder()
            _autoencoder.load_state_dict(
                torch.load(ae_path, map_location=DEVICE)
            )
            _autoencoder.to(DEVICE)
            _autoencoder.eval()
            print("Autoencoder loaded successfully")
        else:
            print("No autoencoder found — anomaly detection disabled")
            _autoencoder = None

    if _anomaly_threshold is None:
        threshold_path = os.path.join("models", "anomaly_threshold.txt")
        if os.path.exists(threshold_path):
            with open(threshold_path, "r") as f:
                _anomaly_threshold = float(f.read().strip())
            print(f"Anomaly threshold loaded: {_anomaly_threshold:.6f}")
        else:
            _anomaly_threshold = 0.02
            print(f"No threshold file — using default: {_anomaly_threshold}")

    return _autoencoder, _anomaly_threshold


def check_anomaly(img_pil):
    """
    Check if image is anomalous using autoencoder reconstruction error.
    Returns:
        is_anomaly: bool
        reconstruction_error: float
        anomaly_score: 0-100
    """
    autoencoder, threshold = get_autoencoder()

    if autoencoder is None:
        # Autoencoder not trained yet — skip anomaly detection
        return False, 0.0, 0.0

    ae_transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        # No normalization — autoencoder uses 0-1 range with Sigmoid output
    ])

    input_tensor = ae_transform(img_pil).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        reconstructed = autoencoder(input_tensor)
        error = torch.mean(
            (input_tensor - reconstructed) ** 2
        ).item()

    is_anomaly = error > threshold

    # Normalize to 0-100 score
    # score = 50 means exactly at threshold
    # score > 50 means anomalous
    anomaly_score = min((error / threshold) * 50, 100)
    anomaly_score = round(anomaly_score, 1)

    print(f"Reconstruction error: {error:.6f}")
    print(f"Threshold:            {threshold:.6f}")
    print(f"Anomaly detected:     {is_anomaly} (score: {anomaly_score}/100)")

    return is_anomaly, round(error, 6), anomaly_score


# ─── DICOM FUNCTIONS ──────────────────────────────────────────────────────────

def load_dicom(filepath):
    import pydicom

    ds = pydicom.dcmread(filepath)
    raw_pixels = ds.pixel_array.astype(np.float32)

    slope = float(getattr(ds, 'RescaleSlope', 1.0))
    intercept = float(getattr(ds, 'RescaleIntercept', 0.0))
    raw_hu = raw_pixels * slope + intercept

    pixel_spacing = list(ds.PixelSpacing) if hasattr(ds, 'PixelSpacing') else [1.0, 1.0]
    slice_thickness = float(getattr(ds, 'SliceThickness', 1.0))

    window_center = float(getattr(ds, 'WindowCenter', 40))
    window_width = float(getattr(ds, 'WindowWidth', 400))
    if isinstance(window_center, (list, tuple)): window_center = window_center[0]
    if isinstance(window_width, (list, tuple)): window_width = window_width[0]

    lower = window_center - window_width / 2
    upper = window_center + window_width / 2
    windowed = np.clip(raw_hu, lower, upper)
    normalized = ((windowed - lower) / (upper - lower) * 255).astype(np.uint8)

    windowed_rgb = Image.fromarray(normalized).convert('RGB')

    return windowed_rgb, raw_hu, pixel_spacing, slice_thickness


def measure_lesion(raw_hu, pixel_spacing, prediction):
    measurements = {
        "available": False,
        "width_mm": None,
        "height_mm": None,
        "area_cm2": None,
        "hu_mean": None,
        "hu_min": None,
        "hu_max": None,
        "pixel_spacing_mm": pixel_spacing,
    }

    try:
        hu_ranges = {
            "Tumor":  (-20,  150),
            "Cyst":   (-20,   20),
            "Stone":  (200,  2000),
            "Normal": (20,    80),
        }

        hu_min_thresh, hu_max_thresh = hu_ranges.get(prediction, (-20, 150))
        mask = ((raw_hu >= hu_min_thresh) & (raw_hu <= hu_max_thresh)).astype(np.uint8)

        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(
            mask, connectivity=8
        )

        if num_labels < 2:
            return measurements

        largest_label = 1 + np.argmax(stats[1:, cv2.CC_STAT_AREA])
        lesion_mask = (labels == largest_label).astype(np.uint8)

        rows = np.any(lesion_mask, axis=1)
        cols = np.any(lesion_mask, axis=0)
        row_indices = np.where(rows)[0]
        col_indices = np.where(cols)[0]

        if len(row_indices) == 0 or len(col_indices) == 0:
            return measurements

        height_pixels = row_indices[-1] - row_indices[0]
        width_pixels = col_indices[-1] - col_indices[0]

        height_mm = round(height_pixels * float(pixel_spacing[0]), 1)
        width_mm = round(width_pixels * float(pixel_spacing[1]), 1)

        lesion_pixels = np.sum(lesion_mask)
        area_mm2 = lesion_pixels * float(pixel_spacing[0]) * float(pixel_spacing[1])
        area_cm2 = round(area_mm2 / 100, 2)

        lesion_hu_values = raw_hu[lesion_mask == 1]
        hu_mean = round(float(np.mean(lesion_hu_values)), 1)
        hu_min_val = round(float(np.min(lesion_hu_values)), 1)
        hu_max_val = round(float(np.max(lesion_hu_values)), 1)

        measurements.update({
            "available": True,
            "width_mm": width_mm,
            "height_mm": height_mm,
            "area_cm2": area_cm2,
            "hu_mean": hu_mean,
            "hu_min": hu_min_val,
            "hu_max": hu_max_val,
            "pixel_spacing_mm": pixel_spacing,
        })

    except Exception as e:
        print(f"Measurement error: {e}")

    return measurements


# ─── GRADCAM ──────────────────────────────────────────────────────────────────

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_backward_hook(backward_hook)

    def generate(self, input_tensor, class_idx):
        self.model.zero_grad()
        output = self.model(input_tensor)
        score = output[0, class_idx]
        score.backward()

        gradients = self.gradients[0]
        activations = self.activations[0]
        weights = gradients.mean(dim=(1, 2))

        cam = torch.zeros(activations.shape[1:], device=DEVICE)
        for i, w in enumerate(weights):
            cam += w * activations[i]

        cam = torch.relu(cam)
        cam = cam.cpu().numpy()
        cam = cv2.resize(cam, (IMG_SIZE, IMG_SIZE))
        cam -= cam.min()
        if cam.max() > 0:
            cam /= cam.max()
        return cam


# ─── MAIN PREDICTION ──────────────────────────────────────────────────────────

def predict_ct_scan(filepath):
    model = get_model()

    # ── Load image ─────────────────────────────────────────────────────────────
    is_dicom = filepath.lower().endswith('.dcm')

    if is_dicom:
        img_pil, raw_hu, pixel_spacing, slice_thickness = load_dicom(filepath)
        print(f"DICOM loaded — pixel spacing: {pixel_spacing} mm")
    else:
        img_pil = Image.open(filepath).convert("RGB")
        raw_hu = None
        pixel_spacing = [1.0, 1.0]
        slice_thickness = 1.0

    original_np = np.array(img_pil.resize((IMG_SIZE, IMG_SIZE)))
    input_tensor = val_transforms(img_pil).unsqueeze(0).to(DEVICE)

    # ── STEP 1: Anomaly Detection ───────────────────────────────────────────────
    print("Checking for anomalies...")
    is_anomaly, reconstruction_error, anomaly_score = check_anomaly(img_pil)

    # ── STEP 2: Standard Classification ────────────────────────────────────────
    model.eval()
    with torch.no_grad():
        logits = model(input_tensor)
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

    pred_idx = int(np.argmax(probs))
    pred_class = CLASSES[pred_idx]
    confidence = float(probs[pred_idx])

    print(f"Prediction: {pred_class} {round(confidence * 100, 2)}%")

    # ── STEP 3: GradCAM ────────────────────────────────────────────────────────
    model.eval()
    input_tensor2 = val_transforms(img_pil).unsqueeze(0).to(DEVICE)
    input_tensor2.requires_grad_(True)
    target_layer = model.features[-1]
    gradcam = GradCAM(model, target_layer)
    cam = gradcam.generate(input_tensor2, class_idx=pred_idx)
    heatmap_colored, overlay = _build_overlay(original_np, cam)

    # ── STEP 4: Measurements — DICOM only ──────────────────────────────────────
    if is_dicom and raw_hu is not None:
        measurements = measure_lesion(raw_hu, pixel_spacing, pred_class)
    else:
        measurements = {"available": False}

    # ── STEP 5: Build anomaly message ──────────────────────────────────────────
    if is_anomaly:
        anomaly_message = (
            "This scan shows patterns not seen in training data. "
            "This may indicate an unusual or unknown condition. "
            "Mandatory radiologist review recommended."
        )
    else:
        anomaly_message = "Scan patterns are consistent with known conditions."

    # ── STEP 6: Return ─────────────────────────────────────────────────────────
    return {
        "prediction": pred_class,
        "label": CLASS_LABELS[pred_class],
        "confidence": round(confidence * 100, 2),
        "probabilities": {
            CLASSES[i]: round(float(probs[i]) * 100, 2)
            for i in range(len(CLASSES))
        },
        "anomaly": {
            "is_anomaly": is_anomaly,
            "score": anomaly_score,
            "reconstruction_error": reconstruction_error,
            "message": anomaly_message,
        },
        "heatmap_b64": _np_to_b64(heatmap_colored),
        "overlay_b64": _np_to_b64(overlay),
        "original_b64": _np_to_b64(original_np),
        "measurements": measurements,
        "is_dicom": is_dicom,
        "pixel_spacing": pixel_spacing,
        "slice_thickness": slice_thickness,
    }


# ─── HELPERS ──────────────────────────────────────────────────────────────────

def _build_overlay(original, cam):
    heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
    heatmap_rgb = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
    overlay = cv2.addWeighted(original, 0.55, heatmap_rgb, 0.45, 0)
    return heatmap_rgb, overlay


def _np_to_b64(arr):
    img = Image.fromarray(arr.astype(np.uint8))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")