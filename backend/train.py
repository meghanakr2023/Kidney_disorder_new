import argparse
import os
import torch
import torch.nn as nn
<<<<<<< HEAD
from torch.utils.data import DataLoader
=======
from torch.utils.data import DataLoader, random_split
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171
from torchvision import datasets, transforms
import torchvision.models as models
from tqdm import tqdm

CLASSES = ["Cyst", "Normal", "Stone", "Tumor"]
IMG_SIZE = 224
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


def get_transforms():
    train_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])
<<<<<<< HEAD

    test_tf = transforms.Compose([
=======
    val_tf = transforms.Compose([
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])
<<<<<<< HEAD

    return train_tf, test_tf
=======
    return train_tf, val_tf
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171


def build_model():
    model = models.efficientnet_b3(weights=models.EfficientNet_B3_Weights.DEFAULT)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(in_features, len(CLASSES))
    )
    return model


def evaluate(model, loader):
    model.eval()
    correct = 0
    total = 0
<<<<<<< HEAD

=======
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171
    with torch.no_grad():
        for imgs, labels in loader:
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
            outputs = model(imgs)
            correct += (outputs.argmax(1) == labels).sum().item()
            total += labels.size(0)
<<<<<<< HEAD

    return round(correct / total * 100, 2) if total > 0 else 0.0


def train(data_dir, epochs, batch_size, lr):
    print(f"\nDevice       : {DEVICE}")
    print(f"Data dir     : {data_dir}")
    print(f"Epochs       : {epochs}")
    print(f"Batch size   : {batch_size}")
    print(f"Learning rate: {lr}\n")

    train_tf, test_tf = get_transforms()

    train_dir = os.path.join(data_dir, "train")
    val_dir = os.path.join(data_dir, "val")

    if not os.path.isdir(train_dir):
        raise FileNotFoundError(f"Train folder not found: {train_dir}")
    if not os.path.isdir(val_dir):
        raise FileNotFoundError(f"Val folder not found: {val_dir}")

    train_dataset = datasets.ImageFolder(train_dir, transform=train_tf)
    val_dataset = datasets.ImageFolder(val_dir, transform=test_tf)

    print(f"Train images found: {len(train_dataset)}")
    print(f"val images found : {len(val_dataset)}")
    print(f"Classes found     : {train_dataset.classes}\n")

    train_loader = DataLoader(
        train_dataset, batch_size=batch_size, shuffle=True, num_workers=2
    )
    val_loader = DataLoader(
        val_dataset, batch_size=batch_size, shuffle=False, num_workers=2
    )
=======
    return round(correct / total * 100, 2)


def train(data_dir, epochs, batch_size, lr):
    print(f"\nDevice     : {DEVICE}")
    print(f"Data dir   : {data_dir}")
    print(f"Epochs     : {epochs}")
    print(f"Batch size : {batch_size}")
    print(f"Learning rate: {lr}\n")

    train_tf, val_tf = get_transforms()

    full_dataset = datasets.ImageFolder(data_dir, transform=train_tf)
    print(f"Total images found: {len(full_dataset)}")
    print(f"Classes found: {full_dataset.classes}\n")

    n = len(full_dataset)
    val_n = int(n * 0.15)
    test_n = int(n * 0.05)
    train_n = n - val_n - test_n

    train_ds, val_ds, test_ds = random_split(
        full_dataset, [train_n, val_n, test_n]
    )

    val_ds.dataset.transform = val_tf
    test_ds.dataset.transform = val_tf

    train_loader = DataLoader(
        train_ds, batch_size=batch_size, shuffle=True, num_workers=2
    )
    val_loader = DataLoader(
        val_ds, batch_size=batch_size, num_workers=2
    )
    test_loader = DataLoader(
        test_ds, batch_size=batch_size, num_workers=2
    )

    print(f"Train samples : {train_n}")
    print(f"Val samples   : {val_n}")
    print(f"Test samples  : {test_n}\n")
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171

    model = build_model().to(DEVICE)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
    criterion = nn.CrossEntropyLoss()

<<<<<<< HEAD
    best_train_acc = 0.0

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
=======
    best_val_acc = 0.0

    for epoch in range(epochs):
        model.train()
        total_loss = 0
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171
        correct = 0
        total = 0

        for imgs, labels in tqdm(train_loader, desc=f"Epoch {epoch+1}/{epochs}"):
            imgs, labels = imgs.to(DEVICE), labels.to(DEVICE)
<<<<<<< HEAD

=======
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171
            optimizer.zero_grad()
            outputs = model(imgs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()
            correct += (outputs.argmax(1) == labels).sum().item()
            total += labels.size(0)

        train_acc = round(correct / total * 100, 2)
<<<<<<< HEAD
        scheduler.step()

        print(f"Epoch {epoch+1}/{epochs}")
        print(f"  Loss      : {total_loss / len(train_loader):.4f}")
        print(f"  Train Acc : {train_acc}%\n")

        if train_acc > best_train_acc:
            best_train_acc = train_acc
            os.makedirs("models", exist_ok=True)
            torch.save({
                "model_state_dict": model.state_dict(),
                "class_to_idx": train_dataset.class_to_idx
            }, "models/ct_model.pth")
            print(f"  Model saved with train_acc={train_acc}%\n")

    print(f"Training complete. Best Train Accuracy: {best_train_acc}%")

    val_acc = evaluate(model, val_loader)
    print(f"Validation Accuracy: {val_acc}%")
    print("Model saved at: models/ct_model.pth")
=======
        val_acc = evaluate(model, val_loader)
        scheduler.step()

        print(f"Epoch {epoch+1}/{epochs}")
        print(f"  Loss       : {total_loss / len(train_loader):.4f}")
        print(f"  Train Acc  : {train_acc}%")
        print(f"  Val Acc    : {val_acc}%")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            os.makedirs("models", exist_ok=True)
            torch.save(model.state_dict(), "models/ct_model.pth")
            print(f"  Model saved with val_acc={val_acc}%")

        print()

    print(f"Training complete. Best Val Accuracy: {best_val_acc}%")

    test_acc = evaluate(model, test_loader)
    print(f"Test Accuracy: {test_acc}%")
    print(f"Model saved at: models/ct_model.pth")
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data_dir",
        required=True,
<<<<<<< HEAD
        help="Path to dataset folder containing train/ and test/ subfolders"
=======
        help="Path to dataset folder containing Cyst, Normal, Stone, Tumor subfolders"
>>>>>>> 29e6eecb1ec5419e4ad03a848cf86054c0bc3171
    )
    parser.add_argument("--epochs", type=int, default=20)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    args = parser.parse_args()

    train(args.data_dir, args.epochs, args.batch_size, args.lr)