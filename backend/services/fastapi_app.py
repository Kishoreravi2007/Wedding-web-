"""
FastAPI Backend for Wedding Photo Sorting System
Production-ready API server using FastAPI with the wedding photo sorter.

Provides REST API endpoints for:
- Selfie upload and matching
- Gallery processing and search
- Batch photo processing
- Vector database operations
- System health and statistics
"""

import os
import logging
import asyncio
from pathlib import Path
from typing import List, Optional, Dict, Any
from concurrent.futures import ThreadPoolExecutor
import time
from datetime import datetime

# FastAPI imports
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Query
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Import our wedding photo sorter
from wedding_photo_sorter import WeddingPhotoSorter, find_matches_in_gallery

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Wedding Photo Sorting API",
    description="Production-ready wedding photo sorting system using RetinaFace and ArcFace",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global photo sorter instance
photo_sorter: Optional[WeddingPhotoSorter] = None
executor = ThreadPoolExecutor(max_workers=4)

# Global state for background tasks
background_tasks_status = {}

# Pydantic models for API requests/responses
class SelfieSearchRequest(BaseModel):
    wedding_id: Optional[str] = Field(None, description="Wedding identifier for filtering")
    similarity_threshold: float = Field(0.4, ge=0.0, le=1.0, description="Cosine similarity threshold")
    max_results: int = Field(50, ge=1, le=1000, description="Maximum number of results")

class GalleryProcessRequest(BaseModel):
    wedding_id: Optional[str] = Field(None, description="Unique wedding identifier")
    force_reprocess: bool = Field(False, description="Force reprocessing even if already processed")

class BatchProcessRequest(BaseModel):
    gallery_paths: List[str] = Field(..., description="List of gallery paths to process")
    wedding_ids: Optional[List[str]] = Field(None, description="Wedding IDs corresponding to each gallery")

class SearchSimilarRequest(BaseModel):
    embedding: List[float] = Field(..., description="Face embedding vector (512 dimensions)")
    wedding_id: Optional[str] = Field(None, description="Wedding ID to filter results")
    limit: int = Field(20, ge=1, le=100, description="Maximum number of results")

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    photo_sorter_initialized: bool
    chromadb_available: bool
    gpu_available: bool

class GalleryStatsResponse(BaseModel):
    gallery_path: str
    total_images: int
    sample_analyzed: int
    total_faces_in_sample: int
    average_faces_per_image: float
    average_processing_time_seconds: float
    average_image_resolution: Dict[str, int]
    can_handle_50_plus_faces: bool
    estimated_total_faces: int

class SelfieMatchResponse(BaseModel):
    selfie_path: str
    faces_in_selfie: int
    faces_in_gallery: int
    similarity_threshold: float
    matches_found: int
    matches: List[Dict[str, Any]]
    processing_summary: Dict[str, Any]
    error: Optional[str] = None

class GalleryProcessResponse(BaseModel):
    gallery_path: str
    total_images: int
    total_faces: int
    processing_time_seconds: float
    average_faces_per_image: float
    embeddings_stored_in_db: int
    face_data: List[Dict[str, Any]]

# Startup event to initialize photo sorter
@app.on_event("startup")
async def startup_event():
    """Initialize the photo sorter on startup."""
    global photo_sorter
    
    logger.info("Starting Wedding Photo Sorting API...")
    
    try:
        # Initialize with optimized settings for wedding photos
        photo_sorter = WeddingPhotoSorter(
            model_name='buffalo_l',
            det_size=(1280, 1280),  # High accuracy for group photos
            ctx_id=0,  # Use GPU if available
            similarity_threshold=0.4,
            max_workers=4
        )
        
        logger.info("Photo sorter initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize photo sorter: {e}")
        raise

