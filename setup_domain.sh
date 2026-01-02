#!/bin/bash
set -e

echo "=================================================="
echo "   Wedding Web - Custom Domain Setup Assistant    "
echo "=================================================="

# 1. Get Domain Name
DOMAIN_NAME="weddingweb.co.in"

PROJECT_ID="sub-projects-483107"
REGION="asia-south1"

echo ""
echo "🚀 Starting Setup for domain: $DOMAIN_NAME"
echo "Project: $PROJECT_ID"
echo ""

# 2. Reserve Global Static IP
echo "[1/6] Reserving Static IP Address..."
gcloud compute addresses create wedding-lb-ip --global --project=$PROJECT_ID --quiet || echo "IP 'wedding-lb-ip' already exists, using it."
IP_ADDRESS=$(gcloud compute addresses describe wedding-lb-ip --global --project=$PROJECT_ID --format="value(address)")
echo "✅ IP Address Reserved: $IP_ADDRESS"

# 3. Create SSL Certificate
echo ""
echo "[2/6] Creating Managed SSL Certificate..."
gcloud compute ssl-certificates create wedding-ssl \
    --domains="$DOMAIN_NAME" \
    --global \
    --project=$PROJECT_ID \
    --quiet || echo "SSL Certificate 'wedding-ssl' already exists or domain mismatch. Continuing..."

# 4. Create Backend Bucket (Frontend)
echo ""
echo "[3/6] Configuring Frontend Backend-Bucket..."
gcloud compute backend-buckets create wedding-frontend-bucket \
    --gcs-bucket-name=sub-projects-483107-wedding-frontend \
    --enable-cdn \
    --project=$PROJECT_ID \
    --quiet || echo "Backend bucket 'wedding-frontend-bucket' already exists."

# 5. Create Network Endpoint Groups (Backend Service)
# Note: Cloud Run services need a Serverless NEG
echo ""
echo "[4/6] Creating Serverless NEG for Backend..."
gcloud compute network-endpoint-groups create wedding-backend-neg \
    --region=$REGION \
    --network-endpoint-type=serverless \
    --cloud-run-service=wedding-backend \
    --project=$PROJECT_ID \
    --quiet || echo "NEG 'wedding-backend-neg' already exists."

# Create Backend Service using the NEG
gcloud compute backend-services create wedding-api-service \
    --global \
    --project=$PROJECT_ID \
    --quiet || echo "Backend Service 'wedding-api-service' already exists."

gcloud compute backend-services add-backend wedding-api-service \
    --global \
    --network-endpoint-group=wedding-backend-neg \
    --network-endpoint-group-region=$REGION \
    --project=$PROJECT_ID \
    --quiet || echo "Backend already added to service."

# 6. Create URL Map (Routing)
echo ""
echo "[5/6] Creating URL Map (Routing Rules)..."
# Route /api/* to Backend, Default to Frontend
gcloud compute url-maps create wedding-lb \
    --default-backend-bucket=wedding-frontend-bucket \
    --project=$PROJECT_ID \
    --quiet || echo "URL Map 'wedding-lb' already exists."

# Add Path Matcher for API
gcloud compute url-maps add-path-matcher wedding-lb \
    --default-backend-bucket=wedding-frontend-bucket \
    --path-matcher-name=api-paths \
    --backend-service-path-rules="/api/*=wedding-api-service" \
    --project=$PROJECT_ID \
    --quiet || echo "Path matcher already exists or updated."

# 7. Create Proxy and Forwarding Rule
echo ""
echo "[6/6] Finalizing Load Balancer..."
gcloud compute target-https-proxies create wedding-lb-proxy \
    --url-map=wedding-lb \
    --ssl-certificates=wedding-ssl \
    --project=$PROJECT_ID \
    --quiet || echo "Target Proxy already exists."

gcloud compute forwarding-rules create wedding-https-forwarding-rule \
    --address=wedding-lb-ip \
    --global \
    --target-https-proxy=wedding-lb-proxy \
    --ports=443 \
    --project=$PROJECT_ID \
    --quiet || echo "Forwarding Rule already exists."

echo ""
echo "=================================================="
echo "🎉 SETUP COMPLETE!"
echo "=================================================="
echo ""
echo "👉 ACTION REQUIRED:"
echo "1. Go to your Domain Registrar (Namecheap, GoDaddy, etc.)"
echo "2. Create/Update an 'A Record' for '@' (and 'www')"
echo "3. Point it to this IP Address: $IP_ADDRESS"
echo ""
echo "Note: SSL Certificate may take 15-60 minutes to become active."
