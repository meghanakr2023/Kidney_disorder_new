import sys
sys.path.append(r"E:\Kidney Disorder - Copy\backend")

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import transforms, datasets
import torchvision.models as models
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, ConfusionMatrixDisplay
import matplotlib.pyplot as plt
import numpy as np
import os
import time
from dicom_dataset import DICOMDataset

CLASSES = ["Cyst", "Normal", "Stone", "Tumor"]
IMG_SIZE = 224
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def build_model():
    model = models.efficientnet_b3(weights=models.EfficientNet_B3_Weights.DEFAULT)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, len(CLASSES))
    )
    return model

def get_transform():
    return transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])

def load_model(model_path):
    checkpoint = torch.load(model_path, map_location=DEVICE)
    model = build_model()
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(DEVICE)
    model.eval()
    return model

# ── DICOM EVALUATION ────────────────────────────────────
def evaluate_dicom(data_dir, model_path):
    print("\n" + "="*60)
    print("  EVALUATION ON DICOM DATASET")
    print("="*60)

    model = load_model(model_path)
    tf = get_transform()

    # Validation
    print("\n[1] Validation Set...")
    val_dataset = DICOMDataset(
        os.path.join(data_dir, "val"), transform=tf)
    val_loader = DataLoader(val_dataset, batch_size=32,
                            shuffle=False, num_workers=0)
    print(f"    Found {len(val_dataset)} images")

    val_preds, val_labels, val_probs = [], [], []
    with torch.no_grad():
        for imgs, labels in val_loader:
            imgs  = imgs.to(DEVICE)
            out   = model(imgs)
            probs = torch.softmax(out, dim=1)
            preds = out.argmax(1)
            val_preds.extend(preds.cpu().numpy())
            val_labels.extend(labels.numpy())
            val_probs.extend(probs.cpu().numpy())

    val_preds  = np.array(val_preds)
    val_labels = np.array(val_labels)
    val_probs  = np.array(val_probs)
    val_acc = (val_preds == val_labels).mean() * 100
    print(f"    Validation Accuracy : {val_acc:.2f}%")

    # Train
    print("\n[2] Train Set...")
    train_dataset = DICOMDataset(
        os.path.join(data_dir, "train"), transform=tf)
    train_loader = DataLoader(train_dataset, batch_size=32,
                              shuffle=False, num_workers=0)
    print(f"    Found {len(train_dataset)} images")

    train_preds, train_labels = [], []
    with torch.no_grad():
        for imgs, labels in train_loader:
            imgs  = imgs.to(DEVICE)
            out   = model(imgs)
            preds = out.argmax(1)
            train_preds.extend(preds.cpu().numpy())
            train_labels.extend(labels.numpy())

    train_preds  = np.array(train_preds)
    train_labels = np.array(train_labels)
    train_acc = (train_preds == train_labels).mean() * 100
    print(f"    Train Accuracy      : {train_acc:.2f}%")

    # Classification Report
    print("\n[3] Classification Report:")
    print("-"*60)
    print(classification_report(val_labels, val_preds,
                                target_names=CLASSES))

    # Confusion Matrix
    print("\n[4] Confusion Matrix:")
    cm = confusion_matrix(val_labels, val_preds)
    print(cm)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm,
                                  display_labels=CLASSES)
    disp.plot(cmap=plt.cm.Blues)
    plt.title("Confusion Matrix — DICOM Dataset")
    plt.tight_layout()
    plt.savefig("confusion_matrix_dicom.png")
    print("    Saved as confusion_matrix_dicom.png")

    # ROC-AUC
    print("\n[5] ROC-AUC Score:")
    auc = None
    try:
        auc = roc_auc_score(val_labels, val_probs,
                            multi_class="ovr", average="macro")
        print(f"    ROC-AUC (macro) : {auc:.4f}")
    except Exception as e:
        print(f"    Could not compute: {e}")

    # Inference Time
    print("\n[6] Inference Time...")
    times = []
    with torch.no_grad():
        for i in range(min(50, len(val_dataset))):
            img, _ = val_dataset[i]
            img = img.unsqueeze(0).to(DEVICE)
            start = time.time()
            _ = model(img)
            end = time.time()
            times.append((end - start) * 1000)
    avg_time = np.mean(times)
    print(f"    Average : {avg_time:.2f} ms")
    print(f"    Min     : {np.min(times):.2f} ms")
    print(f"    Max     : {np.max(times):.2f} ms")

    # Model Size
    size_mb = os.path.getsize(model_path) / (1024 * 1024)

    # Per class counts
    print("\n[7] Val Samples Per Class:")
    for i, cls in enumerate(CLASSES):
        print(f"    {cls:10s} : {(val_labels == i).sum()}")

    # Summary
    print("\n" + "="*60)
    print("  DICOM DATASET — FINAL SUMMARY")
    print("="*60)
    print(f"  Train Images        : {len(train_dataset)}")
    print(f"  Val Images          : {len(val_dataset)}")
    print(f"  Train Accuracy      : {train_acc:.2f}%")
    print(f"  Validation Accuracy : {val_acc:.2f}%")
    if auc:
        print(f"  ROC-AUC (macro)     : {auc:.4f}")
    print(f"  Avg Inference Time  : {avg_time:.2f} ms")
    print(f"  Model Size          : {size_mb:.2f} MB")
    print("="*60)

    return train_acc, val_acc, auc, avg_time, size_mb


# ── MAIN ────────────────────────────────────────────────
if __name__ == "__main__":

    MODEL_PATH = r"E:\Kidney Disorder - Copy\backend\models\ct_model.pth"
    DICOM_DATA = r"E:\Kidney Disorder - Copy\backend\data_dicom"

    evaluate_dicom(DICOM_DATA, MODEL_PATH)