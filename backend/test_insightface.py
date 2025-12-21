"""
Test script for InsightFace face detection and embedding extraction.
Demonstrates usage with a group photo.
"""

import sys
import os
from insightface_processor import InsightFaceProcessor

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_insightface.py <image_path>")
        print("Example: python test_insightface.py test_group_photo.jpg")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        sys.exit(1)
    
    print("Initializing InsightFace processor...")
    print("Note: First run will download the buffalo_l model (~300MB)")
    print()
    
    # Initialize processor
    processor = InsightFaceProcessor(
        model_name='buffalo_l',
        det_size=(640, 640),
        ctx_id=0  # Use GPU if available, else CPU
    )
    
    print("Detecting faces and extracting embeddings...")
    print()
    
    # Detect faces
    face_data = processor.detect_faces(image_path)
    
    # Print results
    print(f"{'='*60}")
    print(f"Results for: {image_path}")
    print(f"{'='*60}")
    print(f"Total faces detected: {len(face_data)}\n")
    
    for i, face_info in enumerate(face_data, 1):
        x1, y1, x2, y2 = face_info['bbox']
        width = x2 - x1
        height = y2 - y1
        
        print(f"Face {i}:")
        print(f"  Location: ({x1}, {y1}) to ({x2}, {y2})")
        print(f"  Size: {width}x{height} pixels")
        print(f"  Detection confidence: {face_info['det_score']:.4f}")
        print(f"  Embedding dimension: {len(face_info['embedding'])}")
        print(f"  Embedding (first 10 values): {face_info['embedding'][:10]}")
        
        if face_info['age'] is not None:
            gender_str = "Male" if face_info['gender'] == 1 else "Female"
            print(f"  Estimated age: {face_info['age']}")
            print(f"  Estimated gender: {gender_str}")
        
        if face_info['landmark']:
            print(f"  Facial landmarks: {len(face_info['landmark'])} points detected")
        
        print()
    
    # Visualize results
    # Create output filename by inserting _annotated before the file extension
    path_parts = os.path.splitext(image_path)
    output_path = f"{path_parts[0]}_annotated{path_parts[1]}"
    print(f"Creating annotated image: {output_path}")
    processor.visualize_faces(
        image_path,
        output_path=output_path,
        show_image=False
    )
    print(f"Saved annotated image to: {output_path}")
    
    print("\n✅ Processing complete!")

if __name__ == "__main__":
    main()

