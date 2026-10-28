#!/usr/bin/env bash
set -euo pipefail

cd frontend
npm ci
npm run build
cd ..

python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
