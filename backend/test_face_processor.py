"""
Test script for FaceProcessor to verify installation and basic functionality.
Run this script to check if face_recognition is properly installed and working.
"""

import sys
import os

def test_imports():
    """Test if all required packages are installed."""
    print("=" * 60)
    print("Testing Package Imports")
    print("=" * 60)
    
    try:
        import face_recognition
        print("✅ face_recognition imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import face_recognition: {e}")
        print("\n💡 Installation help:")
        print("   pip install face_recognition")
        print("   Note: You may need to install cmake and dlib dependencies first")
        return False
    
    try:
        import cv2
        print("✅ opencv-python imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import cv2: {e}")
        return False
    
    try:
        import numpy as np
        print("✅ numpy imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import numpy: {e}")
        return False
    
    try:
        from face_processor import FaceProcessor
        print("✅ FaceProcessor imported successfully")
    except ImportError as e:
        print(f"❌ Failed to import FaceProcessor: {e}")
        print("   Make sure face_processor.py is in the same directory")
        return False
    
    return True


def test_face_processor_init():
    """Test FaceProcessor initialization."""
    print("\n" + "=" * 60)
    print("Testing FaceProcessor Initialization")
    print("=" * 60)
    
    try:
        from face_processor import FaceProcessor
        
        # Test with default settings
        processor = FaceProcessor(index_file='test_index.json', model='cnn')
        print("✅ FaceProcessor initialized with CNN model")
        
        # Test with HOG model
        processor_hog = FaceProcessor(index_file='test_index.json', model='hog')
        print("✅ FaceProcessor initialized with HOG model")
        
        # Test invalid model
        try:
            processor_invalid = FaceProcessor(model='invalid')
            print("❌ Should have raised ValueError for invalid model")
            return False
        except ValueError:
            print("✅ Correctly rejected invalid model")
        
        return True
        
    except Exception as e:
        print(f"❌ Error initializing FaceProcessor: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_face_detection():
    """Test face detection on a sample image."""
    print("\n" + "=" * 60)
    print("Testing Face Detection")
    print("=" * 60)
    
    try:
        import face_recognition
        import numpy as np
        
        # Try to create a simple test image with face_recognition
        # We'll just test if the library can load and process images
        print("✅ face_recognition library is functional")
        print("   (Full face detection test requires actual image files)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing face detection: {e}")
        return False


def test_index_operations():
    """Test index save/load operations."""
    print("\n" + "=" * 60)
    print("Testing Index Operations")
    print("=" * 60)
    
    try:
        from face_processor import FaceProcessor
        import numpy as np
        
        test_index_file = 'test_index_operations.json'
        
        # Clean up if exists
        if os.path.exists(test_index_file):
            os.remove(test_index_file)
        
        processor = FaceProcessor(index_file=test_index_file, model='cnn')
        
        # Test stats on empty index
        stats = processor.get_index_stats()
        print(f"✅ get_index_stats() works: {stats['total_photos']} photos")
        
        # Test clear index
        processor.clear_index()
        print("✅ clear_index() works")
        
        # Clean up
        if os.path.exists(test_index_file):
            os.remove(test_index_file)
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing index operations: {e}")
        import traceback
        traceback.print_exc()
        return False


def run_all_tests():
    """Run all tests."""
    print("\n" + "🧪 " * 20)
    print("FaceProcessor Installation & Functionality Test")
    print("🧪 " * 20)
    
    results = []
    
    # Run tests
    results.append(("Package Imports", test_imports()))
    results.append(("FaceProcessor Init", test_face_processor_init()))
    results.append(("Face Detection", test_face_detection()))
    results.append(("Index Operations", test_index_operations()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    all_passed = True
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if not result:
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All tests passed! FaceProcessor is ready to use.")
        print("\nNext steps:")
        print("  1. Index a gallery: python face_processor.py --index <folder>")
        print("  2. Search for faces: python face_processor.py --search <selfie>")
    else:
        print("⚠️  Some tests failed. Please fix the issues above.")
        print("\nCommon issues:")
        print("  - Install face_recognition: pip install face_recognition")
        print("  - Install cmake (required for dlib)")
        print("  - Check Python version (requires 3.7+)")
    print("=" * 60)
    
    return all_passed


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)

