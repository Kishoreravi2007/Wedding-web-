#!/usr/bin/env python3
"""
Test script for InsightFace API endpoints.
"""

import requests
import sys
import os

API_BASE_URL = "http://localhost:8001"

def test_health():
    """Test health check endpoint."""
    print("Testing health check...")
    try:
        response = requests.get(f"{API_BASE_URL}/health")
        print(f"✅ Health check: {response.status_code}")
        print(f"   Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_detect_faces(image_path):
    """Test face detection endpoint."""
    print(f"\nTesting face detection with: {image_path}")
    
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return False
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            data = {
                'return_landmarks': 'false',
                'return_age_gender': 'true'
            }
            
            response = requests.post(
                f"{API_BASE_URL}/api/faces/detect",
                files=files,
                data=data
            )
        
        print(f"✅ Status code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   Faces detected: {result['count']}")
            print(f"   Embedding dimension: {result['embedding_dimension']}")
            
            if result['count'] > 0:
                face = result['faces'][0]
                print(f"   First face:")
                print(f"     - Bounding box: {face['bbox']}")
                print(f"     - Confidence: {face['det_score']:.4f}")
                if 'age' in face:
                    print(f"     - Age: {face['age']}")
                if 'gender' in face:
                    print(f"     - Gender: {face['gender']}")
                print(f"     - Embedding length: {len(face['embedding'])}")
            
            return True
        else:
            print(f"❌ Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Face detection failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Run all tests."""
    print("=" * 60)
    print("InsightFace API Test Suite")
    print("=" * 60)
    
    # Test health
    if not test_health():
        print("\n❌ API is not running or not healthy.")
        print("   Start the API with: ./start_insightface_api.sh")
        sys.exit(1)
    
    # Test face detection if image provided
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        test_detect_faces(image_path)
    else:
        print("\n⚠️  No image provided for face detection test.")
        print("   Usage: python test_insightface_api.py <image_path>")
    
    print("\n" + "=" * 60)
    print("Tests complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()

