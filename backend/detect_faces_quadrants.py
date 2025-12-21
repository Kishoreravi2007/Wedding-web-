"""
Quadrant-Based Face Detection for High-Resolution Wedding Photos

This script splits a high-resolution wedding photo into 4 overlapping quadrants,
runs face detection on each quadrant, and merges the results. This approach helps
detect small faces that might be missed when processing the full image at once.

Usage:
    python detect_faces_quadrants.py <image_path> [--overlap 0.2] [--min-face-size 20] [--output-dir ./output]
"""

import os
import sys
import argparse
import numpy as np
import face_recognition
from PIL import Image
from typing import List, Tuple, Dict
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class QuadrantFaceDetector:
    """
    Detects faces in high-resolution images by splitting into overlapping quadrants.
    """
    
    def __init__(
        self,
        overlap_ratio: float = 0.2,
        min_face_size: int = 20,
        model: str = 'cnn',
        number_of_times_to_upsample: int = 2
    ):
        """
        Initialize the quadrant face detector.
        
        Args:
            overlap_ratio: Overlap between quadrants (0.0-0.5). Higher = more overlap, 
                          better for avoiding face cuts at boundaries. Default: 0.2 (20%)
            min_face_size: Minimum face size in pixels to accept
            model: Detection model ('cnn' or 'hog'). 'cnn' is more accurate but slower
            number_of_times_to_upsample: How many times to upsample the image for detection
                                       (higher = better for small faces, but slower)
        """
        self.overlap_ratio = overlap_ratio
        self.min_face_size = min_face_size
        self.model = model
        self.number_of_times_to_upsample = number_of_times_to_upsample
        
        if model not in ['cnn', 'hog']:
            raise ValueError(f"Model must be 'cnn' or 'hog', got '{model}'")
    
    def split_into_quadrants(self, image: np.ndarray) -> List[Tuple[np.ndarray, Tuple[int, int]]]:
        """
        Split image into 4 overlapping quadrants.
        
        Args:
            image: Image as numpy array (from face_recognition.load_image_file)
            
        Returns:
            List of tuples: (quadrant_image, (offset_x, offset_y))
            where offset is the position of the quadrant in the original image
        """
        height, width = image.shape[:2]
        
        # Calculate overlap in pixels
        overlap_x = int(width * self.overlap_ratio)
        overlap_y = int(height * self.overlap_ratio)
        
        # Calculate quadrant dimensions
        quadrant_width = width // 2 + overlap_x
        quadrant_height = height // 2 + overlap_y
        
        quadrants = []
        
        # Top-left quadrant
        quadrants.append((
            image[0:quadrant_height, 0:quadrant_width],
            (0, 0)
        ))
        
        # Top-right quadrant
        quadrants.append((
            image[0:quadrant_height, width - quadrant_width:width],
            (width - quadrant_width, 0)
        ))
        
        # Bottom-left quadrant
        quadrants.append((
            image[height - quadrant_height:height, 0:quadrant_width],
            (0, height - quadrant_height)
        ))
        
        # Bottom-right quadrant
        quadrants.append((
            image[height - quadrant_height:height, width - quadrant_width:width],
            (width - quadrant_width, height - quadrant_height)
        ))
        
        logger.info(f"Split image ({width}x{height}) into 4 quadrants with {overlap_x}x{overlap_y} overlap")
        return quadrants
    
    def detect_faces_in_quadrant(
        self,
        quadrant_image: np.ndarray,
        quadrant_index: int
    ) -> Tuple[List[Tuple[int, int, int, int]], List]:
        """
        Detect faces in a single quadrant.
        
        Args:
            quadrant_image: Quadrant image as numpy array
            quadrant_index: Index of the quadrant (0-3) for logging
            
        Returns:
            Tuple of (face_locations, face_encodings)
            face_locations are in quadrant coordinates
        """
        try:
            # Detect face locations
            face_locations = face_recognition.face_locations(
                quadrant_image,
                model=self.model,
                number_of_times_to_upsample=self.number_of_times_to_upsample
            )
            
            if not face_locations:
                logger.debug(f"  Quadrant {quadrant_index + 1}: No faces detected")
                return [], []
            
            # Filter by minimum face size
            valid_face_locations = []
            for top, right, bottom, left in face_locations:
                face_width = right - left
                face_height = bottom - top
                face_size = max(face_width, face_height)
                
                if face_size >= self.min_face_size:
                    valid_face_locations.append((top, right, bottom, left))
                else:
                    logger.debug(f"  Quadrant {quadrant_index + 1}: Skipping small face ({face_size}px < {self.min_face_size}px)")
            
            if not valid_face_locations:
                logger.debug(f"  Quadrant {quadrant_index + 1}: No valid faces after size filtering")
                return [], []
            
            # Get face encodings
            face_encodings = face_recognition.face_encodings(
                quadrant_image,
                known_face_locations=valid_face_locations,
                num_jitters=1
            )
            
            logger.info(f"  Quadrant {quadrant_index + 1}: Found {len(valid_face_locations)} face(s)")
            return valid_face_locations, face_encodings
            
        except Exception as e:
            logger.error(f"  Quadrant {quadrant_index + 1}: Error detecting faces - {e}")
            return [], []
    
    def transform_coordinates(
        self,
        face_location: Tuple[int, int, int, int],
        offset: Tuple[int, int]
    ) -> Tuple[int, int, int, int]:
        """
        Transform face coordinates from quadrant space to original image space.
        
        Args:
            face_location: (top, right, bottom, left) in quadrant coordinates
            offset: (offset_x, offset_y) of the quadrant in original image
            
        Returns:
            (top, right, bottom, left) in original image coordinates
        """
        top, right, bottom, left = face_location
        offset_x, offset_y = offset
        
        return (
            top + offset_y,
            right + offset_x,
            bottom + offset_y,
            left + offset_x
        )
    
    def calculate_iou(
        self,
        box1: Tuple[int, int, int, int],
        box2: Tuple[int, int, int, int]
    ) -> float:
        """
        Calculate Intersection over Union (IoU) of two bounding boxes.
        
        Args:
            box1, box2: (top, right, bottom, left) bounding boxes
            
        Returns:
            IoU value between 0 and 1
        """
        top1, right1, bottom1, left1 = box1
        top2, right2, bottom2, left2 = box2
        
        # Calculate intersection
        inter_top = max(top1, top2)
        inter_left = max(left1, left2)
        inter_bottom = min(bottom1, bottom2)
        inter_right = min(right1, right2)
        
        if inter_bottom <= inter_top or inter_right <= inter_left:
            return 0.0
        
        inter_area = (inter_bottom - inter_top) * (inter_right - inter_left)
        
        # Calculate union
        box1_area = (bottom1 - top1) * (right1 - left1)
        box2_area = (bottom2 - top2) * (right2 - left2)
        union_area = box1_area + box2_area - inter_area
        
        if union_area == 0:
            return 0.0
        
        return inter_area / union_area
    
    def merge_duplicate_faces(
        self,
        all_faces: List[Dict]
    ) -> List[Dict]:
        """
        Merge duplicate faces that appear in multiple overlapping quadrants.
        
        Args:
            all_faces: List of face dictionaries with 'location', 'encoding', 'quadrant'
            
        Returns:
            List of merged faces (duplicates removed)
        """
        if len(all_faces) <= 1:
            return all_faces
        
        # Sort by quadrant (to prefer faces from earlier quadrants when merging)
        all_faces.sort(key=lambda x: x['quadrant'])
        
        merged_faces = []
        used_indices = set()
        
        for i, face1 in enumerate(all_faces):
            if i in used_indices:
                continue
            
            # Find duplicates (high IoU or very similar encoding)
            duplicates = [i]
            
            for j, face2 in enumerate(all_faces[i+1:], start=i+1):
                if j in used_indices:
                    continue
                
                # Check IoU (overlapping boxes)
                iou = self.calculate_iou(face1['location'], face2['location'])
                
                # Check encoding similarity (if both have encodings)
                encoding_similarity = 0.0
                if face1.get('encoding') is not None and face2.get('encoding') is not None:
                    try:
                        distance = face_recognition.face_distance(
                            [face1['encoding']],
                            face2['encoding']
                        )[0]
                        encoding_similarity = 1.0 - distance  # Convert distance to similarity
                    except:
                        pass
                
                # Consider it a duplicate if:
                # - High IoU (>0.5) OR
                # - Very similar encoding (>0.95 similarity) with some overlap (IoU >0.1)
                if iou > 0.5 or (encoding_similarity > 0.95 and iou > 0.1):
                    duplicates.append(j)
            
            # Merge duplicates: keep the one with best encoding or largest size
            if len(duplicates) > 1:
                best_face = face1
                best_score = 0
                
                for dup_idx in duplicates:
                    dup_face = all_faces[dup_idx]
                    top, right, bottom, left = dup_face['location']
                    face_size = (bottom - top) * (right - left)
                    
                    # Score: prefer faces with encodings and larger size
                    score = face_size
                    if dup_face.get('encoding') is not None:
                        score *= 1.5  # Bonus for having encoding
                    
                    if score > best_score:
                        best_score = score
                        best_face = dup_face
                
                merged_faces.append(best_face)
                used_indices.update(duplicates)
                logger.debug(f"Merged {len(duplicates)} duplicate face(s), kept best one")
            else:
                merged_faces.append(face1)
                used_indices.add(i)
        
        return merged_faces
    
    def detect_faces(
        self,
        image_path: str
    ) -> Dict:
        """
        Main method: detect faces in image using quadrant approach.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dictionary with:
            - 'faces': List of face dictionaries with 'location', 'encoding', 'quadrant'
            - 'total_detected': Total faces before merging
            - 'total_merged': Total faces after merging
            - 'quadrant_stats': Statistics per quadrant
        """
        logger.info(f"Processing image: {image_path}")
        
        # Load image
        try:
            image = face_recognition.load_image_file(image_path)
            height, width = image.shape[:2]
            logger.info(f"Image dimensions: {width}x{height}")
        except Exception as e:
            logger.error(f"Failed to load image: {e}")
            return {
                'faces': [],
                'total_detected': 0,
                'total_merged': 0,
                'quadrant_stats': {}
            }
        
        # Split into quadrants
        quadrants = self.split_into_quadrants(image)
        
        # Detect faces in each quadrant
        all_faces = []
        quadrant_stats = {}
        
        for idx, (quadrant_image, offset) in enumerate(quadrants):
            logger.info(f"Processing quadrant {idx + 1}/4...")
            
            face_locations, face_encodings = self.detect_faces_in_quadrant(
                quadrant_image,
                idx
            )
            
            # Transform coordinates to original image space
            for face_loc, face_enc in zip(face_locations, face_encodings):
                original_location = self.transform_coordinates(face_loc, offset)
                
                all_faces.append({
                    'location': original_location,
                    'encoding': face_enc,
                    'quadrant': idx
                })
            
            quadrant_stats[f'quadrant_{idx + 1}'] = {
                'faces_detected': len(face_locations),
                'offset': offset
            }
        
        total_detected = len(all_faces)
        logger.info(f"Total faces detected across all quadrants: {total_detected}")
        
        # Merge duplicates
        logger.info("Merging duplicate faces from overlapping quadrants...")
        merged_faces = self.merge_duplicate_faces(all_faces)
        total_merged = len(merged_faces)
        
        logger.info(f"Final result: {total_merged} unique face(s) (merged from {total_detected} detections)")
        
        return {
            'faces': merged_faces,
            'total_detected': total_detected,
            'total_merged': total_merged,
            'quadrant_stats': quadrant_stats
        }
    
    def visualize_results(
        self,
        image_path: str,
        faces: List[Dict],
        output_path: str = None
    ):
        """
        Visualize detected faces on the original image.
        
        Args:
            image_path: Path to original image
            faces: List of face dictionaries with 'location'
            output_path: Path to save visualization (optional)
        """
        try:
            from PIL import Image, ImageDraw, ImageFont
            
            # Load image
            img = Image.open(image_path)
            draw = ImageDraw.Draw(img)
            
            # Draw bounding boxes
            for i, face in enumerate(faces):
                top, right, bottom, left = face['location']
                
                # Draw rectangle
                draw.rectangle(
                    [(left, top), (right, bottom)],
                    outline='red',
                    width=3
                )
                
                # Draw face number
                draw.text(
                    (left, top - 20),
                    f"Face {i + 1}",
                    fill='red'
                )
            
            # Save or show
            if output_path:
                img.save(output_path)
                logger.info(f"Visualization saved to: {output_path}")
            else:
                img.show()
                
        except Exception as e:
            logger.warning(f"Could not create visualization: {e}")


