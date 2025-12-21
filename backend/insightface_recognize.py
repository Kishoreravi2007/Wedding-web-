"""
InsightFace-based face recognition endpoint.
More accurate than face-api.js with 512-dim embeddings.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import numpy as np
import os
import sys
from typing import Optional
import logging

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from insightface_processor import InsightFaceProcessor
except ImportError:
    raise ImportError("InsightFace processor not found")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="InsightFace Recognition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

processor: Optional[InsightFaceProcessor] = None


@app.on_event("startup")
async def startup_event():
    global processor
    try:
        processor = InsightFaceProcessor(model_name='buffalo_l', det_size=(640, 640))
        logger.info("✅ InsightFace processor initialized for recognition")
    except Exception as e:
        logger.error(f"❌ Failed to initialize InsightFace: {e}")
        raise


def cosine_similarity(emb1: np.ndarray, emb2: np.ndarray) -> float:
    """Calculate cosine similarity between two embeddings."""
    return float(np.dot(emb1, emb2) / (np.linalg.norm(emb1) * np.linalg.norm(emb2)))


@app.post("/api/recognize-insightface")
async def recognize_face_insightface(
    file: UploadFile = File(...),
    wedding_name: str = Form(...),
    threshold: float = Form(0.75)  # Stricter default for InsightFace
):
    """
    Recognize face using InsightFace (more accurate than DeepFace).
    
    Args:
        file: Image file with face
        wedding_name: Wedding identifier ('sister_a' or 'sister_b')
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
        
        # Read and process image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="Could not decode image")
        
        logger.info(f"Processing image for wedding: {wedding_name}")
        
        # Detect faces and extract embeddings
        faces = processor.detect_faces_from_array(img)
        
        if not faces:
            return JSONResponse(
                status_code=404,
                content={"message": "No face detected in the image"}
            )
        
        # Use the first (best) face
        query_embedding = np.array(faces[0]['embedding'])
        logger.info(f"Extracted 512-dim embedding from image")
        
        # TODO: Load stored InsightFace embeddings from database
        # For now, this is a placeholder
        # You need to:
        # 1. Store InsightFace embeddings when photos are uploaded
        # 2. Load them here and compare using cosine similarity
        
        # Example structure (when database is ready):
        # stored_faces = get_stored_insightface_embeddings(wedding_name)
        # matches = []
        # for stored_face in stored_faces:
        #     similarity = cosine_similarity(query_embedding, np.array(stored_face['embedding']))
        #     if similarity >= threshold:
        #         matches.append(stored_face['photo_path'])
        
        return JSONResponse(
            status_code=200,
            content={
                "message": "InsightFace recognition endpoint ready. Database integration needed.",
                "note": "This endpoint requires storing InsightFace embeddings in your database",
                "threshold_used": threshold,
                "embedding_dimension": len(query_embedding),
                "suggestion": "For now, use the existing /api/recognize endpoint with stricter threshold"
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

