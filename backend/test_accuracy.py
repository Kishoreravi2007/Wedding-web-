"""
Test script to verify face recognition accuracy and reduce false positives.
Run this script with your selfie to test different tolerance settings.
"""

import sys
import os
from face_processor import FaceProcessor


def test_with_different_tolerances(selfie_path, index_file='face_index.json'):
    """Test face search with different tolerance levels to find optimal setting."""
    
    if not os.path.exists(selfie_path):
        print(f"❌ Selfie not found: {selfie_path}")
        print("   Please provide a valid path to your selfie image.")
        return
    
    if not os.path.exists(index_file):
        print(f"❌ Index file not found: {index_file}")
        print("   Please index a gallery first using:")
        print(f"   python face_processor.py --index <gallery_folder>")
        return
    
    print("=" * 70)
    print("Testing Face Recognition Accuracy")
    print("=" * 70)
    print(f"Selfie: {selfie_path}")
    print(f"Index: {index_file}")
    print()
    
    # Test different tolerance levels
    tolerances = [0.6, 0.55, 0.5, 0.45, 0.40]
    
    results = {}
    
    for tolerance in tolerances:
        print(f"Testing tolerance: {tolerance}")
        print("-" * 70)
        
        processor = FaceProcessor(
            index_file=index_file,
            model='cnn',
            tolerance=tolerance
        )
        
        # Search with strict mode
        matches = processor.search_face(
            selfie_path,
            return_scores=True,
            strict_mode=True
        )
        
        results[tolerance] = matches
        
        if matches:
            print(f"  Found {len(matches)} matches:")
            for i, (filename, distance) in enumerate(matches[:5], 1):  # Show top 5
                confidence = (1 - distance) * 100
                print(f"    {i}. {os.path.basename(filename)}")
                print(f"       Distance: {distance:.4f} | Confidence: {confidence:.1f}%")
        else:
            print("  No matches found")
        
        print()
    
    # Recommend best tolerance
    print("=" * 70)
    print("Recommendations")
    print("=" * 70)
    
    # Find tolerance with reasonable number of high-confidence matches
    best_tolerance = None
    for tolerance in [0.45, 0.5, 0.55]:
        matches = results.get(tolerance, [])
        if matches:
            # Count high-confidence matches (distance < 0.45)
            high_conf = [m for m in matches if m[1] < 0.45]
            if len(high_conf) > 0:
                best_tolerance = tolerance
                break
    
    if best_tolerance:
        print(f"✅ Recommended tolerance: {best_tolerance}")
        print(f"   This gives you matches with good confidence while reducing false positives.")
    else:
        print("⚠️  No clear recommendation. Try:")
        print("   1. Improve selfie quality (better lighting, larger face)")
        print("   2. Re-index the gallery")
        print("   3. Use tolerance 0.45 for strictest matching")
    
    print()
    print("To use the recommended tolerance:")
    print(f"  processor = FaceProcessor(tolerance={best_tolerance or 0.45}, model='cnn')")
    print(f"  matches = processor.search_face('{selfie_path}', strict_mode=True)")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_accuracy.py <path_to_selfie> [index_file]")
        print()
        print("Example:")
        print("  python test_accuracy.py guest_selfie.jpg")
        print("  python test_accuracy.py guest_selfie.jpg face_index.json")
        sys.exit(1)
    
    selfie_path = sys.argv[1]
    index_file = sys.argv[2] if len(sys.argv) > 2 else 'face_index.json'
    
    test_with_different_tolerances(selfie_path, index_file)

