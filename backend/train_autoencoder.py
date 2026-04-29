import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision import datasets
from torch.utils.data import DataLoader
import numpy as np
import os

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 30
DATA_DIR = "dataset/train" # your training data path


# ── Autoencoder Architecture ───────────────────────────────────────────────────
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
            nn.Sigmoid(),  # output between 0 and 1
        )

    def forward(self, x):
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded

    def get_reconstruction_error(self, x):
        reconstructed = self.forward(x)
        # Mean squared error per image
        error = torch.mean((x - reconstructed) ** 2, dim=[1, 2, 3])
        return error.item()


# ── Training ───────────────────────────────────────────────────────────────────
def train():
    print(f"Device: {DEVICE}")
    print(f"Data dir: {DATA_DIR}")

    transform = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        # No normalization — autoencoder needs values in 0-1 range
        # to reconstruct properly with Sigmoid output
    ])

    dataset = datasets.ImageFolder(DATA_DIR, transform=transform)
    loader = DataLoader(dataset, batch_size=BATCH_SIZE,
                        shuffle=True, num_workers=2)

    print(f"Training images: {len(dataset)}")
    print(f"Classes: {dataset.classes}")

    model = ConvAutoencoder().to(DEVICE)
    optimizer = torch.optim.Adam(model.parameters(), lr=1e-3)
    criterion = nn.MSELoss()

    best_loss = float('inf')

    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0.0

        for imgs, _ in loader:
            # Labels not needed — autoencoder is unsupervised
            imgs = imgs.to(DEVICE)

            optimizer.zero_grad()
            reconstructed = model(imgs)
            loss = criterion(reconstructed, imgs)
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        avg_loss = total_loss / len(loader)
        print(f"Epoch {epoch+1}/{EPOCHS} — Loss: {avg_loss:.6f}")

        if avg_loss < best_loss:
            best_loss = avg_loss
            os.makedirs("models", exist_ok=True)
            torch.save(model.state_dict(), "models/autoencoder.pth")
            print(f"  Model saved — best loss: {best_loss:.6f}")

    print("\nTraining complete!")
    print("Now calculating threshold from training data...")
    calculate_threshold(model, loader)


def calculate_threshold(model, loader):
    """
    Calculate reconstruction error threshold from training data.
    Threshold = mean + 2 * std of training errors
    Any error above this = unknown/anomaly
    """
    model.eval()
    errors = []

    with torch.no_grad():
        for imgs, _ in loader:
            imgs = imgs.to(DEVICE)
            reconstructed = model(imgs)
            batch_errors = torch.mean(
                (imgs - reconstructed) ** 2,
                dim=[1, 2, 3]
            )
            errors.extend(batch_errors.cpu().numpy().tolist())

    errors = np.array(errors)
    mean_error = float(np.mean(errors))
    std_error = float(np.std(errors))

    # Threshold = mean + 2 standard deviations
    # This covers 95% of normal training data
    threshold = mean_error + 2 * std_error

    print(f"\nTraining Error Statistics:")
    print(f"  Mean error:  {mean_error:.6f}")
    print(f"  Std error:   {std_error:.6f}")
    print(f"  Threshold:   {threshold:.6f}")
    print(f"\nAdd this to your .env file:")
    print(f"ANOMALY_THRESHOLD={threshold:.6f}")

    # Save threshold to file
    with open("models/anomaly_threshold.txt", "w") as f:
        f.write(str(threshold))

    print("Threshold saved to models/anomaly_threshold.txt")


if __name__ == "__main__":
    train()