"""
FastAPI endpoints for InsightFace face detection and embedding extraction.
Replaces face-api.js with server-side processing using InsightFace.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import os
import sys
from typing import Optional, List
import logging

# Add current directory to path to import insightface_processor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from insightface_processor import InsightFaceProcessor
except ImportError:
    raise ImportError(
        "InsightFace processor not found. Make sure insightface_processor.py is in the same directory."
    )

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="InsightFace Face Detection API",
    description="Face detection and embedding extraction using InsightFace buffalo_l model",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global processor instance (initialized on startup)
processor: Optional[InsightFaceProcessor] = None


@app.on_event("startup")
async def startup_event():
    """Initialize InsightFace processor on startup."""
    global processor
    try:
        logger.info("Initializing InsightFace processor...")
        processor = InsightFaceProcessor(
            model_name='buffalo_l',
            det_size=(640, 640),
            ctx_id=0  # Use GPU if available, else CPU
        )
        logger.info("InsightFace processor initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize InsightFace processor: {e}")
        raise


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "InsightFace Face Detection API",
        "model": "buffalo_l",
        "embedding_dimension": 512
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    return {
        "status": "healthy" if processor is not None else "unhealthy",
        "processor_initialized": processor is not None,
        "model": "buffalo_l",
        "embedding_dimension": 512
    }


@app.post("/api/faces/detect")
async def detect_faces(
    file: UploadFile = File(...),
    return_landmarks: bool = Form(False),
    return_age_gender: bool = Form(True),
    min_confidence: Optional[float] = Form(None)
):
    """
    Detect all faces in an uploaded image and extract 512-dimension embeddings.
    
    Args:
        file: Image file (JPEG, PNG, etc.)
        return_landmarks: Whether to return facial landmarks
        return_age_gender: Whether to return age and gender estimates
        min_confidence: Minimum detection confidence threshold (0-1)
    
    Returns:
        JSON with detected faces, each containing:
        - bbox: [x1, y1, x2, y2] bounding box
        - embedding: 512-dimension normalized embedding
        - det_score: Detection confidence score
        - landmark: Facial landmarks (if requested)
        - age: Estimated age (if available)
        - gender: Estimated gender (if available)
    """
    if processor is None:
        raise HTTPException(
            status_code=503,
            detail="InsightFace processor not initialized"
        )
    
    try:
        # Read uploaded image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(
                status_code=400,
                detail="Could not decode image. Please ensure the file is a valid image."
            )
        
        logger.info(f"Processing image: {file.filename}, size: {img.shape}")
        
        # Detect faces using InsightFace
        face_data = processor.detect_faces_from_array(img)
        
        if not face_data:
            return JSONResponse(
                status_code=200,
                content={
                    "faces": [],
                    "count": 0,
                    "message": "No faces detected in the image"
                }
            )
        
        # Filter by confidence if threshold provided
        if min_confidence is not None:
            face_data = [
                face for face in face_data
                if face['det_score'] >= min_confidence
            ]
        
        # Prepare response (remove optional fields if not requested)
        response_faces = []
        for face in face_data:
            face_response = {
                "bbox": face['bbox'],
                "embedding": face['embedding'],
                "det_score": face['det_score']
            }
            
            if return_landmarks and face.get('landmark'):
                face_response["landmark"] = face['landmark']
            
            if return_age_gender:
                if face.get('age') is not None:
                    face_response["age"] = face['age']
                if face.get('gender') is not None:
                    face_response["gender"] = "male" if face['gender'] == 1 else "female"
            
            response_faces.append(face_response)
        
        return JSONResponse(
            status_code=200,
            content={
                "faces": response_faces,
                "count": len(response_faces),
                "embedding_dimension": 512,
                "model": "buffalo_l"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


@app.post("/api/faces/detect-batch")
async def detect_faces_batch(
    files: List[UploadFile] = File(...),
    return_landmarks: bool = Form(False),
    return_age_gender: bool = Form(True),
    min_confidence: Optional[float] = Form(None)
):
    """
    Detect faces in multiple images (batch processing).
    
    Args:
        files: List of image files
        return_landmarks: Whether to return facial landmarks
        return_age_gender: Whether to return age and gender estimates
        min_confidence: Minimum detection confidence threshold
    
    Returns:
        JSON with results for each image
    """
    if processor is None:
        raise HTTPException(
            status_code=503,
            detail="InsightFace processor not initialized"
        )
    
    results = []
    
    for file in files:
        try:
            # Read image
            contents = await file.read()
            nparr = np.frombuffer(contents, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": "Could not decode image"
                })
                continue
            
            # Detect faces
            face_data = processor.detect_faces_from_array(img)
            
            # Filter by confidence
            if min_confidence is not None:
                face_data = [
                    face for face in face_data
                    if face['det_score'] >= min_confidence
                ]
            
            # Prepare response
            response_faces = []
            for face in face_data:
                face_response = {
                    "bbox": face['bbox'],
                    "embedding": face['embedding'],
                    "det_score": face['det_score']
                }
                
                if return_landmarks and face.get('landmark'):
                    face_response["landmark"] = face['landmark']
                
                if return_age_gender:
                    if face.get('age') is not None:
                        face_response["age"] = face['age']
                    if face.get('gender') is not None:
                        face_response["gender"] = "male" if face['gender'] == 1 else "female"
                
                response_faces.append(face_response)
            
            results.append({
                "filename": file.filename,
                "success": True,
                "faces": response_faces,
                "count": len(response_faces)
            })
            
        except Exception as e:
            logger.error(f"Error processing {file.filename}: {e}")
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
    
    return JSONResponse(
        status_code=200,
        content={
            "results": results,
            "total_images": len(files),
            "embedding_dimension": 512,
            "model": "buffalo_l"
        }
    )


@app.post("/api/faces/compare")
async def compare_faces(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    threshold: float = Form(0.6)
):
    """
    Compare two images to see if they contain the same person.
    
    Args:
        file1: First image file
        file2: Second image file
        threshold: Similarity threshold (0-1, lower = stricter)
    
    Returns:
        JSON with comparison results
    """
    if processor is None:
        raise HTTPException(
            status_code=503,
            detail="InsightFace processor not initialized"
        )
    
    try:
        # Process first image
        contents1 = await file1.read()
        nparr1 = np.frombuffer(contents1, np.uint8)
        img1 = cv2.imdecode(nparr1, cv2.IMREAD_COLOR)
        
        if img1 is None:
            raise HTTPException(status_code=400, detail="Could not decode first image")
        
        # Process second image
        contents2 = await file2.read()
        nparr2 = np.frombuffer(contents2, np.uint8)
        img2 = cv2.imdecode(nparr2, cv2.IMREAD_COLOR)
        
        if img2 is None:
            raise HTTPException(status_code=400, detail="Could not decode second image")
        
        # Detect faces in both images
        faces1 = processor.detect_faces_from_array(img1)
        faces2 = processor.detect_faces_from_array(img2)
        
        if not faces1:
            return JSONResponse(
                status_code=200,
                content={
                    "match": False,
                    "message": "No faces detected in first image",
                    "faces_in_image1": 0,
                    "faces_in_image2": len(faces2)
                }
            )
        
        if not faces2:
            return JSONResponse(
                status_code=200,
                content={
                    "match": False,
                    "message": "No faces detected in second image",
                    "faces_in_image1": len(faces1),
                    "faces_in_image2": 0
                }
            )
        
        # Compare embeddings using cosine similarity
        from numpy.linalg import norm
        
        best_match_score = 0.0
        best_match_pair = None
        
        for i, face1 in enumerate(faces1):
            emb1 = np.array(face1['embedding'])
            for j, face2 in enumerate(faces2):
                emb2 = np.array(face2['embedding'])
                
                # Cosine similarity (normalized embeddings)
                similarity = np.dot(emb1, emb2) / (norm(emb1) * norm(emb2))
                similarity = float(similarity)  # Convert to Python float
                
                if similarity > best_match_score:
                    best_match_score = similarity
                    best_match_pair = (i, j)
        
        # Check if best match exceeds threshold
        is_match = best_match_score >= threshold
        
        return JSONResponse(
            status_code=200,
            content={
                "match": is_match,
                "similarity": best_match_score,
                "threshold": threshold,
                "faces_in_image1": len(faces1),
                "faces_in_image2": len(faces2),
                "best_match_face1_index": best_match_pair[0] if best_match_pair else None,
                "best_match_face2_index": best_match_pair[1] if best_match_pair else None
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error comparing faces: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error comparing faces: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    # Run the server
    uvicorn.run(
        "insightface_api:app",
        host="0.0.0.0",
        port=8001,  # Different port from main.py to avoid conflicts
        reload=True,
        log_level="info"
    )