def main():
    parser = argparse.ArgumentParser(
        description='Detect faces in high-resolution wedding photos using quadrant splitting'
    )
    parser.add_argument(
        'image_path',
        type=str,
        help='Path to the wedding photo'
    )
    parser.add_argument(
        '--overlap',
        type=float,
        default=0.2,
        help='Overlap ratio between quadrants (0.0-0.5, default: 0.2)'
    )
    parser.add_argument(
        '--min-face-size',
        type=int,
        default=20,
        help='Minimum face size in pixels (default: 20)'
    )
    parser.add_argument(
        '--model',
        type=str,
        default='cnn',
        choices=['cnn', 'hog'],
        help='Detection model: cnn (accurate, slow) or hog (fast, less accurate)'
    )
    parser.add_argument(
        '--upsample',
        type=int,
        default=2,
        help='Number of times to upsample image for detection (default: 2)'
    )
    parser.add_argument(
        '--output-dir',
        type=str,
        default='./output',
        help='Directory to save visualization (default: ./output)'
    )
    parser.add_argument(
        '--visualize',
        action='store_true',
        help='Create visualization with bounding boxes'
    )
    parser.add_argument(
        '--no-merge',
        action='store_true',
        help='Skip duplicate merging (show all detections)'
    )
    
    args = parser.parse_args()
    
    # Validate image path
    if not os.path.exists(args.image_path):
        logger.error(f"Image not found: {args.image_path}")
        sys.exit(1)
    
    # Create output directory if needed
    if args.visualize:
        os.makedirs(args.output_dir, exist_ok=True)
    
    # Initialize detector
    detector = QuadrantFaceDetector(
        overlap_ratio=args.overlap,
        min_face_size=args.min_face_size,
        model=args.model,
        number_of_times_to_upsample=args.upsample
    )
    
    # Detect faces
    results = detector.detect_faces(args.image_path)
    
    # Print results
    print("\n" + "="*60)
    print("FACE DETECTION RESULTS")
    print("="*60)
    print(f"Total faces detected (before merging): {results['total_detected']}")
    print(f"Unique faces (after merging): {results['total_merged']}")
    print("\nQuadrant Statistics:")
    for quadrant, stats in results['quadrant_stats'].items():
        print(f"  {quadrant}: {stats['faces_detected']} face(s)")
    
    if results['faces']:
        print("\nFace Locations (top, right, bottom, left):")
        for i, face in enumerate(results['faces'], 1):
            top, right, bottom, left = face['location']
            width = right - left
            height = bottom - top
            size = max(width, height)
            print(f"  Face {i}: ({top}, {right}, {bottom}, {left}) - Size: {size}px")
    
    # Visualize if requested
    if args.visualize and results['faces']:
        image_name = Path(args.image_path).stem
        output_path = os.path.join(
            args.output_dir,
            f"{image_name}_faces_detected.jpg"
        )
        detector.visualize_results(
            args.image_path,
            results['faces'],
            output_path
        )
    
    print("\n" + "="*60)


if __name__ == "__main__":
    main()

