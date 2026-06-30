import os
from pathlib import Path

import numpy as np
import pydicom

from PIL import Image
from torch.utils.data import Dataset


class DICOMDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform

        self.classes = sorted(
            [d.name for d in Path(root_dir).iterdir() if d.is_dir()]
        )

        self.class_to_idx = {
            cls: idx for idx, cls in enumerate(self.classes)
        }

        self.samples = []

        for cls in self.classes:
            class_dir = Path(root_dir) / cls

            for dcm_file in class_dir.glob("*.dcm"):
                self.samples.append(
                    (str(dcm_file), self.class_to_idx[cls])
                )

    def __len__(self):
        return len(self.samples)

    def load_dicom(self, filepath):
        ds = pydicom.dcmread(filepath)

        raw_pixels = ds.pixel_array.astype(np.float32)

        slope = float(getattr(ds, "RescaleSlope", 1.0))
        intercept = float(getattr(ds, "RescaleIntercept", 0.0))

        raw_hu = raw_pixels * slope + intercept

        window_center = getattr(ds, "WindowCenter", 40)
        window_width = getattr(ds, "WindowWidth", 400)

        if isinstance(window_center, (list, tuple)):
            window_center = window_center[0]

        if isinstance(window_width, (list, tuple)):
            window_width = window_width[0]

        window_center = float(window_center)
        window_width = float(window_width)

        lower = window_center - window_width / 2
        upper = window_center + window_width / 2

        windowed = np.clip(raw_hu, lower, upper)

        normalized = (
            (windowed - lower)
            / (upper - lower)
            * 255
        ).astype(np.uint8)

        image = Image.fromarray(normalized).convert("RGB")

        return image

    def __getitem__(self, idx):
        filepath, label = self.samples[idx]

        image = self.load_dicom(filepath)

        if self.transform:
            image = self.transform(image)

        return image, label