#!/bin/bash
PROJECT_ID="sub-projects-483107"

echo "=================================================="
echo "   Setting up HTTP -> HTTPS Redirect              "
echo "=================================================="

# 1. Create URL Map for Redirect (Sends status 301 to HTTPS)
echo "[1/3] Creating Redirect Application..."
gcloud compute url-maps create wedding-http-redirect \
    --default-url-redirect='https-redirect=true' \
    --project=$PROJECT_ID \
    --quiet || echo "URL Map already exists."

# 2. Create Target HTTP Proxy
echo "[2/3] Creating HTTP Proxy..."
gcloud compute target-http-proxies create wedding-http-proxy \
    --url-map=wedding-http-redirect \
    --project=$PROJECT_ID \
    --quiet || echo "HTTP Proxy already exists."

# 3. Create Forwarding Rule (Port 80)
# We reuse the SAME IP address (wedding-lb-ip) but on Port 80
echo "[3/3] Binding to Port 80 (HTTP)..."
gcloud compute forwarding-rules create wedding-http-forwarding-rule \
    --address=wedding-lb-ip \
    --global \
    --target-http-proxy=wedding-http-proxy \
    --ports=80 \
    --project=$PROJECT_ID \
    --quiet || echo "Forwarding Rule already exists."

echo ""
echo "✅ Redirect Configured!"
echo "http://weddingweb.co.in will now jump to https://weddingweb.co.in"
