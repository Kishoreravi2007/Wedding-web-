"""
Complete fix script for face detection and false positive issues.
This script will:
1. Clear old index (if needed)
2. Re-index gallery with optimal settings
3. Test detection on sample photos
4. Verify search accuracy
"""

import os
import sys
import logging
from face_processor import FaceProcessor

# Enable detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def clear_and_reindex(gallery_folder, index_file='face_index.json', force_clear=False):
    """Clear old index and re-index with optimal settings."""
    
    print("=" * 70)
    print("Step 1: Clearing Old Index (if exists)")
    print("=" * 70)
    
    processor = FaceProcessor(index_file=index_file, model='cnn', tolerance=0.45)
    
    if os.path.exists(index_file) and force_clear:
        processor.clear_index()
        print(f"✅ Cleared old index: {index_file}")
    elif os.path.exists(index_file):
        stats = processor.get_index_stats()
        print(f"⚠️  Existing index found: {stats['total_photos']} photos, {stats['total_faces']} faces")
        response = input("Clear and re-index? (y/n): ")
        if response.lower() == 'y':
            processor.clear_index()
            print(f"✅ Cleared old index")
        else:
            print("⏭️  Skipping clear - will update existing index")
    
    print("\n" + "=" * 70)
    print("Step 2: Indexing Gallery with Optimal Settings")
    print("=" * 70)
    print(f"Gallery: {gallery_folder}")
    print(f"Settings:")
    print(f"  - Model: CNN (best for group photos)")
    print(f"  - Min face size: 15px (detects small background faces)")
    print(f"  - Filter small faces: False (detects all faces)")
    print(f"  - Tolerance: 0.45 (stricter matching)")
    print()
    
    # Index with optimal settings for group photos
    stats = processor.index_gallery(
        gallery_folder,
        min_face_size=15,          # Very low threshold - detects small faces
        filter_small_faces=False,  # Don't filter - detect all
        recursive=True,
        update_existing=True       # Re-index everything
    )
    
    print(f"\n✅ Indexing Complete!")
    print(f"   Photos processed: {stats['processed']}")
    print(f"   Faces found: {stats['faces_found']}")
    print(f"   Errors: {stats['errors']}")
    print(f"   Skipped: {stats['skipped']}")
    
    if stats['processed'] > 0:
        avg_faces = stats['faces_found'] / stats['processed']
        print(f"   Average: {avg_faces:.1f} faces per photo")
        
        if avg_faces < 3:
            print(f"\n   ⚠️  WARNING: Very low face count!")
            print(f"      This might indicate detection issues.")
            print(f"      Check:")
            print(f"      1. Photo quality and lighting")
            print(f"      2. If faces are clearly visible")
            print(f"      3. Try lower min_face_size (10-12)")
        elif avg_faces >= 10:
            print(f"\n   ✅ Good! Detecting many faces (perfect for group photos)")
    
    return processor, stats


def test_detection_on_photo(processor, test_photo):
    """Test face detection on a single photo."""
    print("\n" + "=" * 70)
    print("Step 3: Testing Face Detection")
    print("=" * 70)
    
    if not os.path.exists(test_photo):
        print(f"⚠️  Test photo not found: {test_photo}")
        print("   Skipping detection test")
        return
    
    print(f"Testing: {test_photo}")
    
    _, face_encodings, face_locations = processor._detect_faces_in_image(
        test_photo,
        min_face_size=15,
        filter_small_faces=False
    )
    
    print(f"\n✅ Detection Results:")
    print(f"   Faces detected: {len(face_encodings)}")
    
    if face_encodings:
        sizes = [max(r-l, b-t) for t, r, b, l in face_locations]
        print(f"   Face sizes: {min(sizes)}px - {max(sizes)}px (avg: {sum(sizes)/len(sizes):.1f}px)")
        print(f"   ✅ Detection is working!")
    else:
        print(f"   ❌ No faces detected!")
        print(f"\n   Troubleshooting:")
        print(f"   1. Check if photo has clear faces")
        print(f"   2. Try with min_face_size=10 (even lower)")
        print(f"   3. Check image quality and resolution")


