"""
Test script to verify face detection in group photos.
This helps diagnose if faces are being detected correctly.
"""

import sys
import os
import logging
from face_processor import FaceProcessor

# Enable detailed logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_single_photo(image_path, min_face_size=20, filter_small=False):
    """Test face detection on a single photo."""
    print("=" * 70)
    print(f"Testing Face Detection: {os.path.basename(image_path)}")
    print("=" * 70)
    
    if not os.path.exists(image_path):
        print(f"❌ Image not found: {image_path}")
        return
    
    processor = FaceProcessor(model='cnn')
    
    # Test detection
    _, face_encodings, face_locations = processor._detect_faces_in_image(
        image_path,
        min_face_size=min_face_size,
        filter_small_faces=filter_small
    )
    
    print(f"\n📸 Image: {image_path}")
    print(f"🔍 Detection Settings:")
    print(f"   Model: CNN")
    print(f"   Min face size: {min_face_size}px")
    print(f"   Filter small faces: {filter_small}")
    
    print(f"\n✅ Results:")
    print(f"   Faces detected: {len(face_encodings)}")
    print(f"   Face locations: {len(face_locations)}")
    
    if face_locations:
        print(f"\n   Face sizes:")
        for i, (top, right, bottom, left) in enumerate(face_locations, 1):
            width = right - left
            height = bottom - top
            size = max(width, height)
            area = width * height
            print(f"   Face {i}: {width}x{height}px (max: {size}px, area: {area}px²)")
        
        # Statistics
        sizes = [max(r-l, b-t) for t, r, b, l in face_locations]
        print(f"\n   Statistics:")
        print(f"   Smallest face: {min(sizes)}px")
        print(f"   Largest face: {max(sizes)}px")
        print(f"   Average size: {sum(sizes)/len(sizes):.1f}px")
        
        # Check how many would be filtered
        if filter_small:
            filtered_count = sum(1 for s in sizes if s < min_face_size)
            print(f"\n   ⚠️  With filtering: {filtered_count} faces would be rejected")
            print(f"      (kept: {len(sizes) - filtered_count} faces)")
    else:
        print(f"\n❌ No faces detected!")
        print(f"\n   Troubleshooting:")
        print(f"   1. Check if image has clear faces")
        print(f"   2. Try lowering min_face_size (current: {min_face_size})")
        print(f"   3. Ensure image is not corrupted")
        print(f"   4. Check image resolution and quality")
    
    print()


def test_with_different_settings(image_path):
    """Test the same photo with different settings."""
    print("\n" + "=" * 70)
    print("Testing Different Settings")
    print("=" * 70)
    
    settings = [
        (20, False, "Recommended for group photos"),
        (30, False, "Slightly stricter"),
        (20, True, "With filtering (not recommended)"),
        (50, True, "Old settings (very strict)")
    ]
    
    for min_size, filter_small, description in settings:
        print(f"\n📋 Setting: min_size={min_size}, filter={filter_small}")
        print(f"   {description}")
        _, face_encodings, _ = FaceProcessor(model='cnn')._detect_faces_in_image(
            image_path,
            min_face_size=min_size,
            filter_small_faces=filter_small
        )
        print(f"   ✅ Detected: {len(face_encodings)} faces")


def test_gallery_indexing(gallery_folder, index_file='test_index.json'):
    """Test indexing a small gallery."""
    print("\n" + "=" * 70)
    print("Testing Gallery Indexing")
    print("=" * 70)
    
    if not os.path.exists(gallery_folder):
        print(f"❌ Gallery folder not found: {gallery_folder}")
        return
    
    processor = FaceProcessor(
        index_file=index_file,
        model='cnn'
    )
    
    # Index with group photo settings
    print(f"📁 Indexing: {gallery_folder}")
    print(f"   Settings: min_size=20, filter_small=False")
    
    stats = processor.index_gallery(
        gallery_folder,
        min_face_size=20,
        filter_small_faces=False,
        recursive=True,
        update_existing=True
    )
    
    print(f"\n✅ Indexing Results:")
    print(f"   Photos processed: {stats['processed']}")
    print(f"   Faces found: {stats['faces_found']}")
    print(f"   Errors: {stats['errors']}")
    print(f"   Skipped: {stats['skipped']}")
    
    if stats['processed'] > 0:
        avg_faces = stats['faces_found'] / stats['processed']
        print(f"\n   Average faces per photo: {avg_faces:.1f}")
        
        if avg_faces < 5:
            print(f"\n   ⚠️  Low face count detected!")
            print(f"      Try: min_face_size=15 or filter_small_faces=False")
        elif avg_faces > 30:
            print(f"\n   ✅ Excellent! Detecting many faces (good for group photos)")
    
    # Show index stats
    index_stats = processor.get_index_stats()
    print(f"\n📊 Index Statistics:")
    print(f"   Total photos: {index_stats['total_photos']}")
    print(f"   Total faces: {index_stats['total_faces']}")
    print(f"   Avg faces/photo: {index_stats['average_faces_per_photo']:.1f}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python test_group_photo_detection.py <image_path>")
        print("  python test_group_photo_detection.py <image_path> --gallery <folder>")
        print()
        print("Examples:")
        print("  python test_group_photo_detection.py photo.jpg")
        print("  python test_group_photo_detection.py photo.jpg --gallery uploads/wedding_gallery/sister_a")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Test single photo
    print("🧪 Face Detection Test for Group Photos")
    print("=" * 70)
    test_single_photo(image_path, min_face_size=20, filter_small=False)
    
    # Test with different settings
    test_with_different_settings(image_path)
    
    # Test gallery if provided
    if '--gallery' in sys.argv:
        try:
            gallery_idx = sys.argv.index('--gallery')
            gallery_folder = sys.argv[gallery_idx + 1]
            test_gallery_indexing(gallery_folder)
        except (IndexError, ValueError):
            print("\n⚠️  Invalid --gallery argument")

