#!/usr/bin/env bash
# Render build script — builds frontend and installs Python dependencies
set -e

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Installing Node.js and building frontend ==="
cd frontend
npm install
npm run build
cd ..

echo "=== Downloading NSL-KDD dataset ==="
python download_dataset.py || echo "Dataset download skipped (may already exist)"

echo "=== Training ML models ==="
python train_model.py || echo "Model training skipped (models may already exist)"

echo "=== Build complete ==="
