"""
InsightFace-based face matching endpoint.
Replaces DeepFace with more accurate InsightFace matching.
"""

from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import json
import os
import sys
from typing import List, Optional

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from insightface_processor import InsightFaceProcessor
except ImportError:
    raise ImportError("InsightFace processor not found")

# Initialize FastAPI app
app = FastAPI(title="InsightFace Face Matching API")

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global processor
processor: Optional[InsightFaceProcessor] = None


@app.on_event("startup")
async def startup_event():
    """Initialize InsightFace processor."""
    global processor
    try:
        processor = InsightFaceProcessor(model_name='buffalo_l', det_size=(640, 640))
        print("✅ InsightFace processor initialized for matching")
    except Exception as e:
        print(f"❌ Failed to initialize InsightFace: {e}")
        raise


def cosine_similarity(emb1: np.ndarray, emb2: np.ndarray) -> float:
    """Calculate cosine similarity between two embeddings."""
    return float(np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2)))


@app.post("/api/recognize-insightface")
async def recognize_face_insightface(
    wedding_name: str = Form(...),
    face_descriptor: Optional[str] = Form(None),
    image_file: Optional[bytes] = Form(None),
    threshold: float = Form(0.75)  # Stricter default threshold
):
    """
    Match a face using InsightFace.
    
    Accepts either:
    1. A face descriptor (from frontend face-api.js) - will convert to InsightFace embedding
    2. An image file - will extract InsightFace embedding
    
    Args:
        wedding_name: Wedding identifier (e.g., 'sister_a', 'sister_b')
        face_descriptor: JSON string of face descriptor (128-dim from face-api.js)
        image_file: Image file bytes (alternative to descriptor)
        threshold: Similarity threshold (0-1, higher = stricter, default: 0.75)
    
    Returns:
        List of matching photo paths
    """
    if processor is None:
        raise HTTPException(status_code=503, detail="InsightFace processor not initialized")
    
    try:
        # Validate wedding_name
        if wedding_name not in ["sister_a", "sister_b"]:
            raise HTTPException(status_code=400, detail="Invalid wedding_name. Must be 'sister_a' or 'sister_b'")
        
        # Get query embedding
        query_embedding = None
        
        if image_file:
            # Extract embedding from image
            import cv2
            nparr = np.frombuffer(image_file, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img is None:
                raise HTTPException(status_code=400, detail="Could not decode image")
            
            faces = processor.detect_faces_from_array(img)
            if not faces:
                return JSONResponse(
                    status_code=404,
                    content={"message": "No face detected in the image"}
                )
            
            # Use the first (best) face
            query_embedding = np.array(faces[0]['embedding'])
            
        elif face_descriptor:
            # Convert face-api.js descriptor (128-dim) to InsightFace format
            # Note: This is a workaround - ideally use InsightFace embeddings throughout
            try:
                descriptor = json.loads(face_descriptor)
                if len(descriptor) != 128:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Expected 128-dim descriptor, got {len(descriptor)}"
                    )
                
                # For now, we need to get InsightFace embeddings from stored photos
                # This is a limitation - we should store InsightFace embeddings
                # For now, return a message suggesting to use image upload
                return JSONResponse(
                    status_code=400,
                    content={
                        "message": "Face descriptor matching not yet implemented. Please upload an image instead.",
                        "suggestion": "Use the image upload option or update the system to store InsightFace embeddings"
                    }
                )
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid face descriptor format")
        else:
            raise HTTPException(status_code=400, detail="Either face_descriptor or image_file is required")
        
        if query_embedding is None:
            raise HTTPException(status_code=400, detail="Could not extract face embedding")
        
        # TODO: Load stored face embeddings from database
        # For now, this is a placeholder - you need to:
        # 1. Store InsightFace embeddings when photos are uploaded
        # 2. Load them here and compare
        
        # This is where you'd query your database for stored embeddings
        # Example structure:
        # stored_faces = get_stored_faces(wedding_name)  # Returns list of {embedding, photo_path}
        # matches = []
        # for stored_face in stored_faces:
        #     similarity = cosine_similarity(query_embedding, np.array(stored_face['embedding']))
        #     if similarity >= threshold:
        #         matches.append(stored_face['photo_path'])
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "Face matching endpoint ready. Database integration needed.",
                "note": "This endpoint requires storing InsightFace embeddings in your database",
                "threshold_used": threshold,
                "embedding_dimension": len(query_embedding)
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)

