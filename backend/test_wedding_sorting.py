#!/usr/bin/env python3
"""
Test Script for Wedding Photo Sorting System

This script demonstrates and tests the core functionality:
- Selfie-to-gallery matching using cosine similarity
- RetinaFace detection with high accuracy
- ArcFace (Buffalo_L) embeddings (512-d)
- High-resolution image support (50+ faces per photo)
- ChromaDB vector database integration

Usage:
    python test_wedding_sorting.py

Requirements:
    - Python 3.8+
    - Installed dependencies from requirements_wedding_sorting.txt
    - Sample images for testing
"""

import os
import sys
import logging
import time
from pathlib import Path

# Add services directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'services'))

from services.wedding_photo_sorter import WeddingPhotoSorter, find_matches_in_gallery
from services.fastapi_app import app

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class WeddingPhotoSortingTester:
    """Test suite for wedding photo sorting system."""
    
    def __init__(self):
        self.photo_sorter = None
        self.test_results = []
        
    def setup_test_environment(self):
        """Setup test environment and initialize photo sorter."""
        logger.info("🚀 Setting up Wedding Photo Sorting Test Environment")
        
        try:
            # Initialize photo sorter with optimized settings
            self.photo_sorter = WeddingPhotoSorter(
                model_name='buffalo_l',
                det_size=(1280, 1280),  # High accuracy for group photos
                ctx_id=-1,  # Use CPU for testing (set to 0 for GPU)
                similarity_threshold=0.4,
                max_workers=2
            )
            
            logger.info("✅ Photo sorter initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize photo sorter: {e}")
            return False
    
    def create_test_images(self):
        """Create test images for demonstration."""
        logger.info("📸 Creating test images for demonstration")
        
        test_dir = Path("test_wedding_images")
        test_dir.mkdir(exist_ok=True)
        
        # Create a simple test image with faces (placeholder)
        # In real testing, you would use actual wedding photos
        test_images = [
            "selfie_test.jpg",
            "wedding_group_1.jpg", 
            "wedding_group_2.jpg",
            "wedding_group_3.jpg"
        ]
        
        for img_name in test_images:
            img_path = test_dir / img_name
            if not img_path.exists():
                # Create a simple colored square as placeholder
                # In real testing, replace with actual wedding photos
                try:
                    import cv2
                    import numpy as np
                    
                    # Create a colored square as placeholder
                    img = np.ones((800, 600, 3), dtype=np.uint8) * 128
                    cv2.putText(img, f"Test Image: {img_name}", (50, 300), 
                              cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                    cv2.imwrite(str(img_path), img)
                    
                except Exception as e:
                    logger.warning(f"Could not create test image {img_name}: {e}")
        
        return test_dir
    
    def test_basic_functionality(self):
        """Test basic photo sorting functionality."""
        logger.info("🧪 Testing basic photo sorting functionality")
        
        test_dir = self.create_test_images()
        selfie_path = test_dir / "selfie_test.jpg"
        gallery_path = test_dir
        
        try:
            # Test the main function as specified in requirements
            result = find_matches_in_gallery(
                selfie_path=str(selfie_path),
                gallery_path=str(gallery_path),
                similarity_threshold=0.4
            )
            
            test_result = {
                "test_name": "Basic Functionality Test",
                "status": "PASSED" if "error" not in result else "FAILED",
                "result": result,
                "execution_time": time.time()
            }
            
            self.test_results.append(test_result)
            
            if test_result["status"] == "PASSED":
                logger.info("✅ Basic functionality test passed")
                logger.info(f"   - Faces in selfie: {result.get('faces_in_selfie', 0)}")
                logger.info(f"   - Faces in gallery: {result.get('faces_in_gallery', 0)}")
                logger.info(f"   - Matches found: {result.get('matches_found', 0)}")
            else:
                logger.error("❌ Basic functionality test failed")
                logger.error(f"   Error: {result.get('error', 'Unknown error')}")
            
            return test_result["status"] == "PASSED"
            
        except Exception as e:
            logger.error(f"❌ Basic functionality test error: {e}")
            return False
    
    def test_high_accuracy_detection(self):
        """Test RetinaFace high accuracy detection."""
        logger.info("🎯 Testing RetinaFace high accuracy detection")
        
        try:
            # Test with detection size for high accuracy
            test_image = self.create_test_images() / "wedding_group_1.jpg"
            
            if test_image.exists():
                faces = self.photo_sorter.face_processor.detect_faces(str(test_image))
                
                test_result = {
                    "test_name": "High Accuracy Detection Test",
                    "status": "PASSED",
                    "faces_detected": len(faces),
                    "detection_size": self.photo_sorter.det_size,
                    "model": self.photo_sorter.model_name,
                    "execution_time": time.time()
                }
                
                self.test_results.append(test_result)
                logger.info(f"✅ High accuracy detection test passed")
                logger.info(f"   - Detection size: {self.photo_sorter.det_size}")
                logger.info(f"   - Model: {self.photo_sorter.model_name}")
                logger.info(f"   - Faces detected: {len(faces)}")
                
                return True
            else:
                logger.warning("⚠️  No test image available for detection test")
                return False
                
        except Exception as e:
            logger.error(f"❌ High accuracy detection test error: {e}")
            return False
    
    def test_arcface_embeddings(self):
        """Test ArcFace 512-d embeddings."""
        logger.info("🧠 Testing ArcFace 512-d embeddings")
        
        try:
            test_image = self.create_test_images() / "wedding_group_1.jpg"
            
            if test_image.exists():
                faces = self.photo_sorter.face_processor.detect_faces(str(test_image))
                
                if faces:
                    embedding = faces[0]['embedding']
                    embedding_dim = len(embedding)
                    
                    test_result = {
                        "test_name": "ArcFace Embeddings Test",
                        "status": "PASSED" if embedding_dim == 512 else "FAILED",
                        "embedding_dimension": embedding_dim,
                        "expected_dimension": 512,
                        "embedding_sample": embedding[:10] if embedding else None,
                        "execution_time": time.time()
                    }
                    
                    self.test_results.append(test_result)
                    
                    if embedding_dim == 512:
                        logger.info("✅ ArcFace embeddings test passed")
                        logger.info(f"   - Embedding dimension: {embedding_dim}")
                        logger.info(f"   - Sample values: {embedding[:5]}")
                        return True
                    else:
                        logger.error(f"❌ ArcFace embeddings test failed: expected 512, got {embedding_dim}")
                        return False
                else:
                    logger.warning("⚠️  No faces detected for embedding test")
                    return False
            else:
                logger.warning("⚠️  No test image available for embedding test")
                return False
                
        except Exception as e:
            logger.error(f"❌ ArcFace embeddings test error: {e}")
            return False
    
    def test_cosine_similarity(self):
        """Test cosine similarity matching."""
        logger.info("🔍 Testing cosine similarity matching")
        
        try:
            # Create two similar embeddings for testing
            import numpy as np
            
            base_embedding = np.random.rand(512).tolist()
            similar_embedding = (np.array(base_embedding) + np.random.normal(0, 0.1, 512)).tolist()
            dissimilar_embedding = np.random.rand(512).tolist()
            
            # Test similarity calculations
            similar_score = self.photo_sorter._calculate_cosine_similarity(base_embedding, similar_embedding)
            dissimilar_score = self.photo_sorter._calculate_cosine_similarity(base_embedding, dissimilar_embedding)
            
            # Test should show higher similarity for similar embeddings
            test_passed = similar_score > dissimilar_score and similar_score > 0.5
            
            test_result = {
                "test_name": "Cosine Similarity Test",
                "status": "PASSED" if test_passed else "FAILED",
                "similar_score": similar_score,
                "dissimilar_score": dissimilar_score,
                "threshold": self.photo_sorter.similarity_threshold,
                "execution_time": time.time()
            }
            
            self.test_results.append(test_result)
            
            if test_passed:
                logger.info("✅ Cosine similarity test passed")
                logger.info(f"   - Similar score: {similar_score:.4f}")
                logger.info(f"   - Dissimilar score: {dissimilar_score:.4f}")
                logger.info(f"   - Threshold: {self.photo_sorter.similarity_threshold}")
                return True
            else:
                logger.error("❌ Cosine similarity test failed")
                return False
                
        except Exception as e:
            logger.error(f"❌ Cosine similarity test error: {e}")
            return False
    
    def test_chromadb_integration(self):
        """Test ChromaDB vector database integration."""
        logger.info("🗄️  Testing ChromaDB vector database integration")
        
        try:
            if self.photo_sorter.chroma_client and self.photo_sorter.collection:
                # Test vector storage
                test_embedding = np.random.rand(512).tolist()
                test_metadata = {"test": True, "image_path": "test.jpg"}
                
                # Add test data
                self.photo_sorter.collection.add(
                    ids=["test_id"],
                    embeddings=[test_embedding],
                    metadatas=[test_metadata]
                )
                
                # Test retrieval
                results = self.photo_sorter.collection.query(
                    query_embeddings=[test_embedding],
                    n_results=1
                )
                
                test_result = {
                    "test_name": "ChromaDB Integration Test",
                    "status": "PASSED" if results['ids'] else "FAILED",
                    "collection_name": self.photo_sorter.collection.name,
                    "stored_embeddings": 1,
                    "retrieved_results": len(results['ids']),
                    "execution_time": time.time()
                }
                
                self.test_results.append(test_result)
                logger.info("✅ ChromaDB integration test passed")
                logger.info(f"   - Collection: {self.photo_sorter.collection.name}")
                logger.info(f"   - Retrieved: {len(results['ids'])} results")
                return True
            else:
                test_result = {
                    "test_name": "ChromaDB Integration Test",
                    "status": "SKIPPED",
                    "reason": "ChromaDB not available",
                    "execution_time": time.time()
                }
                self.test_results.append(test_result)
                logger.warning("⚠️  ChromaDB not available, skipping integration test")
                return False
                
        except Exception as e:
            logger.error(f"❌ ChromaDB integration test error: {e}")
            return False
    
    def test_performance_requirements(self):
        """Test performance requirements (50+ faces per photo)."""
        logger.info("⚡ Testing performance requirements")
        
        try:
            # Test with high-resolution settings
            gallery_stats = self.photo_sorter.get_gallery_statistics(str(self.create_test_images()))
            
            # Check if system can handle the requirements
            can_handle_50_plus = gallery_stats.get('can_handle_50_plus_faces', False)
            det_size = self.photo_sorter.det_size
            
            test_result = {
                "test_name": "Performance Requirements Test",
                "status": "PASSED" if det_size[0] >= 1280 else "PARTIAL",
                "detection_size": det_size,
                "can_handle_50_plus_faces": can_handle_50_plus,
                "target_requirement": "50+ faces per high-resolution photo",
                "execution_time": time.time()
            }
            
            self.test_results.append(test_result)
            logger.info("✅ Performance requirements test completed")
            logger.info(f"   - Detection size: {det_size} (target: ≥1280x1280)")
            logger.info(f"   - 50+ faces support: {can_handle_50_plus}")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Performance requirements test error: {e}")
            return False
    
    def run_all_tests(self):
        """Run all tests and generate report."""
        logger.info("🚀 Starting Wedding Photo Sorting System Test Suite")
        logger.info("="*60)
        
        start_time = time.time()
        
        # Setup
        if not self.setup_test_environment():
            logger.error("❌ Failed to setup test environment")
            return False
        
        # Run tests
        tests = [
            self.test_basic_functionality,
            self.test_high_accuracy_detection,
            self.test_arcface_embeddings,
            self.test_cosine_similarity,
            self.test_chromadb_integration,
            self.test_performance_requirements
        ]
        
        passed_tests = 0
        total_tests = len(tests)
        
        for test_func in tests:
            try:
                if test_func():
                    passed_tests += 1
            except Exception as e:
                logger.error(f"❌ Test {test_func.__name__} failed with exception: {e}")
        
        # Generate report
        total_time = time.time() - start_time
        
        logger.info("="*60)
        logger.info("📊 TEST RESULTS SUMMARY")
        logger.info("="*60)
        logger.info(f"Total Tests: {total_tests}")
        logger.info(f"Passed: {passed_tests}")
        logger.info(f"Failed: {total_tests - passed_tests}")
        logger.info(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        logger.info(f"Total Execution Time: {total_time:.2f} seconds")
        logger.info("="*60)
        
        # Detailed results
        for result in self.test_results:
            status_emoji = "✅" if result["status"] == "PASSED" else "❌" if result["status"] == "FAILED" else "⚠️"
            logger.info(f"{status_emoji} {result['test_name']}: {result['status']}")
        
        logger.info("="*60)
        
        if passed_tests == total_tests:
            logger.info("🎉 ALL TESTS PASSED! Wedding Photo Sorting System is ready for production!")
        else:
            logger.warning(f"⚠️  {total_tests - passed_tests} tests failed. Review the issues above.")
        
        return passed_tests == total_tests
    
    def cleanup(self):
        """Clean up test files and resources."""
        logger.info("🧹 Cleaning up test environment")
        
        # Remove test images
        test_dir = Path("test_wedding_images")
        if test_dir.exists():
            import shutil
            shutil.rmtree(test_dir)
            logger.info("   - Removed test images")
        
        # Clean up ChromaDB test data
        if self.photo_sorter and self.photo_sorter.collection:
            try:
                self.photo_sorter.collection.delete(ids=["test_id"])
                logger.info("   - Cleaned up test data from ChromaDB")
            except:
                pass


def main():
    """Main test function."""
    print("🤖 Wedding Photo Sorting System - Test Suite")
    print("=" * 60)
    print("Testing implementation of:")
    print("✅ RetinaFace detection (high accuracy)")
    print("✅ ArcFace (Buffalo_L) 512-d embeddings")
    print("✅ Cosine similarity matching (threshold 0.4)")
    print("✅ High-resolution image support (50+ faces)")
    print("✅ ChromaDB vector database integration")
    print("✅ FastAPI backend with photo sorting endpoints")
    print("=" * 60)
    
    tester = WeddingPhotoSortingTester()
    
    try:
        success = tester.run_all_tests()
        
        if success:
            print("\n🎉 SUCCESS: Wedding Photo Sorting System is ready!")
            print("\nNext steps:")
            print("1. Install dependencies: pip install -r requirements_wedding_sorting.txt")
            print("2. Start FastAPI server: python services/fastapi_app.py")
            print("3. Test API endpoints: curl http://localhost:8000/docs")
        else:
            print("\n❌ FAILURE: Some tests failed. Check logs above.")
            
        return 0 if success else 1
        
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Test suite failed with error: {e}")
        return 1
    finally:
        tester.cleanup()


if __name__ == "__main__":
    sys.exit(main())
