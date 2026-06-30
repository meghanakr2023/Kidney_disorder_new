"""
convert_jpg_to_dicom.py

Converts your existing JPG kidney CT dataset into synthetic DICOM files.
Each JPG becomes a valid .dcm file with realistic kidney CT metadata.

Usage:
    python convert_jpg_to_dicom.py \
        --input_dir  data_jpg/train \
        --output_dir data_dicom/train

Run once for train/, once for val/.
"""

import os
import argparse
import numpy as np
import pydicom
from pydicom.dataset import Dataset, FileDataset
from pydicom.sequence import Sequence
from pydicom.uid import generate_uid
from PIL import Image
from pathlib import Path
from datetime import datetime
import random


# ─── REALISTIC DICOM METADATA PER CLASS ──────────────────────────────────────
# These mimic real abdominal CT scan parameters
CLASS_METADATA = {
    "Cyst": {
        "WindowCenter": "40",
        "WindowWidth":  "400",
        "StudyDescription": "CT Abdomen Pelvis with Contrast",
        "SeriesDescription": "Axial kidney cyst evaluation",
        "BodyPartExamined": "ABDOMEN",
        "RescaleSlope": 1.0,
        "RescaleIntercept": -1024.0,
    },
    "Normal": {
        "WindowCenter": "40",
        "WindowWidth":  "400",
        "StudyDescription": "CT Abdomen Routine",
        "SeriesDescription": "Axial kidney normal study",
        "BodyPartExamined": "ABDOMEN",
        "RescaleSlope": 1.0,
        "RescaleIntercept": -1024.0,
    },
    "Stone": {
        "WindowCenter": "300",
        "WindowWidth":  "1500",
        "StudyDescription": "CT KUB Non-Contrast",
        "SeriesDescription": "Axial nephrolithiasis evaluation",
        "BodyPartExamined": "ABDOMEN",
        "RescaleSlope": 1.0,
        "RescaleIntercept": -1024.0,
    },
    "Tumor": {
        "WindowCenter": "60",
        "WindowWidth":  "350",
        "StudyDescription": "CT Abdomen Pelvis Triphasic",
        "SeriesDescription": "Axial renal mass evaluation",
        "BodyPartExamined": "ABDOMEN",
        "RescaleSlope": 1.0,
        "RescaleIntercept": -1024.0,
    },
}

# Realistic pixel spacing ranges for abdominal CT (in mm)
PIXEL_SPACING_RANGE = (0.5, 0.9)
SLICE_THICKNESS_RANGE = (2.0, 5.0)


