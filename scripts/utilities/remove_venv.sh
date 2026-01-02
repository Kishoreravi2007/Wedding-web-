#!/bin/bash

# Script to remove venv_deepface from Git tracking
# Run this if git rm times out due to too many files

cd "$(dirname "$0")"

echo "Removing venv_deepface from Git tracking..."
echo "This may take a while (31,000+ files)..."

# Remove in smaller batches to avoid timeout
find backend/venv_deepface -type f | while read file; do
    git rm --cached "$file" 2>/dev/null || true
done

echo "Done! Now run:"
echo "  git add .gitignore backend/.gitignore"
echo "  git commit -m 'Remove venv_deepface and update .gitignore'"
echo "  git push origin main"

