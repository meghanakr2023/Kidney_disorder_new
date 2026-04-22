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
<<<<<<< HEAD
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
=======
        model_path = os.path.join(os.path.dirname(__file__), "../../models/ct_model.pth")
        if os.path.exists(model_path):
            _model.load_state_dict(torch.load(model_path, map_location=DEVICE))
            print(f"Loaded trained model from {model_path}")
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171
        else:
            print("No trained model found — using random weights (demo mode)")
        _model.to(DEVICE)
        _model.eval()
    return _model

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

def predict_ct_scan(image_path):
    model = get_model()

    img_pil = Image.open(image_path).convert("RGB")
    original_np = np.array(img_pil.resize((IMG_SIZE, IMG_SIZE)))
    input_tensor = val_transforms(img_pil).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(input_tensor)
        probs = torch.softmax(logits, dim=1)[0].cpu().numpy()

    pred_idx = int(np.argmax(probs))
    pred_class = CLASSES[pred_idx]
    confidence = float(probs[pred_idx])

    input_tensor2 = val_transforms(img_pil).unsqueeze(0).to(DEVICE)
    input_tensor2.requires_grad_(True)
    target_layer = model.features[-1]
    gradcam = GradCAM(model, target_layer)
    cam = gradcam.generate(input_tensor2, class_idx=pred_idx)

    heatmap_colored, overlay = _build_overlay(original_np, cam)

    return {
        "prediction": pred_class,
        "label": CLASS_LABELS[pred_class],
        "confidence": round(confidence * 100, 2),
        "probabilities": {
            CLASSES[i]: round(float(probs[i]) * 100, 2)
            for i in range(len(CLASSES))
        },
        "heatmap_b64": _np_to_b64(heatmap_colored),
        "overlay_b64": _np_to_b64(overlay),
        "original_b64": _np_to_b64(original_np),
    }

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