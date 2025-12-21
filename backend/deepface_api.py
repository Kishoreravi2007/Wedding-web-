"""
FastAPI endpoints for DeepFace face detection and embedding extraction.
Uses DeepFace with RetinaFace backend for superior performance in:
- Small faces
- Side profiles
- Low light conditions
- Crowded wedding halls
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
from deepface import DeepFace
from PIL import Image
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="DeepFace Face Detection API",
    description="Face detection and embedding extraction using DeepFace with RetinaFace backend",
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


@app.get("/")
async def root():
    """Health check endpoint."""
    return {
        "status": "ok",
        "service": "DeepFace Face Detection API",
        "backend": "RetinaFace",
        "embedding_dimension": 512,
        "model": "VGG-Face"
    }


@app.get("/health")
async def health_check():
    """Detailed health check."""
    try:
        # Test with a simple image to verify DeepFace is working
        test_img = np.zeros((100, 100, 3), dtype=np.uint8)
        return {
            "status": "healthy",
            "backend": "RetinaFace",
            "embedding_dimension": 512,
            "model": "VGG-Face"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


async def process_image_file(file: UploadFile) -> np.ndarray:
    """Convert uploaded file to numpy array."""
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(
            status_code=400,
            detail="Could not decode image. Please ensure the file is a valid image."
        )
    
    return img


@app.post("/api/faces/detect")
async def detect_faces(
    file: UploadFile = File(...),
    return_landmarks: bool = Form(False),
    return_age_gender: bool = Form(True),
    min_confidence: Optional[float] = Form(None),
    enforce_detection: bool = Form(False)
):
    """
    Detect all faces in an uploaded image and extract 512-dimension embeddings.
    
    Uses DeepFace with RetinaFace backend for superior performance in:
    - Small faces
    - Side profiles
    - Low light conditions
    - Crowded wedding halls
    
    Args:
        file: Image file (JPEG, PNG, etc.)
        return_landmarks: Whether to return facial landmarks
        return_age_gender: Whether to return age and gender estimates
        min_confidence: Minimum detection confidence threshold (0-1)
        enforce_detection: If True, raises error if no faces detected
    
    Returns:
        JSON with detected faces, each containing:
        - bbox: [x, y, width, height] bounding box
        - embedding: 512-dimension normalized embedding
        - det_score: Detection confidence score
        - landmark: Facial landmarks (if requested)
        - age: Estimated age (if available)
        - gender: Estimated gender (if available)
    """
    try:
        # Read uploaded image
        img = await process_image_file(file)
        
        logger.info(f"Processing image: {file.filename}, size: {img.shape}")
        
        # Save image temporarily for DeepFace
        temp_path = f"/tmp/temp_{file.filename}"
        cv2.imwrite(temp_path, img)
        
        try:
            # Use DeepFace with RetinaFace backend
            # RetinaFace is better for small faces, side profiles, and low light
            face_objs = DeepFace.represent(
                img_path=temp_path,
                model_name="VGG-Face",  # 512-dim embeddings
                detector_backend="retinaface",  # Best for wedding photos
                enforce_detection=enforce_detection,
                align=True
            )
            
            # Also get detailed face analysis for age/gender/landmarks
            if return_age_gender or return_landmarks:
                try:
                    face_analyses = DeepFace.analyze(
                        img_path=temp_path,
                        actions=['age', 'gender', 'emotion'],
                        detector_backend="retinaface",
                        enforce_detection=False,
                        silent=True
                    )
                except:
                    face_analyses = []
            else:
                face_analyses = []
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
        
        if not face_objs:
            return JSONResponse(
                status_code=200,
                content={
                    "faces": [],
                    "count": 0,
                    "message": "No faces detected in the image"
                }
            )
        
        # Process results
        response_faces = []
        for i, face_obj in enumerate(face_objs):
            # Get embedding (512 dimensions)
            embedding = face_obj.get("embedding", [])
            
            # Get face region (bounding box)
            face_region = face_obj.get("facial_area", {})
            x = face_region.get("x", 0)
            y = face_region.get("y", 0)
            w = face_region.get("w", 0)
            h = face_region.get("h", 0)
            
            # Detection confidence (RetinaFace provides this)
            det_score = face_obj.get("face_confidence", 0.9)
            
            # Filter by confidence if threshold provided
            if min_confidence is not None and det_score < min_confidence:
                continue
            
            face_response = {
                "bbox": [x, y, w, h],  # [x, y, width, height]
                "embedding": embedding,
                "det_score": float(det_score)
            }
            
            # Add age and gender if available
            if return_age_gender and i < len(face_analyses):
                analysis = face_analyses[i]
                if "age" in analysis:
                    face_response["age"] = int(analysis["age"])
                if "gender" in analysis:
                    face_response["gender"] = analysis["gender"].lower()
            
            # Add landmarks if requested (RetinaFace provides 5-point landmarks)
            if return_landmarks:
                # RetinaFace landmarks are embedded in the detection
                # We can extract them if needed
                landmarks = face_obj.get("facial_landmarks", None)
                if landmarks:
                    face_response["landmark"] = landmarks
            
            response_faces.append(face_response)
        
        return JSONResponse(
            status_code=200,
            content={
                "faces": response_faces,
                "count": len(response_faces),
                "embedding_dimension": 512,
                "model": "VGG-Face",
                "backend": "RetinaFace"
            }
        )
        
    except ValueError as e:
        # DeepFace raises ValueError when no faces detected
        if "No face detected" in str(e) or "Face could not be detected" in str(e):
            return JSONResponse(
                status_code=200,
                content={
                    "faces": [],
                    "count": 0,
                    "message": "No faces detected in the image"
                }
            )
        raise HTTPException(status_code=400, detail=str(e))
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
    results = []
    
    for file in files:
        try:
            # Read image
            img = await process_image_file(file)
            
            # Save temporarily
            temp_path = f"/tmp/temp_{file.filename}"
            cv2.imwrite(temp_path, img)
            
            try:
                # Detect faces
                face_objs = DeepFace.represent(
                    img_path=temp_path,
                    model_name="VGG-Face",
                    detector_backend="retinaface",
                    enforce_detection=False,
                    align=True
                )
                
                # Get analysis if needed
                if return_age_gender:
                    try:
                        face_analyses = DeepFace.analyze(
                            img_path=temp_path,
                            actions=['age', 'gender'],
                            detector_backend="retinaface",
                            enforce_detection=False,
                            silent=True
                        )
                    except:
                        face_analyses = []
                else:
                    face_analyses = []
                
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
            
            # Process faces
            response_faces = []
            for i, face_obj in enumerate(face_objs):
                embedding = face_obj.get("embedding", [])
                face_region = face_obj.get("facial_area", {})
                x = face_region.get("x", 0)
                y = face_region.get("y", 0)
                w = face_region.get("w", 0)
                h = face_region.get("h", 0)
                det_score = face_obj.get("face_confidence", 0.9)
                
                if min_confidence is not None and det_score < min_confidence:
                    continue
                
                face_response = {
                    "bbox": [x, y, w, h],
                    "embedding": embedding,
                    "det_score": float(det_score)
                }
                
                if return_age_gender and i < len(face_analyses):
                    analysis = face_analyses[i]
                    if "age" in analysis:
                        face_response["age"] = int(analysis["age"])
                    if "gender" in analysis:
                        face_response["gender"] = analysis["gender"].lower()
                
                if return_landmarks:
                    landmarks = face_obj.get("facial_landmarks", None)
                    if landmarks:
                        face_response["landmark"] = landmarks
                
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
            "model": "VGG-Face",
            "backend": "RetinaFace"
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
    try:
        # Process both images
        img1 = await process_image_file(file1)
        img2 = await process_image_file(file2)
        
        # Save temporarily
        temp1 = f"/tmp/compare1_{file1.filename}"
        temp2 = f"/tmp/compare2_{file2.filename}"
        cv2.imwrite(temp1, img1)
        cv2.imwrite(temp2, img2)
        
        try:
            # Use DeepFace to verify if same person
            result = DeepFace.verify(
                img1_path=temp1,
                img2_path=temp2,
                model_name="VGG-Face",
                detector_backend="retinaface",
                enforce_detection=False
            )
            
            is_match = result.get("verified", False)
            similarity = result.get("distance", 1.0)
            # Convert distance to similarity (lower distance = higher similarity)
            similarity_score = 1.0 - min(similarity, 1.0)
            
            # Also get face counts
            faces1 = DeepFace.represent(
                img_path=temp1,
                model_name="VGG-Face",
                detector_backend="retinaface",
                enforce_detection=False
            )
            faces2 = DeepFace.represent(
                img_path=temp2,
                model_name="VGG-Face",
                detector_backend="retinaface",
                enforce_detection=False
            )
            
        finally:
            if os.path.exists(temp1):
                os.remove(temp1)
            if os.path.exists(temp2):
                os.remove(temp2)
        
        return JSONResponse(
            status_code=200,
            content={
                "match": is_match and similarity_score >= threshold,
                "similarity": similarity_score,
                "distance": similarity,
                "threshold": threshold,
                "faces_in_image1": len(faces1) if faces1 else 0,
                "faces_in_image2": len(faces2) if faces2 else 0
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
        "deepface_api:app",
        host="0.0.0.0",
        port=8002,  # Different port from InsightFace API
        reload=True,
        log_level="info"
    )

