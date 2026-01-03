#!/bin/bash

# Create Photographer User in Production Cloud SQL
# This script uses gcloud to execute SQL commands on Cloud SQL

echo "🔐 Creating Photographer User in Cloud SQL..."
echo ""

# The SQL command to create the user
SQL="INSERT INTO users (username, password_hash, role, is_active, created_at, updated_at)
VALUES (
  'photographer',
  '\$2a\$10\$rZ5zCxHvEQ7qKX8yF9F5/.vYmxK7xEQGX8QGmQzH2nJ8Yn5kK/jXO',
  'photographer',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE 
SET 
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

SELECT id, username, role, is_active 
FROM users 
WHERE username = 'photographer';"

# Execute via gcloud
echo "Executing SQL on Cloud SQL instance..."
echo "$SQL" | gcloud sql connect wedding-web-db --user=postgres --database=postgres

echo ""
echo "✅ Done! Photographer credentials:"
echo "   Username: photographer"
echo "   Password: photo123"
echo ""
echo "Login at: https://weddingweb.co.in/photographer-login"
