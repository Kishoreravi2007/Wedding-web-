"""
Example usage of the FaceProcessor class for Wedding Web face recognition system.
This script demonstrates how to use the face recognition processor to index galleries
and search for guests in wedding photos.
"""

from face_processor import FaceProcessor
import os


def example_index_gallery():
    """Example: Index a gallery of wedding photos."""
    print("=" * 60)
    print("Example 1: Indexing Gallery Photos")
    print("=" * 60)
    
    # Initialize processor with CNN model for high accuracy
    processor = FaceProcessor(
        index_file='face_index.json',
        model='cnn',  # Use CNN for better accuracy, especially for background faces
        tolerance=0.6
    )
    
    # Path to your wedding gallery folder
    gallery_folder = 'uploads/wedding_gallery/sister_a'  # Update this path
    
    if not os.path.exists(gallery_folder):
        print(f"⚠️  Gallery folder not found: {gallery_folder}")
        print("   Please update the gallery_folder path in this script.")
        return
    
    # Index the gallery (scans all photos and detects faces)
    print(f"\n📸 Indexing gallery: {gallery_folder}")
    stats = processor.index_gallery(
        gallery_folder=gallery_folder,
        recursive=True,  # Scan subdirectories too
        update_existing=False  # Skip already indexed photos
    )
    
    print(f"\n✅ Indexing complete!")
    print(f"   Processed: {stats['processed']} photos")
    print(f"   Faces found: {stats['faces_found']} faces")
    print(f"   Errors: {stats['errors']}")
    print(f"   Skipped: {stats['skipped']}")
    
    # Show index statistics
    index_stats = processor.get_index_stats()
    print(f"\n📊 Index Statistics:")
    print(f"   Total photos indexed: {index_stats['total_photos']}")
    print(f"   Total faces indexed: {index_stats['total_faces']}")
    print(f"   Average faces per photo: {index_stats['average_faces_per_photo']:.2f}")


def example_search_face():
    """Example: Search for a guest's face in the indexed gallery."""
    print("\n" + "=" * 60)
    print("Example 2: Searching for Guest Face")
    print("=" * 60)
    
    # Initialize processor (must use same index_file and settings as indexing)
    processor = FaceProcessor(
        index_file='face_index.json',
        model='cnn',
        tolerance=0.6
    )
    
    # Path to guest's selfie
    guest_selfie = 'guest_selfie.jpg'  # Update this path
    
    if not os.path.exists(guest_selfie):
        print(f"⚠️  Guest selfie not found: {guest_selfie}")
        print("   Please update the guest_selfie path in this script.")
        return
    
    print(f"\n🔍 Searching for guest face: {guest_selfie}")
    
    # Search for the face
    matches = processor.search_face(guest_selfie, return_scores=False)
    
    if matches:
        print(f"\n✅ Found {len(matches)} matching photo(s):")
        for i, filename in enumerate(matches, 1):
            print(f"   {i}. {filename}")
    else:
        print("\n❌ No matching photos found.")
        print("   Try:")
        print("   - Using a clearer selfie with good lighting")
        print("   - Adjusting tolerance (currently 0.6)")
        print("   - Checking if the gallery was properly indexed")


def example_search_with_scores():
    """Example: Search with match scores to see confidence levels."""
    print("\n" + "=" * 60)
    print("Example 3: Searching with Match Scores")
    print("=" * 60)
    
    processor = FaceProcessor(
        index_file='face_index.json',
        model='cnn',
        tolerance=0.6
    )
    
    guest_selfie = 'guest_selfie.jpg'  # Update this path
    
    if not os.path.exists(guest_selfie):
        print(f"⚠️  Guest selfie not found: {guest_selfie}")
        return
    
    print(f"\n🔍 Searching for guest face with scores: {guest_selfie}")
    
    # Search with scores (returns tuples of (filename, distance))
    matches = processor.search_face(guest_selfie, return_scores=True)
    
    if matches:
        print(f"\n✅ Found {len(matches)} matching photo(s) (sorted by best match):")
        for i, (filename, distance) in enumerate(matches[:10], 1):  # Show top 10
            # Convert distance to similarity percentage (lower distance = better match)
            similarity = (1 - distance) * 100
            print(f"   {i}. {filename}")
            print(f"      Match distance: {distance:.4f} | Similarity: {similarity:.1f}%")
    else:
        print("\n❌ No matching photos found.")


def example_workflow():
    """Complete workflow example: Index gallery then search."""
    print("\n" + "=" * 60)
    print("Complete Workflow Example")
    print("=" * 60)
    
    # Step 1: Index the gallery
    processor = FaceProcessor(
        index_file='wedding_face_index.json',
        model='cnn',  # High accuracy model
        tolerance=0.6  # Standard tolerance
    )
    
    gallery_folder = 'uploads/wedding_gallery/sister_a'
    
    if os.path.exists(gallery_folder):
        print("\n📸 Step 1: Indexing gallery...")
        stats = processor.index_gallery(gallery_folder)
        print(f"✅ Indexed {stats['faces_found']} faces from {stats['processed']} photos")
    else:
        print(f"⚠️  Gallery folder not found: {gallery_folder}")
        return
    
    # Step 2: Search for guest
    guest_selfie = 'guest_selfie.jpg'
    
    if os.path.exists(guest_selfie):
        print("\n🔍 Step 2: Searching for guest...")
        matches = processor.search_face(guest_selfie)
        
        if matches:
            print(f"✅ Found guest in {len(matches)} photo(s)!")
            for filename in matches[:5]:  # Show first 5
                print(f"   - {filename}")
        else:
            print("❌ Guest not found in gallery.")
    else:
        print(f"⚠️  Guest selfie not found: {guest_selfie}")


if __name__ == "__main__":
    print("\n" + "🎭 " * 20)
    print("Wedding Web - Face Recognition Processor Examples")
    print("🎭 " * 20)
    
    # Run examples (comment out any you don't want to run)
    
    # Example 1: Index a gallery
    # example_index_gallery()
    
    # Example 2: Search for a face
    # example_search_face()
    
    # Example 3: Search with scores
    # example_search_with_scores()
    
    # Complete workflow
    example_workflow()
    
    print("\n" + "=" * 60)
    print("Examples complete!")
    print("=" * 60)

