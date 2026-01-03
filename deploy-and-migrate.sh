#!/bin/bash

# Deploy and Run Face Migration on Cloud Run
# This script deploys the backend to Cloud Run and triggers the migration

echo "🚀 Deploying Backend to Cloud Run..."
echo "====================================="

# Navigate to backend directory
cd "$(dirname "$0")/.."

# Deploy backend service
echo ""
echo "📦 Step 1: Deploying backend service..."
gcloud run deploy wedding-backend \
  --source . \
  --region=asia-south1 \
  --allow-unauthenticated \
  --set-env-vars="DEEPFACE_API_URL=https://deepface-979970479540.asia-south1.run.app" \
  --timeout=3600

if [ $? -ne 0 ]; then
  echo "❌ Backend deployment failed!"
  exit 1
fi

echo "✅ Backend deployed successfully!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe wedding-backend --region=asia-south1 --format='value(status.url)')
echo "📍 Service URL: $SERVICE_URL"

# Trigger migration via Cloud Run Jobs or exec
echo ""
echo "🔄 Step 2: Running migration script..."
echo "This will reprocess all photos with 4096-dim embeddings..."

# Use gcloud run jobs if available, otherwise use curl to trigger endpoint
gcloud run jobs create face-migration \
  --image=gcr.io/sub-projects-483107/wedding-backend \
  --region=asia-south1 \
  --set-env-vars="DEEPFACE_API_URL=https://deepface-979970479540.asia-south1.run.app" \
  --task-timeout=3600 \
  --command="node" \
  --args="scripts/migrate-to-4096-dim.js,--batch-size=10" \
  2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Migration job created, executing..."
  gcloud run jobs execute face-migration --region=asia-south1 --wait
else
  echo "ℹ️  Using alternative migration approach..."
  # Alternative: Create a temporary endpoint to trigger migration
  echo "Please run the migration from Cloud Shell:"
  echo ""
  echo "gcloud run services proxy wedding-backend --region=asia-south1"
  echo "# Then in another terminal:"
  echo "curl -X POST $SERVICE_URL/api/admin/migrate-faces"
fi

echo ""
echo "🎉 Migration process initiated!"
echo "Check Cloud Run logs for progress..."
