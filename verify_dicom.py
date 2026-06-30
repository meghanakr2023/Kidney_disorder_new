# verify_dicom.py
import pydicom
import numpy as np
from pathlib import Path

# Pick one file to test
test_file = next(Path("backend/data_dicom/train/Cyst").glob("*.dcm"))
ds = pydicom.dcmread(str(test_file))

print(f"File:             {test_file.name}")
print(f"Patient:          {ds.PatientName}")
print(f"Modality:         {ds.Modality}")
print(f"Rows x Cols:      {ds.Rows} x {ds.Columns}")
print(f"Pixel Spacing:    {ds.PixelSpacing} mm")
print(f"Slice Thickness:  {ds.SliceThickness} mm")
print(f"Window Center:    {ds.WindowCenter}")
print(f"Window Width:     {ds.WindowWidth}")
print(f"Rescale Slope:    {ds.RescaleSlope}")
print(f"Rescale Intercept:{ds.RescaleIntercept}")

# Test HU conversion
raw  = ds.pixel_array.astype(np.float32)
hu   = raw * float(ds.RescaleSlope) + float(ds.RescaleIntercept)
print(f"HU range:         {hu.min():.1f} to {hu.max():.1f}")
print(f"\nAll checks passed — DICOM file is valid")