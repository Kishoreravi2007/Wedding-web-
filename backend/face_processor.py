"""
High-Performance Face Recognition Processor for Wedding Web
Uses face_recognition (dlib) library with CNN model for optimal accuracy.
"""

import os
import json
import pickle
import numpy as np
import face_recognition
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Union
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class FaceProcessor:
    """
    High-performance face recognition processor using face_recognition (dlib) library.
    Uses CNN model for accurate face detection, especially for people in backgrounds.
    """
    
    # Supported image formats
    SUPPORTED_FORMATS = ('.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp')
    
    # Default tolerance for face matching (lower = stricter, default 0.45 for better accuracy)
    # 0.35-0.4 = very strict (fewer false positives), 0.45 = balanced, 0.5 = lenient (more false positives)
    DEFAULT_TOLERANCE = 0.45
    
    def __init__(
        self, 
        index_file: str = 'face_index.json',
        model: str = 'cnn',
        tolerance: float = DEFAULT_TOLERANCE
    ):
        """
        Initialize the FaceProcessor.
        
        Args:
            index_file: Path to the JSON/Pickle file storing face encodings
            model: Detection model to use ('cnn' or 'hog'). CNN is more accurate but slower.
            tolerance: How much distance between faces to consider it a match. Lower = stricter.
        """
        self.index_file = index_file
        self.model = model
        self.tolerance = tolerance
        
        # Validate model selection
        if model not in ['cnn', 'hog']:
            raise ValueError(f"Model must be 'cnn' or 'hog', got '{model}'")
        
        # Storage for face encodings
        # Structure: {filename: [encoding1, encoding2, ...], ...}
        self.face_index: Dict[str, List] = {}
        
        # Load existing index if available
        self._load_index()
    
    def _load_index(self) -> None:
        """Load face index from file if it exists."""
        if not os.path.exists(self.index_file):
            logger.info(f"Index file {self.index_file} not found. Starting with empty index.")
            return
        
        try:
            # Try loading as JSON first
            if self.index_file.endswith('.json'):
                with open(self.index_file, 'r') as f:
                    # JSON doesn't support numpy arrays, so we need to convert
                    data = json.load(f)
                    # Convert list encodings back to numpy arrays
                    self.face_index = {
                        filename: [np.array(enc) for enc in encodings]
                        for filename, encodings in data.items()
                    }
            else:
                # Try loading as Pickle
                with open(self.index_file, 'rb') as f:
                    self.face_index = pickle.load(f)
            
            logger.info(f"Loaded {len(self.face_index)} indexed photos from {self.index_file}")
        except Exception as e:
            logger.warning(f"Failed to load index file: {e}. Starting with empty index.")
            self.face_index = {}
    
    def _save_index(self) -> None:
        """Save face index to file."""
        try:
            if self.index_file.endswith('.json'):
                # Convert numpy arrays to lists for JSON serialization
                json_data = {
                    filename: [enc.tolist() for enc in encodings]
                    for filename, encodings in self.face_index.items()
                }
                with open(self.index_file, 'w') as f:
                    json.dump(json_data, f, indent=2)
            else:
                # Save as Pickle (supports numpy arrays natively)
                with open(self.index_file, 'wb') as f:
                    pickle.dump(self.face_index, f)
            
            logger.info(f"Saved face index to {self.index_file}")
        except Exception as e:
            logger.error(f"Failed to save index file: {e}")
            raise
    
    def _is_image_file(self, filepath: str) -> bool:
        """Check if file is a supported image format."""
        return Path(filepath).suffix.lower() in self.SUPPORTED_FORMATS
    
    def _detect_faces_in_image(
        self, 
        image_path: str, 
        min_face_size: int = 20,
        filter_small_faces: bool = True
    ) -> Tuple[Optional[np.ndarray], List, List]:
        """
        Detect faces in an image and return face encodings with quality checks.
        
        Args:
            image_path: Path to the image file
            min_face_size: Minimum face size in pixels (width or height) to accept.
                          Lower value = detects more faces (including in background).
                          Recommended: 20-30 for group photos, 50+ for selfies.
            filter_small_faces: If False, accepts all detected faces regardless of size
                              (useful for group photos with background faces)
            
        Returns:
            Tuple of (image_array, list_of_face_encodings, list_of_face_locations)
            Returns (None, [], []) if no faces detected or error occurred
        """
        try:
            # Load image using face_recognition library
            image = face_recognition.load_image_file(image_path)
            
            # Detect face locations using the specified model
            # For group photos, CNN model works better for detecting faces in background
            # number_of_times_to_upsample=1 is faster, 2 is more accurate but slower
            face_locations = face_recognition.face_locations(
                image, 
                model=self.model,
                number_of_times_to_upsample=1  # Upsample once for better small face detection
            )
            
            if not face_locations:
                logger.warning(f"⚠️  No faces detected in {image_path}")
                logger.info(f"   Try: Check image quality, lighting, or face visibility")
                return image, [], []
            
            logger.info(f"Found {len(face_locations)} face(s) detected in {image_path}")
            
            # Filter faces by size only if filtering is enabled
            valid_face_locations = []
            if filter_small_faces:
                for top, right, bottom, left in face_locations:
                    face_width = right - left
                    face_height = bottom - top
                    face_size = max(face_width, face_height)
                    
                    if face_size >= min_face_size:
                        valid_face_locations.append((top, right, bottom, left))
                    else:
                        logger.debug(f"Skipping very small face in {image_path}: {face_size}px (min: {min_face_size}px)")
            else:
                # Accept all detected faces (important for group photos)
                valid_face_locations = face_locations
                logger.info(f"Accepting all {len(face_locations)} detected faces (filter_small_faces=False)")
            
            if not valid_face_locations:
                logger.debug(f"No valid faces (size >= {min_face_size}px) detected in {image_path}")
                return image, [], []
            
            # Get face encodings for detected faces
            # Use num_jitters for better accuracy with various face angles
            face_encodings = face_recognition.face_encodings(
                image, 
                known_face_locations=valid_face_locations,
                num_jitters=1  # More jitters = better accuracy (default is 1)
            )
            
            logger.info(f"Successfully encoded {len(face_encodings)} face(s) in {image_path}")
            return image, face_encodings, valid_face_locations
            
        except Exception as e:
            logger.error(f"Error processing {image_path}: {e}")
            import traceback
            logger.error(traceback.format_exc())
            return None, [], []
    
    def index_gallery(
        self, 
        gallery_folder: str, 
        recursive: bool = True,
        update_existing: bool = False,
        min_face_size: int = 15,
        filter_small_faces: bool = False
    ) -> Dict[str, int]:
        """
        Scan a folder of wedding photos and index all faces.
        
        Args:
            gallery_folder: Path to folder containing wedding photos
            recursive: Whether to scan subdirectories recursively
            update_existing: Whether to re-index photos that are already indexed
            min_face_size: Minimum face size in pixels (default: 15 for group photos).
                          Set to 15-20 to detect faces in background of group photos.
                          Lower values detect more faces but may include false positives.
            filter_small_faces: If False, indexes all detected faces including small ones
                               (recommended: False for group photos)
            
        Returns:
            Dictionary with statistics: {'processed': int, 'faces_found': int, 'errors': int}
        """
        if not os.path.exists(gallery_folder):
            raise ValueError(f"Gallery folder does not exist: {gallery_folder}")
        
        if not os.path.isdir(gallery_folder):
            raise ValueError(f"Gallery path is not a directory: {gallery_folder}")
        
        logger.info(f"Starting gallery indexing: {gallery_folder}")
        logger.info(f"Using model: {self.model} (recursive={recursive})")
        logger.info(f"Face detection: min_size={min_face_size}px, filter_small={filter_small_faces}")
        
        stats = {
            'processed': 0,
            'faces_found': 0,
            'errors': 0,
            'skipped': 0
        }
        
        # Get all image files
        image_files = []
        if recursive:
            for root, dirs, files in os.walk(gallery_folder):
                for file in files:
                    if self._is_image_file(file):
                        image_files.append(os.path.join(root, file))
        else:
            image_files = [
                os.path.join(gallery_folder, f) 
                for f in os.listdir(gallery_folder) 
                if self._is_image_file(f)
            ]
        
        logger.info(f"Found {len(image_files)} image files to process")
        
        # Process each image
        for image_path in image_files:
            try:
                # Normalize path for consistent indexing
                normalized_path = os.path.normpath(image_path)
                
                # Skip if already indexed and not updating
                if normalized_path in self.face_index and not update_existing:
                    stats['skipped'] += 1
                    logger.debug(f"Skipping already indexed: {normalized_path}")
                    continue
                
                # Detect faces in the image (with relaxed settings for group photos)
                _, face_encodings, _ = self._detect_faces_in_image(
                    image_path,
                    min_face_size=min_face_size,
                    filter_small_faces=filter_small_faces
                )
                
                if face_encodings:
                    # Store encodings for this image
                    self.face_index[normalized_path] = face_encodings
                    stats['faces_found'] += sum(1 for _ in face_encodings)
                    stats['processed'] += 1
                    logger.info(f"Indexed {normalized_path}: {len(face_encodings)} face(s)")
                else:
                    # Still count as processed even if no faces found
                    stats['processed'] += 1
                    logger.warning(f"No faces detected in {normalized_path}")
                    
            except Exception as e:
                stats['errors'] += 1
                logger.error(f"Error processing {image_path}: {e}")
        
        # Save the updated index
        self._save_index()
        
        logger.info(f"Gallery indexing complete. Stats: {stats}")
        return stats
    
    def search_face(
        self, 
        guest_selfie_path: str,
        return_scores: bool = False,
        min_confidence: float = None,
        strict_mode: bool = True
    ) -> Union[List[str], List[Tuple[str, float]]]:
        """
        Search for a guest's face in the indexed gallery with improved accuracy.
        
        Args:
            guest_selfie_path: Path to the guest's selfie image
            return_scores: If True, return list of tuples (filename, match_score) instead of just filenames
            min_confidence: Minimum confidence threshold (0-1). If None, uses tolerance-based filtering.
                           Lower distance = higher confidence. Typical: 0.4-0.5 for strict matching.
            strict_mode: If True, uses stricter matching with additional validation
            
        Returns:
            List of filenames (or tuples with scores) where the guest was found, sorted by best match
        """
        if not os.path.exists(guest_selfie_path):
            raise ValueError(f"Guest selfie file does not exist: {guest_selfie_path}")
        
        logger.info(f"Searching for face in: {guest_selfie_path}")
        logger.info(f"Tolerance: {self.tolerance}, Strict mode: {strict_mode}")
        
        # Detect faces in the guest selfie with quality check
        # Use stricter filtering for selfie to ensure good quality
        _, guest_face_encodings, guest_face_locations = self._detect_faces_in_image(
            guest_selfie_path,
            min_face_size=80,  # Require larger face in selfie for better accuracy
            filter_small_faces=True  # Filter small faces in selfie
        )
        
        if not guest_face_encodings:
            logger.warning(f"No faces detected in guest selfie: {guest_selfie_path}")
            return []
        
        if len(guest_face_encodings) > 1:
            logger.warning(f"Multiple faces detected in guest selfie. Using the best quality one.")
            # Use the largest face (best quality)
            largest_face_idx = 0
            largest_size = 0
            for idx, (top, right, bottom, left) in enumerate(guest_face_locations):
                size = (right - left) * (bottom - top)
                if size > largest_size:
                    largest_size = size
                    largest_face_idx = idx
            guest_encoding = guest_face_encodings[largest_face_idx]
        else:
            guest_encoding = guest_face_encodings[0]
        
        # Set confidence threshold (if not provided, use tolerance-based approach)
        if min_confidence is None:
            # Use much stricter threshold: match must be significantly better than tolerance
            # This reduces false positives
            if strict_mode:
                effective_threshold = self.tolerance * 0.85  # 15% stricter
            else:
                effective_threshold = self.tolerance
        else:
            effective_threshold = min_confidence
        
        logger.info(f"Using effective threshold: {effective_threshold:.4f} (tolerance: {self.tolerance:.4f})")
        
        # Search through indexed photos
        matches = []  # List of (filename, best_match_distance, face_count_in_photo)
        
        for filename, face_encodings in self.face_index.items():
            try:
                # Compare guest encoding with all faces in this photo
                face_distances = face_recognition.face_distance(face_encodings, guest_encoding)
                
                # Find the best match (minimum distance) for this photo
                best_distance = float(np.min(face_distances))
                
                # Apply strict filtering to reduce false positives
                if strict_mode:
                    # Additional check: if there are multiple faces, the match should be significantly better
                    if len(face_encodings) > 1:
                        # Sort distances and check if best match is clearly better than second best
                        sorted_distances = sorted(face_distances)
                        if len(sorted_distances) > 1:
                            best = sorted_distances[0]
                            second_best = sorted_distances[1]
                            # Best match should be at least 20% better than second best (stricter)
                            # This ensures we're not matching to the wrong person
                            if best > 0 and (second_best - best) / second_best < 0.20:
                                logger.debug(f"Skipping {filename}: match too close to other faces (best: {best:.4f}, 2nd: {second_best:.4f})")
                                continue
                    
                    # Additional check: require minimum confidence (maximum distance)
                    # Only accept matches with distance < threshold AND good confidence
                    if best_distance > effective_threshold * 0.95:
                        # Match is too close to threshold - might be a false positive
                        logger.debug(f"Skipping {filename}: match too close to threshold ({best_distance:.4f} vs {effective_threshold:.4f})")
                        continue
                
                # Check if it's within threshold
                if best_distance <= effective_threshold:
                    matches.append((filename, best_distance, len(face_encodings)))
                    
            except Exception as e:
                logger.error(f"Error comparing faces in {filename}: {e}")
                continue
        
        # Sort by distance (best matches first)
        matches.sort(key=lambda x: x[1])
        
        # Additional filtering: remove outliers if we have many matches
        if strict_mode and len(matches) > 5:
            # Keep only top matches with consistent, good distances
            top_matches = matches[:10]
            if len(top_matches) >= 3:
                # Calculate statistics on best matches
                distances = [m[1] for m in top_matches[:5]]
                avg_distance = np.mean(distances)
                std_distance = np.std(distances)
                
                # Remove matches that are outliers (more than 1.5 standard deviations from mean)
                # This is stricter than before to reduce false positives
                filtered_matches = []
                for m in matches:
                    if m[1] <= avg_distance + 1.5 * std_distance:
                        filtered_matches.append(m)
                    else:
                        logger.debug(f"Filtered outlier match: {m[0]} (distance: {m[1]:.4f})")
                
                if len(filtered_matches) < len(matches):
                    original_count = len(matches)
                    matches = filtered_matches
                    logger.info(f"Filtered to {len(matches)} matches after outlier removal (removed {original_count - len(matches)} outliers)")
            
            # Also limit to top matches with best scores
            if len(matches) > 20:
                matches = matches[:20]
                logger.info(f"Limited to top 20 matches")
        
        if return_scores:
            # Return filenames with their match scores
            return [(filename, distance) for filename, distance, _ in matches]
        else:
            # Return just the filenames
            result = [filename for filename, _, _ in matches]
            logger.info(f"Found {len(result)} matching photo(s) for guest (threshold: {effective_threshold:.3f})")
            
            # Log match quality info
            if matches:
                best_match_distance = matches[0][1]
                best_confidence = (1 - best_match_distance) * 100
                logger.info(f"Best match distance: {best_match_distance:.4f} (confidence: {best_confidence:.1f}%)")
            
            return result
    
    def get_index_stats(self) -> Dict:
        """
        Get statistics about the indexed gallery.
        
        Returns:
            Dictionary with statistics about the index
        """
        total_photos = len(self.face_index)
        total_faces = sum(len(encodings) for encodings in self.face_index.values())
        
        return {
            'total_photos': total_photos,
            'total_faces': total_faces,
            'average_faces_per_photo': total_faces / total_photos if total_photos > 0 else 0,
            'index_file': self.index_file,
            'model': self.model,
            'tolerance': self.tolerance
        }
    
    def remove_from_index(self, filename: str) -> bool:
        """
        Remove a photo from the index.
        
        Args:
            filename: Path to the photo to remove from index
            
        Returns:
            True if removed, False if not found
        """
        normalized_path = os.path.normpath(filename)
        if normalized_path in self.face_index:
            del self.face_index[normalized_path]
            self._save_index()
            logger.info(f"Removed {normalized_path} from index")
            return True
        return False
    
    def clear_index(self) -> None:
        """Clear all indexed faces."""
        self.face_index = {}
        self._save_index()
        logger.info("Face index cleared")


