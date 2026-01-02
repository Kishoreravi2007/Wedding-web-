# Quick Fix for Git Large Files Error

## The Problem
Your `backend/venv_deepface/` virtual environment (31,365 files, 632MB) is in Git history and exceeds GitHub's limits.

## ✅ Quick Solution

Since the venv is already in Git history, you need to remove it from history before pushing:

### Option 1: Use git-filter-repo (Recommended)

```bash
# Install git-filter-repo
pip3 install git-filter-repo

# Remove venv_deepface from entire Git history
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1
git filter-repo --path backend/venv_deepface --invert-paths --force

# Force push (this rewrites history)
git push origin main --force
```

### Option 2: If git-filter-repo not available, use git filter-branch

```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1

# Remove venv_deepface from all commits
git filter-branch --force --index-filter \
  "git rm -rf --cached --ignore-unmatch backend/venv_deepface" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git for-each-ref --format="%(refname)" refs/original/ | xargs -n 1 git update-ref -d
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push origin main --force
```

### Option 3: Start Fresh Branch (If you don't care about history)

```bash
# Create new branch without the venv
git checkout --orphan main-clean
git add .gitignore backend/.gitignore
git add -A
git commit -m "Initial commit without venv"
git branch -D main
git branch -m main
git push origin main --force
```

## ⚠️ Important

- **Force push rewrites history** - coordinate with your team
- **Virtual environments should NEVER be in Git**
- After fixing, the `.gitignore` will prevent this in the future

## Verify Fix

```bash
# Check no venv files are tracked
git ls-files | grep venv_deepface
# Should return nothing

# Check file sizes
git ls-files | xargs ls -lh | awk '{print $5, $9}' | sort -hr | head -10
# Should show no files > 100MB
```

