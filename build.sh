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

echo "=== Build complete ==="