# Convenience functions for easy usage
def index_gallery(
    gallery_folder: str,
    index_file: str = 'face_index.json',
    model: str = 'cnn',
    recursive: bool = True,
    min_face_size: int = 15,
    filter_small_faces: bool = False
) -> Dict[str, int]:
    """
    Convenience function to index a gallery folder.
    
    Args:
        gallery_folder: Path to folder containing wedding photos
        index_file: Path to save the face index
        model: Detection model ('cnn' or 'hog'). Use 'cnn' for group photos.
        recursive: Whether to scan subdirectories
        min_face_size: Minimum face size (default: 15 for group photos)
        filter_small_faces: If False, indexes all detected faces (recommended for group photos)
        
    Returns:
        Statistics dictionary
    """
    processor = FaceProcessor(index_file=index_file, model=model)
    return processor.index_gallery(
        gallery_folder, 
        recursive=recursive,
        min_face_size=min_face_size,
        filter_small_faces=filter_small_faces
    )


def search_face(
    guest_selfie_path: str,
    index_file: str = 'face_index.json',
    model: str = 'cnn',
    tolerance: float = 0.45,
    return_scores: bool = False,
    strict_mode: bool = True
) -> Union[List[str], List[Tuple[str, float]]]:
    """
    Convenience function to search for a face in the indexed gallery.
    
    Args:
        guest_selfie_path: Path to guest's selfie
        index_file: Path to the face index file
        model: Detection model ('cnn' or 'hog')
        tolerance: Match tolerance (lower = stricter, default 0.45 for better accuracy)
        return_scores: Whether to return match scores
        strict_mode: Use stricter matching to reduce false positives
        
    Returns:
        List of matching filenames (or tuples with scores)
    """
    processor = FaceProcessor(index_file=index_file, model=model, tolerance=tolerance)
    return processor.search_face(guest_selfie_path, return_scores=return_scores, strict_mode=strict_mode)