def test_search_accuracy(processor, selfie_path):
    """Test face search with strict settings."""
    print("\n" + "=" * 70)
    print("Step 4: Testing Face Search Accuracy")
    print("=" * 70)
    
    if not os.path.exists(selfie_path):
        print(f"⚠️  Selfie not found: {selfie_path}")
        print("   Skipping search test")
        return
    
    print(f"Searching for: {selfie_path}")
    print(f"Settings:")
    print(f"  - Tolerance: 0.45 (strict)")
    print(f"  - Strict mode: True")
    print()
    
    # Search with strict settings
    matches = processor.search_face(
        selfie_path,
        return_scores=True,
        strict_mode=True
    )
    
    if matches:
        print(f"✅ Found {len(matches)} potential matches:")
        print(f"\n   Top 10 matches (sorted by best match):")
        
        high_confidence = []
        medium_confidence = []
        low_confidence = []
        
        for i, (filename, distance) in enumerate(matches[:10], 1):
            confidence = (1 - distance) * 100
            
            if distance < 0.40:
                status = "✅ EXCELLENT"
                high_confidence.append((filename, distance))
            elif distance < 0.45:
                status = "✅ GOOD"
                medium_confidence.append((filename, distance))
            else:
                status = "⚠️  CHECK"
                low_confidence.append((filename, distance))
            
            print(f"   {i}. {os.path.basename(filename)}")
            print(f"      Distance: {distance:.4f} | Confidence: {confidence:.1f}% | {status}")
        
        print(f"\n   Summary:")
        print(f"   - High confidence (distance < 0.40): {len(high_confidence)} matches")
        print(f"   - Medium confidence (0.40-0.45): {len(medium_confidence)} matches")
        print(f"   - Low confidence (>0.45): {len(low_confidence)} matches")
        
        if low_confidence:
            print(f"\n   ⚠️  Consider:")
            print(f"      - Lower tolerance to 0.40 for stricter matching")
            print(f"      - Verify if low confidence matches are correct")
    else:
        print(f"❌ No matches found")
        print(f"\n   Try:")
        print(f"   1. Ensure selfie has clear, front-facing face")
        print(f"   2. Check if person exists in gallery")
        print(f"   3. Increase tolerance to 0.50 (if needed)")


def main():
    """Main fix routine."""
    print("\n" + "🔧 " * 20)
    print("Face Detection & Accuracy Fix Script")
    print("🔧 " * 20)
    
    # Get arguments
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python fix_face_detection.py <gallery_folder> [index_file] [selfie_path]")
        print("\nExamples:")
        print("  python fix_face_detection.py uploads/wedding_gallery/sister_a")
        print("  python fix_face_detection.py uploads/wedding_gallery/sister_a face_index.json guest_selfie.jpg")
        sys.exit(1)
    
    gallery_folder = sys.argv[1]
    index_file = sys.argv[2] if len(sys.argv) > 2 else 'face_index.json'
    selfie_path = sys.argv[3] if len(sys.argv) > 3 else None
    
    # Verify gallery exists
    if not os.path.exists(gallery_folder):
        print(f"❌ Gallery folder not found: {gallery_folder}")
        sys.exit(1)
    
    # Step 1 & 2: Clear and re-index
    processor, stats = clear_and_reindex(gallery_folder, index_file, force_clear=False)
    
    # Step 3: Test detection on first photo (if available)
    image_files = []
    for root, dirs, files in os.walk(gallery_folder):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                image_files.append(os.path.join(root, file))
                break
        if image_files:
            break
    
    if image_files:
        test_detection_on_photo(processor, image_files[0])
    
    # Step 4: Test search (if selfie provided)
    if selfie_path:
        test_search_accuracy(processor, selfie_path)
    
    # Final summary
    print("\n" + "=" * 70)
    print("Fix Complete!")
    print("=" * 70)
    print(f"\n✅ Index file: {index_file}")
    final_stats = processor.get_index_stats()
    print(f"✅ Total photos: {final_stats['total_photos']}")
    print(f"✅ Total faces: {final_stats['total_faces']}")
    print(f"✅ Avg faces/photo: {final_stats['average_faces_per_photo']:.1f}")
    
    print(f"\n📝 Next steps:")
    print(f"   1. Test face search: python face_processor.py --search your_selfie.jpg")
    print(f"   2. If still issues, try tolerance=0.40 for stricter matching")
    print(f"   3. Check logs for detailed detection information")
    
    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()

