"""
Download NSL-KDD dataset for model training.
"""
import os
import urllib.request
import gzip
import shutil

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# NSL-KDD dataset URLs
DATASET_URL = "https://raw.githubusercontent.com/defcom17/NSL_KDD/master/KDDTrain+.txt"

def download_dataset():
    """Download the NSL-KDD training dataset."""
    file_path = os.path.join(BASE_DIR, "KDDTrain+.txt")
    
    # Check if file already exists
    if os.path.exists(file_path):
        print(f"Dataset already exists at {file_path}")
        return True
    
    print(f"Downloading NSL-KDD dataset from {DATASET_URL}...")
    try:
        urllib.request.urlretrieve(DATASET_URL, file_path)
        file_size = os.path.getsize(file_path)
        print(f"✓ Dataset downloaded successfully!")
        print(f"  File: {file_path}")
        print(f"  Size: {file_size:,} bytes")
        return True
    except Exception as e:
        print(f"✗ Error downloading dataset: {e}")
        return False

if __name__ == "__main__":
    success = download_dataset()
    if success:
        print("\nYou can now run: python train_model.py")
    else:
        print("\nFailed to download dataset. Please download manually from:")
        print(f"  {DATASET_URL}")