def jpg_to_dicom(jpg_path, dcm_path, class_name, patient_id, instance_num):
    """
    Convert a single JPG file to a synthetic DICOM file.

    The pixel data is derived from the JPG.
    Metadata is realistic for the given class.
    """

    # ── Load JPG ────────────────────────────────────────────────────────────
    img      = Image.open(jpg_path).convert('L')  # grayscale
    img_arr  = np.array(img, dtype=np.uint16)

    # ── Simulate HU range ───────────────────────────────────────────────────
    # JPG pixels are 0-255 display values
    # We map them to a realistic HU range for the class
    # This is the key step — pixel values now represent HU-like values
    hu_ranges = {
        "Cyst":   (-100,  80),   # soft tissue + fluid range
        "Normal": (-20,  150),   # normal kidney parenchyma
        "Stone":  (100,  2000),  # calcium dense stones
        "Tumor":  (-50,  200),   # heterogeneous soft tissue mass
    }

    hu_min, hu_max = hu_ranges[class_name]
    # Scale 0-255 display values to HU range
    # pixel_HU = (display_value / 255) × (hu_max - hu_min) + hu_min
    hu_arr = ((img_arr.astype(np.float32) / 255.0)
              * (hu_max - hu_min) + hu_min)

    # RescaleIntercept = -1024, RescaleSlope = 1
    # stored_pixel = HU - intercept = HU + 1024
    meta       = CLASS_METADATA[class_name]
    intercept  = meta["RescaleIntercept"]
    slope      = meta["RescaleSlope"]
    pixel_data = ((hu_arr - intercept) / slope).astype(np.uint16)

    # ── Build DICOM dataset ──────────────────────────────────────────────────
    file_meta = pydicom.dataset.FileMetaDataset()
    file_meta.MediaStorageSOPClassUID    = '1.2.840.10008.5.1.4.1.1.2'  # CT Image Storage
    file_meta.MediaStorageSOPInstanceUID = generate_uid()
    file_meta.TransferSyntaxUID          = pydicom.uid.ExplicitVRLittleEndian

    ds = FileDataset(dcm_path, {}, file_meta=file_meta, preamble=b"\0" * 128)

    # Patient information (anonymized)
    ds.PatientName = f"PATIENT_{patient_id:05d}"
    ds.PatientID   = f"KS{patient_id:05d}"
    ds.PatientAge  = f"{random.randint(30, 75):03d}Y"
    ds.PatientSex  = random.choice(["M", "F"])

    # Study information
    dt = datetime.now()
    ds.StudyDate              = dt.strftime('%Y%m%d')
    ds.StudyTime              = dt.strftime('%H%M%S')
    ds.StudyInstanceUID       = generate_uid()
    ds.StudyDescription       = meta["StudyDescription"]
    ds.AccessionNumber        = f"ACC{patient_id:05d}"

    # Series information
    ds.SeriesInstanceUID      = generate_uid()
    ds.SeriesNumber           = 1
    ds.SeriesDescription      = meta["SeriesDescription"]
    ds.Modality               = "CT"
    ds.BodyPartExamined       = meta["BodyPartExamined"]

    # Instance information
    ds.SOPClassUID            = '1.2.840.10008.5.1.4.1.1.2'
    ds.SOPInstanceUID         = file_meta.MediaStorageSOPInstanceUID
    ds.InstanceNumber         = instance_num

    # Image parameters
    h, w = pixel_data.shape
    ds.Rows                   = h
    ds.Columns                = w
    ds.SamplesPerPixel        = 1
    ds.PhotometricInterpretation = "MONOCHROME2"
    ds.BitsAllocated          = 16
    ds.BitsStored             = 16
    ds.HighBit                = 15
    ds.PixelRepresentation    = 0

    # Physical calibration — THE KEY DICOM FEATURES
    ps = round(random.uniform(*PIXEL_SPACING_RANGE), 4)
    ds.PixelSpacing           = [ps, ps]  # mm per pixel
    ds.SliceThickness         = round(random.uniform(*SLICE_THICKNESS_RANGE), 1)
    ds.SpacingBetweenSlices   = ds.SliceThickness
    ds.ImagePositionPatient   = [0.0, 0.0, float(instance_num * ds.SliceThickness)]
    ds.ImageOrientationPatient = [1, 0, 0, 0, 1, 0]
    ds.SliceLocation          = float(instance_num * ds.SliceThickness)

    # HU conversion parameters
    ds.RescaleSlope           = meta["RescaleSlope"]
    ds.RescaleIntercept       = meta["RescaleIntercept"]
    ds.RescaleType            = "HU"

    # Window display parameters
    ds.WindowCenter           = meta["WindowCenter"]
    ds.WindowWidth            = meta["WindowWidth"]

    # Pixel data
    ds.PixelData              = pixel_data.tobytes()
    ds.is_implicit_VR         = False
    ds.is_little_endian       = True

    # Save
    ds.save_as(dcm_path, write_like_original=False)


def convert_dataset(input_dir, output_dir):
    """
    Convert an entire ImageFolder-style JPG dataset to DICOM.

    input_dir structure:
        input_dir/
        ├── Cyst/   *.jpg
        ├── Normal/ *.jpg
        ├── Stone/  *.jpg
        └── Tumor/  *.jpg

    output_dir structure (same layout, .dcm files):
        output_dir/
        ├── Cyst/   *.dcm
        ├── Normal/ *.dcm
        ├── Stone/  *.dcm
        └── Tumor/  *.dcm
    """
    input_path  = Path(input_dir)
    output_path = Path(output_dir)

    classes      = [d.name for d in input_path.iterdir() if d.is_dir()]
    patient_id   = 1
    total        = 0
    failed       = 0

    print(f"\nConverting {input_dir} → {output_dir}")
    print(f"Classes found: {classes}")

    for class_name in classes:
        if class_name not in CLASS_METADATA:
            print(f"  Skipping unknown class: {class_name}")
            continue

        class_input  = input_path  / class_name
        class_output = output_path / class_name
        class_output.mkdir(parents=True, exist_ok=True)

        jpg_files = list(class_input.glob("*.jpg")) + \
                    list(class_input.glob("*.jpeg")) + \
                    list(class_input.glob("*.png"))

        print(f"\n  [{class_name}] {len(jpg_files)} files")

        for i, jpg_file in enumerate(jpg_files):
            dcm_filename = jpg_file.stem + ".dcm"
            dcm_path     = class_output / dcm_filename

            try:
                jpg_to_dicom(
                    jpg_path     = str(jpg_file),
                    dcm_path     = str(dcm_path),
                    class_name   = class_name,
                    patient_id   = patient_id,
                    instance_num = i + 1
                )
                total += 1

                if (i + 1) % 100 == 0:
                    print(f"    Converted {i+1}/{len(jpg_files)}")

            except Exception as e:
                print(f"    Failed: {jpg_file.name} — {e}")
                failed += 1

            patient_id += 1

    print(f"\nDone. Converted: {total} | Failed: {failed}")
    print(f"Output at: {output_dir}")


# ─── MAIN ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--input_dir',  required=True,
                        help='Path to JPG dataset folder (train or val)')
    parser.add_argument('--output_dir', required=True,
                        help='Where to save DICOM files')
    args = parser.parse_args()

    convert_dataset(args.input_dir, args.output_dir)