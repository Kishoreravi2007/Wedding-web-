#!/bin/bash

# Configuration
PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
BUCKET_NAME="wedding-web-photos-${PROJECT_ID}"
SQL_INSTANCE_NAME="wedding-web-db"
DB_NAME="wedding_web"
DB_USER="wedding_user"
# Generate a random password if not set
if [ -z "$DB_PASSWORD" ]; then
  DB_PASSWORD=$(openssl rand -base64 12)
  echo "Generated DB Password: $DB_PASSWORD"
else
  echo "Using provided DB_PASSWORD"
fi

echo "========================================================"
echo "Setting up GCP Infrastructure for Wedding Web"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Bucket: $BUCKET_NAME"
echo "SQL Instance: $SQL_INSTANCE_NAME"
echo "========================================================"

# Enable required APIs
echo " enabling APIs..."
gcloud services enable storage.googleapis.com sqladmin.googleapis.com run.googleapis.com cloudbuild.googleapis.com

# Create GCS Bucket
echo "Creating Storage Bucket..."
if gsutil ls -b gs://$BUCKET_NAME > /dev/null 2>&1; then
    echo "Bucket $BUCKET_NAME already exists."
else
    gsutil mb -l $REGION gs://$BUCKET_NAME
    # Make strictly public-read (optional, better to use signed URLs but keeping simple for now)
    # gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
    echo "Bucket created."
fi

# Create Cloud SQL Instance
echo "Creating Cloud SQL Instance (this may take 10-15 minutes)..."
if gcloud sql instances describe $SQL_INSTANCE_NAME > /dev/null 2>&1; then
    echo "Instance $SQL_INSTANCE_NAME already exists."
else
    # Creating a small instance for "Cheap & Best"
    gcloud sql instances create $SQL_INSTANCE_NAME \
        --database-version=POSTGRES_15 \
        --tier=db-f1-micro \
        --region=$REGION \
        --storage-auto-increase \
        --availability-type=ZONAL 
    echo "Instance created."
fi

# Create Database
echo "Creating Database..."
if gcloud sql databases list --instance=$SQL_INSTANCE_NAME | grep $DB_NAME > /dev/null; then
    echo "Database $DB_NAME already exists."
else
    gcloud sql databases create $DB_NAME --instance=$SQL_INSTANCE_NAME
    echo "Database created."
fi

# Create User
echo "Creating User..."
if gcloud sql users list --instance=$SQL_INSTANCE_NAME | grep $DB_USER > /dev/null; then
    echo "User $DB_USER already exists. Updating password..."
    gcloud sql users set-password $DB_USER --instance=$SQL_INSTANCE_NAME --password="$DB_PASSWORD"
else
    gcloud sql users create $DB_USER --instance=$SQL_INSTANCE_NAME --password="$DB_PASSWORD"
    echo "User created."
fi

# Output connection info
echo "========================================================"
echo "Setup Complete!"
echo ""
echo "Please update your backend/.env file with the following:"
echo "GCS_BUCKET_NAME=$BUCKET_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=$DB_PASSWORD"
echo "DB_NAME=$DB_NAME"
echo "DB_HOST=/cloudsql/$PROJECT_ID:$REGION:$SQL_INSTANCE_NAME"
echo ""
echo "Note: For local development, you need the Cloud SQL Auth Proxy to connect to this DB_HOST."
echo "========================================================"

# Export password for easy copy
echo "$DB_PASSWORD" > db_password.txt
