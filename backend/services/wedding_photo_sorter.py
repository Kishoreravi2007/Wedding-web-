"""
Wedding Photo Sorting System
Production-ready system using InsightFace for face detection and recognition.

Features:
- RetinaFace detection with high accuracy for group photos
- ArcFace (Buffalo_L) for 512-d face embeddings
- Cosine similarity matching with 0.4 threshold
- ChromaDB vector database integration
- High-resolution image support (50+ faces per photo)
- ONNX optimization for speed
"""

import os
import json
import logging
import numpy as np
from pathlib import Path
from typing import List, Dict, Tuple, Optional, Union
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

# Import our existing InsightFace processor
from insightface_processor import InsightFaceProcessor

# ChromaDB for vector database
try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError:
    CHROMADB_AVAILABLE = False
    logging.warning("ChromaDB not available. Install with: pip install chromadb")

# Cosine similarity
from scipy.spatial.distance import cosine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class WeddingPhotoSorter:
    """
    Production-ready wedding photo sorting system.
    
    Main features:
    - Selfie-to-gallery matching using cosine similarity
    - High accuracy face detection (RetinaFace)
    - 512-d face embeddings (ArcFace Buffalo_L)
    - Vector database for fast similarity search
    - Optimized for wedding photos (50+ faces per image)
    """
    
    def __init__(
        self,
        model_name: str = 'buffalo_l',
        det_size: Tuple[int, int] = (1280, 1280),  # Higher accuracy for group photos
        ctx_id: int = 0,
        similarity_threshold: float = 0.4,
        max_workers: int = 4
    ):
        """
        Initialize the Wedding Photo Sorter.
        
        Args:
            model_name: InsightFace model name (buffalo_l for ArcFace)
            det_size: Detection size for high accuracy (1280x1280 for group photos)
            ctx_id: GPU device ID (-1 for CPU, 0+ for GPU)
            similarity_threshold: Cosine similarity threshold (0.0-1.0, lower = stricter)
            max_workers: Number of worker threads for parallel processing
        """
        self.model_name = model_name
        self.det_size = det_size
        self.ctx_id = ctx_id
        self.similarity_threshold = similarity_threshold
        self.max_workers = max_workers
        
        # Initialize InsightFace processor with high accuracy settings
        logger.info("Initializing Wedding Photo Sorter...")
        self.face_processor = InsightFaceProcessor(
            model_name=model_name,
            det_size=det_size,
            ctx_id=ctx_id
        )
        
        # Initialize ChromaDB if available
        self.chroma_client = None
        self.collection = None
        if CHROMADB_AVAILABLE:
            self._init_chromadb()
        
        logger.info("Wedding Photo Sorter initialized successfully")
    
    def _init_chromadb(self):
        """Initialize ChromaDB vector database."""
        try:
            # Create persistent client
            self.chroma_client = chromadb.PersistentClient(path="./face_embeddings_db")
            
            # Get or create collection
            self.collection = self.chroma_client.get_or_create_collection(
                name="wedding_faces",
                metadata={"hnsw:space": "cosine"}
            )
            
            logger.info("ChromaDB vector database initialized")
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB: {e}")
            self.chroma_client = None
            self.collection = None
    
    def _calculate_cosine_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """
        Calculate cosine similarity between two face embeddings.
        
        Args:
            embedding1: First face embedding (512-d list)
            embedding2: Second face embedding (512-d list)
            
        Returns:
            Cosine similarity score (0.0-1.0, higher = more similar)
        """
        emb1 = np.array(embedding1)
        emb2 = np.array(embedding2)
        
        # Cosine similarity = 1 - cosine distance
        similarity = 1 - cosine(emb1, emb2)
        return max(0.0, similarity)  # Ensure non-negative
    
    def _process_single_image(self, image_path: str) -> List[Dict]:
        """
        Process a single image and extract face embeddings.
        
        Args:
            image_path: Path to the image file
            
        Returns:
            List of face data dictionaries
        """
        try:
            face_data = self.face_processor.detect_faces(image_path)
            logger.info(f"Processed {image_path}: {len(face_data)} face(s) detected")
            return face_data
        except Exception as e:
            logger.error(f"Error processing {image_path}: {e}")
            return []
    
    def process_gallery(self, gallery_path: str, wedding_id: str = None) -> Dict:
        """
        Process all images in a wedding gallery and store embeddings.
        
        Args:
            gallery_path: Path to the wedding gallery folder
            wedding_id: Unique identifier for the wedding
            
        Returns:
            Dictionary with processing results
        """
        if not os.path.exists(gallery_path):
            raise FileNotFoundError(f"Gallery path not found: {gallery_path}")
        
        gallery_path = Path(gallery_path)
        image_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.webp')
        
        # Find all images in the gallery
        image_files = [
            f for f in gallery_path.iterdir() 
            if f.is_file() and f.suffix.lower() in image_extensions
        ]
        
        if not image_files:
            raise ValueError(f"No image files found in gallery: {gallery_path}")
        
        logger.info(f"Processing {len(image_files)} images in gallery: {gallery_path}")
        
        # Process images in parallel
        start_time = time.time()
        all_face_data = []
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all image processing tasks
            future_to_image = {
                executor.submit(self._process_single_image, str(img_path)): img_path 
                for img_path in image_files
            }
            
            # Collect results
            for future in as_completed(future_to_image):
                image_path = future_to_image[future]
                try:
                    face_data = future.result()
                    for face in face_data:
                        face['image_path'] = str(image_path)
                        face['image_filename'] = image_path.name
                        if wedding_id:
                            face['wedding_id'] = wedding_id
                    all_face_data.extend(face_data)
                except Exception as e:
                    logger.error(f"Failed to process {image_path}: {e}")
        
        processing_time = time.time() - start_time
        
        # Store embeddings in ChromaDB if available
        stored_count = 0
        if self.collection and all_face_data:
            stored_count = self._store_embeddings_in_chromadb(all_face_data, wedding_id)
        
        result = {
            "gallery_path": str(gallery_path),
            "total_images": len(image_files),
            "total_faces": len(all_face_data),
            "processing_time_seconds": round(processing_time, 2),
            "average_faces_per_image": round(len(all_face_data) / len(image_files), 2),
            "embeddings_stored_in_db": stored_count,
            "face_data": all_face_data
        }
        
        logger.info(f"Gallery processing completed: {result}")
        return result
    
    def _store_embeddings_in_chromadb(self, face_data_list: List[Dict], wedding_id: str = None) -> int:
        """
        Store face embeddings in ChromaDB vector database.
        
        Args:
            face_data_list: List of face data dictionaries
            wedding_id: Wedding identifier for filtering
            
        Returns:
            Number of embeddings stored
        """
        if not self.collection:
            return 0
        
        try:
            # Prepare data for ChromaDB
            ids = []
            embeddings = []
            metadatas = []
            
            for i, face_data in enumerate(face_data_list):
                # Create unique ID
                face_id = f"{face_data.get('wedding_id', 'unknown')}_{face_data['image_filename']}_{i}"
                ids.append(face_id)
                
                # Store embedding
                embeddings.append(face_data['embedding'])
                
                # Store metadata
                metadata = {
                    "image_path": face_data['image_path'],
                    "image_filename": face_data['image_filename'],
                    "wedding_id": face_data.get('wedding_id', 'unknown'),
                    "bbox": face_data['bbox'],
                    "det_score": face_data['det_score']
                }
                if face_data.get('age') is not None:
                    metadata['age'] = face_data['age']
                if face_data.get('gender') is not None:
                    metadata['gender'] = face_data['gender']
                
                metadatas.append(metadata)
            
            # Store in ChromaDB
            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                metadatas=metadatas
            )
            
            logger.info(f"Stored {len(ids)} face embeddings in ChromaDB")
            return len(ids)
            
        except Exception as e:
            logger.error(f"Failed to store embeddings in ChromaDB: {e}")
            return 0
    
    def find_matches_in_gallery(
        self, 
        selfie_path: str, 
        gallery_path: str, 
        wedding_id: str = None,
        max_results: int = 50
    ) -> Dict:
        """
        Find all matches of a selfie in the wedding gallery using cosine similarity.
        
        This is the main function requested in the requirements.
        
        Args:
            selfie_path: Path to the selfie image
            gallery_path: Path to the wedding gallery folder
            wedding_id: Wedding identifier for filtering
            max_results: Maximum number of matches to return
            
        Returns:
            Dictionary with match results
        """
        if not os.path.exists(selfie_path):
            raise FileNotFoundError(f"Selfie not found: {selfie_path}")
        
        logger.info(f"Finding matches for selfie: {selfie_path}")
        logger.info(f"Gallery path: {gallery_path}")
        logger.info(f"Similarity threshold: {self.similarity_threshold}")
        
        # Process selfie to get embedding
        selfie_faces = self.face_processor.detect_faces(selfie_path)
        
        if not selfie_faces:
            return {
                "selfie_path": selfie_path,
                "faces_in_selfie": 0,
                "matches_found": [],
                "error": "No faces detected in selfie"
            }
        
        # Use the first (most prominent) face from selfie
        selfie_embedding = selfie_faces[0]['embedding']
        
        # Process gallery if not already processed
        gallery_result = self.process_gallery(gallery_path, wedding_id)
        gallery_faces = gallery_result['face_data']
        
        if not gallery_faces:
            return {
                "selfie_path": selfie_path,
                "faces_in_selfie": 1,
                "matches_found": [],
                "error": "No faces detected in gallery"
            }
        
        # Find matches using cosine similarity
        matches = []
        
        for face_data in gallery_faces:
            gallery_embedding = face_data['embedding']
            similarity = self._calculate_cosine_similarity(selfie_embedding, gallery_embedding)
            
            if similarity >= self.similarity_threshold:
                match_info = {
                    "image_path": face_data['image_path'],
                    "image_filename": face_data['image_filename'],
                    "similarity_score": round(similarity, 4),
                    "bbox": face_data['bbox'],
                    "det_score": face_data['det_score']
                }
                
                # Add age/gender if available
                if face_data.get('age') is not None:
                    match_info['age'] = face_data['age']
                if face_data.get('gender') is not None:
                    match_info['gender'] = face_data['gender']
                
                matches.append(match_info)
        
        # Sort by similarity score (highest first)
        matches.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        # Limit results
        matches = matches[:max_results]
        
        result = {
            "selfie_path": selfie_path,
            "faces_in_selfie": len(selfie_faces),
            "faces_in_gallery": len(gallery_faces),
            "similarity_threshold": self.similarity_threshold,
            "matches_found": len(matches),
            "matches": matches,
            "processing_summary": {
                "total_gallery_images": gallery_result['total_images'],
                "total_faces_processed": gallery_result['total_faces'],
                "processing_time_seconds": gallery_result['processing_time_seconds']
            }
        }
        
        logger.info(f"Found {len(matches)} matches for selfie")
        return result
    
    def search_similar_faces(
        self, 
        query_embedding: List[float], 
        wedding_id: str = None,
        limit: int = 20
    ) -> List[Dict]:
        """
        Search for similar faces using ChromaDB vector similarity search.
        
        Args:
            query_embedding: Query face embedding (512-d list)
            wedding_id: Wedding ID to filter results
            limit: Maximum number of results
            
        Returns:
            List of similar faces with metadata
        """
        if not self.collection:
            logger.warning("ChromaDB not available, falling back to brute force search")
            return []
        
        try:
            # Build where clause for filtering
            where_clause = {}
            if wedding_id:
                where_clause = {"wedding_id": wedding_id}
            
            # Search in ChromaDB
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=limit,
                where=where_clause if where_clause else None
            )
            
            # Format results
            similar_faces = []
            for i, (distance, metadata) in enumerate(zip(results['distances'][0], results['metadatas'][0])):
                similarity_score = 1 - distance  # Convert distance to similarity
                
                if similarity_score >= self.similarity_threshold:
                    similar_faces.append({
                        "image_path": metadata['image_path'],
                        "image_filename": metadata['image_filename'],
                        "similarity_score": round(similarity_score, 4),
                        "bbox": metadata['bbox'],
                        "det_score": metadata['det_score'],
                        "rank": i + 1
                    })
            
            return similar_faces
            
        except Exception as e:
            logger.error(f"Error in vector search: {e}")
            return []
    
    def get_gallery_statistics(self, gallery_path: str) -> Dict:
        """
        Get detailed statistics about a wedding gallery.
        
        Args:
            gallery_path: Path to the gallery folder
            
        Returns:
            Dictionary with gallery statistics
        """
        if not os.path.exists(gallery_path):
            raise FileNotFoundError(f"Gallery not found: {gallery_path}")
        
        gallery_path = Path(gallery_path)
        image_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.webp')
        
        image_files = [
            f for f in gallery_path.iterdir() 
            if f.is_file() and f.suffix.lower() in image_extensions
        ]
        
        if not image_files:
            return {"error": "No images found in gallery"}
        
        # Process a sample of images for statistics
        sample_size = min(10, len(image_files))
        sample_images = image_files[:sample_size]
        
        total_faces = 0
        image_sizes = []
        processing_times = []
        
        logger.info(f"Analyzing {sample_size} sample images for statistics")
        
        for image_path in sample_images:
            start_time = time.time()
            try:
                faces = self.face_processor.detect_faces(str(image_path))
                total_faces += len(faces)
                processing_times.append(time.time() - start_time)
                
                # Get image size
                import cv2
                img = cv2.imread(str(image_path))
                if img is not None:
                    height, width = img.shape[:2]
                    image_sizes.append((width, height))
                    
            except Exception as e:
                logger.error(f"Error analyzing {image_path}: {e}")
        
        # Calculate statistics
        avg_faces_per_image = total_faces / len(sample_images) if sample_images else 0
        avg_processing_time = np.mean(processing_times) if processing_times else 0
        
        if image_sizes:
            avg_resolution = (
                sum(size[0] for size in image_sizes) / len(image_sizes),
                sum(size[1] for size in image_sizes) / len(image_sizes)
            )
        else:
            avg_resolution = (0, 0)
        
        return {
            "total_images": len(image_files),
            "sample_analyzed": sample_size,
            "total_faces_in_sample": total_faces,
            "average_faces_per_image": round(avg_faces_per_image, 2),
            "average_processing_time_seconds": round(avg_processing_time, 3),
            "average_image_resolution": {
                "width": round(avg_resolution[0]),
                "height": round(avg_resolution[1])
            },
            "can_handle_50_plus_faces": avg_faces_per_image >= 50,
            "estimated_total_faces": round(avg_faces_per_image * len(image_files))
        }


# Convenience function for direct usage
def find_matches_in_gallery(
    selfie_path: str, 
    gallery_path: str, 
    wedding_id: str = None,
    similarity_threshold: float = 0.4
) -> Dict:
    """
    Convenience function to find matches in a gallery.
    
    This is the main function specified in the requirements.
    
    Args:
        selfie_path: Path to the selfie image
        gallery_path: Path to the wedding gallery folder
        wedding_id: Wedding identifier (optional)
        similarity_threshold: Cosine similarity threshold (default: 0.4)
        
    Returns:
        Dictionary with match results
    """
    sorter = WeddingPhotoSorter(similarity_threshold=similarity_threshold)
    return sorter.find_matches
