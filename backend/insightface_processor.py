"""
InsightFace Face Detection and Embedding Extraction
Uses buffalo_l model with onnxruntime for fast inference.
Detects all faces in group photos and extracts 512-dimension embeddings.
"""

import cv2
import numpy as np
try:
    import onnxruntime
except ImportError:
    # onnxruntime may be bundled with insightface or not available
    # InsightFace will handle it internally
    pass
from insightface.app import FaceAnalysis
from typing import List, Dict, Optional, Tuple
import logging
from pathlib import Path
import json
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class InsightFaceProcessor:
    """
    High-performance face detection and embedding extraction using InsightFace.
    Uses buffalo_l model with onnxruntime for fast inference.
    """
    
    # Supported image formats
    SUPPORTED_FORMATS = ('.jpg', '.jpeg', '.png', '.bmp', '.gif', '.webp')
    
    def __init__(
        self,
        model_name: str = 'buffalo_l',
        det_size: Tuple[int, int] = (640, 640),
        ctx_id: int = 0,
        providers: Optional[List[str]] = None
    ):
        """
        Initialize the InsightFace processor.
        
        Args:
            model_name: InsightFace model name (default: 'buffalo_l')
            det_size: Detection size tuple (width, height). Larger = more accurate but slower.
            ctx_id: GPU device ID (-1 for CPU, 0+ for GPU)
            providers: ONNX runtime providers. If None, auto-detects (CUDA if available, else CPU)
        """
        self.model_name = model_name
        self.det_size = det_size
        self.ctx_id = ctx_id
        
        # Auto-detect providers if not specified
        if providers is None:
            # Try CUDA first, fallback to CPU
            try:
                providers = ['CUDAExecutionProvider', 'CPUExecutionProvider']
                logger.info("Using CUDA and CPU providers for onnxruntime")
            except:
                providers = ['CPUExecutionProvider']
                logger.info("Using CPU provider for onnxruntime")
        
        self.providers = providers
        
        logger.info(f"Initializing InsightFace with model: {model_name}")
        logger.info(f"Detection size: {det_size}, Context ID: {ctx_id}")
        
        # Initialize FaceAnalysis app
        try:
            self.app = FaceAnalysis(
                name=model_name,
                providers=providers
            )
            self.app.prepare(ctx_id=ctx_id, det_size=det_size)
            logger.info("InsightFace initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize InsightFace: {e}")
            raise
    
    def _is_image_file(self, filepath: str) -> bool:
        """Check if file is a supported image format."""
        return Path(filepath).suffix.lower() in self.SUPPORTED_FORMATS
    
    def detect_faces(
        self,
        image_path: str,
        return_image: bool = False
    ) -> List[Dict]:
        """
        Detect all faces in an image and extract 512-dimension embeddings.
        
        Args:
            image_path: Path to the image file
            return_image: If True, also returns the loaded image array
            
        Returns:
            List of dictionaries, each containing:
            - 'bbox': [x1, y1, x2, y2] bounding box coordinates
            - 'embedding': 512-dimension numpy array (normalized)
            - 'landmark': 5-point facial landmarks (optional)
            - 'det_score': Detection confidence score
            - 'age': Estimated age (if available)
            - 'gender': Estimated gender (if available)
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        if not self._is_image_file(image_path):
            raise ValueError(f"Unsupported image format: {image_path}")
        
        try:
            # Load image using OpenCV
            img = cv2.imread(image_path)
            if img is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            logger.info(f"Processing image: {image_path} (size: {img.shape})")
            
            # Detect faces using InsightFace
            faces = self.app.get(img)
            
            if len(faces) == 0:
                logger.warning(f"No faces detected in {image_path}")
                if return_image:
                    return [], img
                return []
            
            logger.info(f"Detected {len(faces)} face(s) in {image_path}")
            
            # Extract face information
            face_data = []
            for i, face in enumerate(faces):
                # Bounding box: [x1, y1, x2, y2]
                bbox = face.bbox.astype(int).tolist()
                
                # 512-dimension embedding (normalized)
                embedding = face.normed_embedding
                
                # Detection confidence score
                det_score = float(face.det_score) if hasattr(face, 'det_score') else 1.0
                
                # Facial landmarks (5 points: left_eye, right_eye, nose, left_mouth, right_mouth)
                landmark = None
                if hasattr(face, 'landmark') and face.landmark is not None:
                    landmark = face.landmark.tolist()
                
                # Age and gender (if available)
                age = None
                gender = None
                if hasattr(face, 'age') and face.age is not None:
                    age = int(face.age)
                if hasattr(face, 'gender') and face.gender is not None:
                    gender = int(face.gender)  # 0 = female, 1 = male
                
                face_info = {
                    'bbox': bbox,
                    'embedding': embedding.tolist(),  # Convert numpy array to list
                    'det_score': det_score,
                    'landmark': landmark,
                    'age': age,
                    'gender': gender
                }
                
                face_data.append(face_info)
                
                logger.debug(
                    f"Face {i+1}: bbox={bbox}, "
                    f"det_score={det_score:.3f}, "
                    f"embedding_dim={len(embedding)}"
                )
            
            if return_image:
                return face_data, img
            return face_data
            
        except Exception as e:
            logger.error(f"Error processing {image_path}: {e}")
            import traceback
            logger.error(traceback.format_exc())
            raise
    
    def detect_faces_from_array(
        self,
        image_array: np.ndarray
    ) -> List[Dict]:
        """
        Detect faces from a numpy image array (BGR format).
        
        Args:
            image_array: NumPy array of image in BGR format (OpenCV format)
            
        Returns:
            List of face dictionaries (same format as detect_faces)
        """
        try:
            # Detect faces using InsightFace
            faces = self.app.get(image_array)
            
            if len(faces) == 0:
                logger.warning("No faces detected in image array")
                return []
            
            logger.info(f"Detected {len(faces)} face(s) in image array")
            
            # Extract face information
            face_data = []
            for i, face in enumerate(faces):
                bbox = face.bbox.astype(int).tolist()
                embedding = face.normed_embedding
                det_score = float(face.det_score) if hasattr(face, 'det_score') else 1.0
                
                landmark = None
                if hasattr(face, 'landmark') and face.landmark is not None:
                    landmark = face.landmark.tolist()
                
                age = None
                gender = None
                if hasattr(face, 'age') and face.age is not None:
                    age = int(face.age)
                if hasattr(face, 'gender') and face.gender is not None:
                    gender = int(face.gender)
                
                face_info = {
                    'bbox': bbox,
                    'embedding': embedding.tolist(),
                    'det_score': det_score,
                    'landmark': landmark,
                    'age': age,
                    'gender': gender
                }
                
                face_data.append(face_info)
            
            return face_data
            
        except Exception as e:
            logger.error(f"Error processing image array: {e}")
            import traceback
            logger.error(traceback.format_exc())
            raise
    
    def visualize_faces(
        self,
        image_path: str,
        output_path: Optional[str] = None,
        show_image: bool = False
    ) -> np.ndarray:
        """
        Detect faces and draw bounding boxes on the image.
        
        Args:
            image_path: Path to input image
            output_path: Optional path to save annotated image
            show_image: If True, display the image using OpenCV
            
        Returns:
            Annotated image as numpy array
        """
        face_data, img = self.detect_faces(image_path, return_image=True)
        
        # Draw bounding boxes and labels
        for i, face_info in enumerate(face_data):
            x1, y1, x2, y2 = face_info['bbox']
            det_score = face_info['det_score']
            
            # Draw bounding box
            cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Draw label with confidence
            label = f"Face {i+1} ({det_score:.2f})"
            if face_info['age'] is not None:
                gender_str = "M" if face_info['gender'] == 1 else "F"
                label += f" | {face_info['age']} {gender_str}"
            
            # Put text above the box
            cv2.putText(
                img, label, (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2
            )
            
            # Draw landmarks if available
            if face_info['landmark'] is not None:
                for point in face_info['landmark']:
                    x, y = int(point[0]), int(point[1])
                    cv2.circle(img, (x, y), 3, (255, 0, 0), -1)
        
        # Save if output path provided
        if output_path:
            cv2.imwrite(output_path, img)
            logger.info(f"Saved annotated image to: {output_path}")
        
        # Display if requested
        if show_image:
            cv2.imshow('Detected Faces', img)
            cv2.waitKey(0)
            cv2.destroyAllWindows()
        
        return img
    
    def process_batch(
        self,
        image_paths: List[str],
        output_json: Optional[str] = None
    ) -> Dict[str, List[Dict]]:
        """
        Process multiple images and extract all face embeddings.
        
        Args:
            image_paths: List of image file paths
            output_json: Optional path to save results as JSON
            
        Returns:
            Dictionary mapping image paths to their face data lists
        """
        results = {}
        
        logger.info(f"Processing batch of {len(image_paths)} images")
        
        for image_path in image_paths:
            try:
                face_data = self.detect_faces(image_path)
                results[image_path] = face_data
                logger.info(f"Processed {image_path}: {len(face_data)} face(s)")
            except Exception as e:
                logger.error(f"Error processing {image_path}: {e}")
                results[image_path] = []
        
        # Save to JSON if requested
        if output_json:
            with open(output_json, 'w') as f:
                json.dump(results, f, indent=2)
            logger.info(f"Saved results to: {output_json}")
        
        return results


# Convenience functions
def detect_faces_in_image(
    image_path: str,
    model_name: str = 'buffalo_l',
    det_size: Tuple[int, int] = (640, 640)
) -> List[Dict]:
    """
    Convenience function to detect faces in a single image.
    
    Args:
        image_path: Path to the image file
        model_name: InsightFace model name
        det_size: Detection size tuple
        
    Returns:
        List of face dictionaries
    """
    processor = InsightFaceProcessor(model_name=model_name, det_size=det_size)
    return processor.detect_faces(image_path)


if __name__ == "__main__":
    import argparse
    import os
    
    parser = argparse.ArgumentParser(
        description="InsightFace Face Detection and Embedding Extraction"
    )
    parser.add_argument(
        "image",
        help="Path to input image file"
    )
    parser.add_argument(
        "--model",
        default="buffalo_l",
        help="InsightFace model name (default: buffalo_l)"
    )
    parser.add_argument(
        "--det-size",
        type=int,
        nargs=2,
        default=[640, 640],
        metavar=("WIDTH", "HEIGHT"),
        help="Detection size (default: 640 640)"
    )
    parser.add_argument(
        "--output",
        help="Path to save annotated output image"
    )
    parser.add_argument(
        "--json",
        help="Path to save face data as JSON"
    )
    parser.add_argument(
        "--show",
        action="store_true",
        help="Display the annotated image"
    )
    parser.add_argument(
        "--ctx-id",
        type=int,
        default=0,
        help="GPU device ID (-1 for CPU, 0+ for GPU, default: 0)"
    )
    
    args = parser.parse_args()
    
    # Initialize processor
    processor = InsightFaceProcessor(
        model_name=args.model,
        det_size=tuple(args.det_size),
        ctx_id=args.ctx_id
    )
    
    # Detect faces
    face_data = processor.detect_faces(args.image)
    
    print(f"\n{'='*60}")
    print(f"Face Detection Results for: {args.image}")
    print(f"{'='*60}")
    print(f"Total faces detected: {len(face_data)}\n")
    
    # Print details for each face
    for i, face_info in enumerate(face_data, 1):
        print(f"Face {i}:")
        print(f"  Bounding box: {face_info['bbox']}")
        print(f"  Detection score: {face_info['det_score']:.4f}")
        print(f"  Embedding dimension: {len(face_info['embedding'])}")
        if face_info['age'] is not None:
            gender_str = "Male" if face_info['gender'] == 1 else "Female"
            print(f"  Age: {face_info['age']}, Gender: {gender_str}")
        if face_info['landmark']:
            print(f"  Landmarks: {len(face_info['landmark'])} points")
        print()
    
    # Save JSON if requested
    if args.json:
        with open(args.json, 'w') as f:
            json.dump(face_data, f, indent=2)
        print(f"Saved face data to: {args.json}")
    
    # Visualize if requested
    if args.output or args.show:
        processor.visualize_faces(
            args.image,
            output_path=args.output,
            show_image=args.show
        )