# Health check endpoint
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check API health and system status."""
    try:
        gpu_available = True  # Would check actual GPU availability in production
        
        return HealthResponse(
            status="healthy",
            timestamp=datetime.now().isoformat(),
            photo_sorter_initialized=photo_sorter is not None,
            chromadb_available=photo_sorter.chroma_client is not None if photo_sorter else False,
            gpu_available=gpu_available
        )
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Health check failed: {str(e)}")

# Selfie upload and search endpoint
@app.post("/api/selfie/search", response_model=SelfieMatchResponse)
async def search_selfie_matches(
    file: UploadFile = File(..., description="Selfie image file"),
    wedding_id: Optional[str] = Query(None, description="Wedding identifier"),
    similarity_threshold: float = Query(0.4, ge=0.0, le=1.0, description="Similarity threshold"),
    max_results: int = Query(50, ge=1, le=1000, description="Max results"),
    gallery_path: str = Query(..., description="Path to wedding gallery")
):
    """
    Upload a selfie and find matches in the wedding gallery.
    
    This is the main endpoint for the "Find My Photos" functionality.
    """
    if not photo_sorter:
        raise HTTPException(status_code=503, detail="Photo sorter not initialized")
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Save uploaded file temporarily
        temp_dir = Path("temp_uploads")
        temp_dir.mkdir(exist_ok=True)
        
        selfie_path = temp_dir / f"selfie_{int(time.time())}_{file.filename}"
        
        with open(selfie_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Find matches in gallery
        result = photo_sorter.find_matches_in_gallery(
            selfie_path=str(selfie_path),
            gallery_path=gallery_path,
            wedding_id=wedding_id,
            max_results=max_results
        )
        
        # Clean up temporary file
        try:
            selfie_path.unlink()
        except:
            pass
        
        return SelfieMatchResponse(**result)
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Gallery not found: {str(e)}")
    except Exception as e:
        logger.error(f"Error processing selfie: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

# Gallery processing endpoint
@app.post("/api/gallery/process", response_model=GalleryProcessResponse)
async def process_gallery(
    background_tasks: BackgroundTasks,
    gallery_path: str = Query(..., description="Path to gallery folder"),
    wedding_id: Optional[str] = Query(None, description="Wedding identifier"),
    force_reprocess: bool = Query(False, description="Force reprocessing")
):
    """
    Process a wedding gallery to extract and store face embeddings.
    
    This endpoint processes all images in the gallery and stores embeddings
    in the vector database for fast similarity search.
    """
    if not photo_sorter:
        raise HTTPException(status_code=503, detail="Photo sorter not initialized")
    
    try:
        # Start background processing
        task_id = f"gallery_{int(time.time())}"
        
        def process_gallery_task():
            return photo_sorter.process_gallery(gallery_path, wedding_id)
        
        # Submit to thread pool
        future = executor.submit(process_gallery_task)
        background_tasks_status[task_id] = {"status": "processing", "future": future}
        
        # Get initial result (this will block until completion)
        result = future.result()
        
        return GalleryProcessResponse(**result)
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Gallery not found: {str(e)}")
    except Exception as e:
        logger.error(f"Error processing gallery: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")

# Batch gallery processing endpoint
@app.post("/api/gallery/batch-process")
async def batch_process_galleries(
    background_tasks: BackgroundTasks,
    request: BatchProcessRequest
):
    """
    Process multiple galleries in batch.
    
    Useful for processing multiple wedding galleries simultaneously.
    """
    if not photo_sorter:
        raise HTTPException(status_code=503, detail="Photo sorter not initialized")
    
    if len(request.gallery_paths) == 0:
        raise HTTPException(status_code=400, detail="No gallery paths provided")
    
    # Validate paths
    for path in request.gallery_paths:
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail=f"Gallery not found: {path}")
    
    # Start batch processing
    batch_id = f"batch_{int(time.time())}"
    
    def batch_process_task():
        results = []
        for i, gallery_path in enumerate(request.gallery_paths):
            wedding_id = request.wedding_ids[i] if request.wedding_ids and i < len(request.wedding_ids) else None
            
            try:
                result = photo_sorter.process_gallery(gallery_path, wedding_id)
                results.append({
                    "gallery_path": gallery_path,
                    "wedding_id": wedding_id,
                    "status": "success",
                    "result": result
                })
            except Exception as e:
                results.append({
                    "gallery_path": gallery_path,
                    "wedding_id": wedding_id,
                    "status": "error",
                    "error": str(e)
                })
        return results
    
    future = executor.submit(batch_process_task)
    background_tasks_status[batch_id] = {"status": "processing", "future": future}
    
    return {
        "batch_id": batch_id,
        "status": "processing",
        "total_galleries": len(request.gallery_paths),
        "message": "Batch processing started"
    }

# Vector similarity search endpoint
@app.post("/api/faces/search-similar")
async def search_similar_faces(request: SearchSimilarRequest):
    """
    Search for faces similar to a given embedding vector.
    
    This endpoint performs vector similarity search using the ChromaDB database.
    """
    if not photo_sorter:
        raise HTTPException(status_code=503, detail="Photo sorter not initialized")
    
    if not photo_sorter.collection:
        raise HTTPException(status_code=503, detail="Vector database not available")
    
    try:
        # Validate embedding dimension
        if len(request.embedding) != 512:
            raise HTTPException(status_code=400, detail="Embedding must be 512 dimensions")
        
        # Search for similar faces
        results = photo_sorter.search_similar_faces(
            query_embedding=request.embedding,
            wedding_id=request.wedding_id,
            limit=request.limit
        )
        
        return {
            "query_embedding_dim": len(request.embedding),
            "similarity_threshold": photo_sorter.similarity_threshold,
            "results_found": len(results),
            "results": results
        }
        
    except Exception as e:
        logger.error(f"Error in vector search: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

# Gallery statistics endpoint
@app.get("/api/gallery/stats/{gallery_path:path}", response_model=GalleryStatsResponse)
async def get_gallery_statistics(gallery_path: str):
    """
    Get detailed statistics about a wedding gallery.
    
    Provides insights into the gallery composition, processing requirements,
    and whether it can handle 50+ faces per photo as required.
    """
    if not photo_sorter:
        raise HTTPException(status_code=503, detail="Photo sorter not initialized")
    
    try:
        stats = photo_sorter.get_gallery_statistics(gallery_path)
        return GalleryStatsResponse(gallery_path=gallery_path, **stats)
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Gallery not found: {str(e)}")
    except Exception as e:
        logger.error(f"Error getting gallery stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")

# Background task status endpoint
@app.get("/api/tasks/{task_id}")
async def get_task_status(task_id: str):
    """Get the status of a background task."""
    if task_id not in background_tasks_status:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = background_tasks_status[task_id]
    
    if task_info["status"] == "processing":
        if task_info["future"].done():
            try:
                result = task_info["future"].result()
                task_info["status"] = "completed"
                task_info["result"] = result
            except Exception as e:
                task_info["status"] = "failed"
                task_info["error"] = str(e)
    
    return task_info

# System information endpoint
@app.get("/api/system/info")
async def get_system_info():
    """Get system and model information."""
    if not photo_sorter:
        return {
            "status": "not_initialized",
            "message": "Photo sorter not initialized"
        }
    
    return {
        "model_name": photo_sorter.model_name,
        "detection_size": photo_sorter.det_size,
        "similarity_threshold": photo_sorter.similarity_threshold,
        "max_workers": photo_sorter.max_workers,
        "gpu_context": photo_sorter.ctx_id,
        "chromadb_available": photo_sorter.chroma_client is not None,
        "collection_name": photo_sorter.collection.name if photo_sorter.collection else None
    }

# Convenience endpoint for direct function usage
@app.post("/api/find-matches")
async def find_matches_direct(
    selfie_path: str = Query(..., description="Path to selfie image"),
    gallery_path: str = Query(..., description="Path to wedding gallery"),
    wedding_id: Optional[str] = Query(None, description="Wedding identifier"),
    similarity_threshold: float = Query(0.4, ge=0.0, le=1.0, description="Similarity threshold")
):
    """
    Direct function call for finding matches (convenience endpoint).
    
    This implements the exact function specified in the requirements:
    find_matches_in_gallery(selfie_path, gallery_path, wedding_id, similarity_threshold)
    """
    try:
        result = find_matches_in_gallery(
            selfie_path=selfie_path,
            gallery_path=gallery_path,
            wedding_id=wedding_id,
            similarity_threshold=similarity_threshold
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Error in direct match finding: {e}")
        raise HTTPException(status_code=500, detail=f"Matching failed: {str(e)}")

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Wedding Photo Sorting API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "selfie_search": "/api/selfie/search",
            "gallery_process": "/api/gallery/process",
            "batch_process": "/api/gallery/batch-process",
            "vector_search": "/api/faces/search-similar",
            "gallery_stats": "/api/gallery/stats/{gallery_path}",
            "system_info": "/api/system/info",
            "direct_match": "/api/find-matches"
        }
    }


if __name__ == "__main__":
    import uvicorn
    
    # Run with production settings
    uvicorn.run(
        "fastapi_app:app",
        host="0.0.0.0",
        port=8000,
        reload=False,  # Disable reload in production
        workers=1,     # Single worker for GPU memory management
        log_level="info"
    )