if __name__ == "__main__":
    # Example usage
    import argparse
    
    parser = argparse.ArgumentParser(description="Face Recognition Processor for Wedding Web")
    parser.add_argument("--index", help="Index a gallery folder", metavar="FOLDER")
    parser.add_argument("--search", help="Search for face in selfie", metavar="SELFIE_PATH")
    parser.add_argument("--index-file", default="face_index.json", help="Path to index file")
    parser.add_argument("--model", default="cnn", choices=["cnn", "hog"], help="Detection model (cnn recommended for group photos)")
    parser.add_argument("--tolerance", type=float, default=0.45, help="Match tolerance (0-1, lower=stricter, default=0.45)")
    parser.add_argument("--strict", action="store_true", default=True, help="Use strict matching mode (default: True)")
    parser.add_argument("--lenient", action="store_true", help="Use lenient matching (disables strict mode)")
    parser.add_argument("--stats", action="store_true", help="Show index statistics")
    parser.add_argument("--min-face-size", type=int, default=15, help="Minimum face size in pixels for indexing (default: 15 for group photos)")
    parser.add_argument("--filter-small", action="store_true", help="Filter out small faces during indexing (not recommended for group photos)")
    
    args = parser.parse_args()
    
    processor = FaceProcessor(index_file=args.index_file, model=args.model, tolerance=args.tolerance)
    
    if args.index:
        stats = processor.index_gallery(
            args.index,
            min_face_size=args.min_face_size,
            filter_small_faces=args.filter_small
        )
        print(f"\nIndexing complete!")
        print(f"  Processed: {stats['processed']} photos")
        print(f"  Faces found: {stats['faces_found']} faces")
        print(f"  Errors: {stats['errors']}")
        print(f"  Skipped: {stats['skipped']}")
        print(f"\n  Settings:")
        print(f"    Model: {args.model}")
        print(f"    Min face size: {args.min_face_size}px")
        print(f"    Filter small faces: {args.filter_small}")
    
    if args.search:
        strict_mode = args.strict and not args.lenient
        matches = processor.search_face(args.search, strict_mode=strict_mode, return_scores=True)
        print(f"\nFound {len(matches)} matching photo(s):")
        for i, (filename, distance) in enumerate(matches[:20], 1):  # Show top 20
            confidence = (1 - distance) * 100
            print(f"  {i}. {filename}")
            print(f"     Distance: {distance:.4f} | Confidence: {confidence:.1f}%")
    
    if args.stats:
        stats = processor.get_index_stats()
        print(f"\nIndex Statistics:")
        print(f"  Total photos: {stats['total_photos']}")
        print(f"  Total faces: {stats['total_faces']}")
        print(f"  Average faces per photo: {stats['average_faces_per_photo']:.2f}")
        print(f"  Model: {stats['model']}")
        print(f"  Tolerance: {stats['tolerance']}")

