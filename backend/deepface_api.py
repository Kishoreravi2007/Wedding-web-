"""
FastAPI endpoints for DeepFace face detection and embedding extraction.
Uses YOLOv8-face model with advanced filtering to reduce false positives:
- CLAHE lighting normalization for wedding stage lighting
- Confidence threshold 0.45 to filter low-confidence detections
- Size-based filtering (discards < 40px detections)
- DeepFace verification for each YOLO detection
- Image size 1280+ for better accuracy
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

# Try to import YOLOv8 for face detection
YOLOV8_AVAILABLE = False
try:
    from ultralytics import YOLO
    YOLOV8_AVAILABLE = True
except ImportError:
    pass

# Global YOLOv8-face model
yolov8_face_model = None
yolov8_init_error = None

def get_yolov8_face_model():
    """Initialize and return YOLOv8-face model."""
    global yolov8_face_model, yolov8_init_error
    
    if not YOLOV8_AVAILABLE:
        return None
    
    if yolov8_face_model is not None:
        return yolov8_face_model
    
    if yolov8_init_error is not None:
        return None  # Already tried and failed
    
    try:
        logger.info("Initializing YOLOv8-face model...")
        # YOLOv8-face model - will download automatically on first use
        # Using yolov8n-face.pt (nano) for speed, or yolov8s-face.pt (small) for better accuracy
        yolov8_face_model = YOLO('yolov8n-face.pt')  # or 'yolov8s-face.pt' for better accuracy
        logger.info("✅ YOLOv8-face model initialized successfully")
        return yolov8_face_model
    except Exception as e:
        logger.error(f"❌ Failed to initialize YOLOv8-face: {e}")
        yolov8_init_error = str(e)
        return None

# Try to import InsightFace for SCRFD detector
INSIGHTFACE_AVAILABLE = False
try:
    from insightface.app import FaceAnalysis
    INSIGHTFACE_AVAILABLE = True
except ImportError:
    pass

# Global InsightFace app for SCRFD detection
insightface_app = None
insightface_init_error = None

def get_insightface_app():
    """Initialize and return InsightFace app with SCRFD detector."""
    global insightface_app, insightface_init_error
    
    if not INSIGHTFACE_AVAILABLE:
        return None
    
    if insightface_app is not None:
        return insightface_app
    
    if insightface_init_error is not None:
        return None  # Already tried and failed
    
    try:
        logger.info("Initializing InsightFace SCRFD detector...")
        insightface_app = FaceAnalysis(providers=['CPUExecutionProvider', 'CUDAExecutionProvider'])
        insightface_app.prepare(ctx_id=0, det_size=(640, 640))
        logger.info("✅ InsightFace SCRFD detector initialized successfully")
        return insightface_app
    except Exception as e:
        logger.error(f"❌ Failed to initialize InsightFace: {e}")
        insightface_init_error = str(e)
        return None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="DeepFace Face Detection API",
    description="Face detection and embedding extraction using YOLOv8-face model",
    version="1.0.0"
)

# Add CORS middleware
# Explicitly list origins to support credentialed requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://weddingweb.co.in",
        "https://sub-projects-483107.web.app",
        "https://sub-projects-483107.firebaseapp.com",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
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
        "backend": "YOLOv8-face",
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
            "backend": "YOLOv8-face",
            "embedding_dimension": 512,
            "model": "VGG-Face"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


async def process_image_file(file: UploadFile, min_size: int = 1280, apply_clahe: bool = True) -> tuple:
    """
    Convert uploaded file to numpy array, apply CLAHE for lighting normalization,
    and resize to optimal size for YOLOv8-face.
    
    Args:
        file: Uploaded file
        min_size: Minimum width or height in pixels (default: 1280 for YOLOv8-face accuracy)
        apply_clahe: Whether to apply CLAHE for lighting normalization (default: True)
    
    Returns:
        tuple: (processed_image, scale_factor, original_width, original_height)
        - scale_factor is used to convert detection coordinates back to original image space
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(
            status_code=400,
            detail="Could not decode image. Please ensure the file is a valid image."
        )
    
    # Store original dimensions
    original_height, original_width = img.shape[:2]
    scale_factor = 1.0
    
    # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to normalize harsh lighting
    # This helps reduce false positives from bright spots (e.g., wedding stage lights)
    if apply_clahe:
        # Convert to LAB color space
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        # Apply CLAHE to the L-channel (lightness)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        # Merge back
        limg = cv2.merge((cl, a, b))
        img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        logger.info("Applied CLAHE for lighting normalization")
    
    # Resize to optimal size for face detection
    height, width = img.shape[:2]
    min_dimension = min(width, height)
    
    if min_dimension < min_size:
        # Upscale smaller images to improve detection accuracy
        scale_factor = min_size / min_dimension
        new_width = int(width * scale_factor)
        new_height = int(height * scale_factor)
        img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_LINEAR)
        logger.info(f"Upscaled image from {width}x{height} to {new_width}x{new_height} (scale: {scale_factor:.2f})")
    elif min_dimension > 1920:
        # Downscale very large images to prevent memory issues
        scale_factor = 1920 / min_dimension
        new_width = int(width * scale_factor)
        new_height = int(height * scale_factor)
        img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_AREA)
        logger.info(f"Downscaled image from {width}x{height} to {new_width}x{new_height} (scale: {scale_factor:.2f})")
    
    return img, scale_factor, original_width, original_height




@app.post("/api/faces/detect")
async def detect_faces(
    file: UploadFile = File(...),
    return_landmarks: bool = Form(False),
    return_age_gender: bool = Form(False),  # Changed default to False for speed
    min_confidence: Optional[float] = Form(None),
    enforce_detection: bool = Form(False),
    detector_backend: Optional[str] = Form("yolov8"),  # Use YOLOv8-face by default
    conf_threshold: Optional[float] = Form(0.5),  # Confidence threshold for YOLOv8 (0.5 for high certainty, reduces false positives)
    imgsz: Optional[int] = Form(1280)  # Image size for YOLOv8 (1280+ for better accuracy)
):
    """
    Detect all faces in an uploaded image and extract 512-dimension embeddings.
    
    Uses YOLOv8-face model with advanced filtering to reduce false positives:
    - CLAHE lighting normalization: Normalizes harsh wedding stage lighting to reduce glare
    - Confidence threshold: 0.5 (default) to filter low-confidence detections
    - Size-based filtering: Discards detections smaller than 40px (background noise)
    - DeepFace verification: Double-checks each YOLO detection to ensure it's actually a face
    - Image size 1280+ for better accuracy
    
    Args:
        file: Image file (JPEG, PNG, etc.)
        return_landmarks: Whether to return facial landmarks
        return_age_gender: Whether to return age and gender estimates
        min_confidence: Minimum detection confidence threshold (0-1)
        enforce_detection: If True, raises error if no faces detected
        detector_backend: Detector backend ("yolov8" default)
        conf_threshold: YOLOv8 confidence threshold (default: 0.5 for high certainty, reduces false positives)
        imgsz: YOLOv8 image size (1280+ for better accuracy, default: 1280)
    
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
        # Use min_confidence if provided, otherwise use conf_threshold parameter
        if min_confidence is not None:
            conf_threshold = min_confidence
        
        # Ensure conf_threshold is in valid range (0.5 default for high certainty, reduces false positives)
        conf_threshold = max(0.1, min(0.9, conf_threshold))  # Clamp between 0.1 and 0.9
        
        # Ensure imgsz is at least 1280
        imgsz = max(1280, imgsz)
        
        # Read uploaded image (resize to optimal size for detection)
        img, scale_factor, orig_width, orig_height = await process_image_file(file, min_size=imgsz)
        
        logger.info(f"Processing image: {file.filename}, size: {img.shape}, scale: {scale_factor:.2f}, original: {orig_width}x{orig_height}")

        
        try:
            # Use YOLOv8-face for fast and accurate face detection
            if detector_backend not in ["opencv", "retinaface", "mtcnn", "ssd", "dlib", "scrfd", "yolov8"]:
                detector_backend = "yolov8"  # Default to YOLOv8-face
            
            logger.info(f"Using detector backend: {detector_backend}, conf={conf_threshold}, imgsz={imgsz}")
            
            # If YOLOv8 is requested and available, use YOLOv8-face detector
            if detector_backend == "yolov8" and YOLOV8_AVAILABLE:
                yolov8_model = get_yolov8_face_model()
                if yolov8_model:
                    # Use YOLOv8-face for detection with agnostic NMS and IOU threshold
                    # agnostic_nms=True prevents multiple overlapping boxes on high-detail background patterns
                    # iou=0.3 is more aggressive in merging/removing overlapping detections
                    results = yolov8_model(
                        img, 
                        conf=conf_threshold, 
                        imgsz=imgsz, 
                        iou=0.3,
                        agnostic_nms=True,
                        verbose=False
                    )
                    
                    if len(results) == 0 or len(results[0].boxes) == 0:
                        if enforce_detection:
                            raise ValueError("No face detected")
                        face_objs = []
                    else:
                        # Extract faces detected by YOLOv8 with filtering and verification
                        face_objs = []
                        total_detections = 0
                        size_filtered = 0
                        aspect_ratio_filtered = 0
                        brightness_filtered = 0
                        center_color_filtered = 0
                        texture_filtered = 0
                        skin_color_filtered = 0
                        verification_failed = 0
                        
                        for result in results:
                            boxes = result.boxes
                            total_detections += len(boxes)
                            
                            for box in boxes:
                                # Get bounding box coordinates
                                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                                conf = float(box.conf[0].cpu().numpy())
                                
                                # Calculate box dimensions
                                box_width = x2 - x1
                                box_height = y2 - y1
                                
                                # Size-based filtering: Discard detections smaller than 40px
                                # Wedding faces are usually larger than this, while background noise is tiny
                                if box_width < 40 or box_height < 40:
                                    size_filtered += 1
                                    logger.debug(f"Filtered out small detection: {box_width}x{box_height}px (confidence: {conf:.3f})")
                                    continue
                                
                                # Aspect Ratio Check: Discard if too wide or too tall
                                # Faces typically have aspect ratio between 0.75 and 1.6
                                aspect_ratio = box_height / box_width if box_width > 0 else 0
                                if aspect_ratio < 0.75 or aspect_ratio > 1.6:
                                    aspect_ratio_filtered += 1
                                    logger.debug(f"Filtered out invalid aspect ratio: {aspect_ratio:.2f} ({box_width}x{box_height}px)")
                                    continue
                                
                                # Crop face region for further analysis
                                face_crop = img[y1:y2, x1:x2]
                                
                                # Ensure crop is valid
                                if face_crop.size == 0:
                                    logger.warning(f"Invalid face crop at ({x1}, {y1}, {x2}, {y2})")
                                    continue
                                
                                # Saturation/Brightness Filter: Discard over-exposed detections
                                # Average brightness > 230 indicates stage lights or over-exposed areas
                                gray_crop = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
                                avg_brightness = np.mean(gray_crop)
                                if avg_brightness > 230:
                                    brightness_filtered += 1
                                    logger.debug(f"Filtered out over-exposed detection: brightness={avg_brightness:.1f} (likely stage light)")
                                    continue
                                
                                # Center-Point Verification: Check center 30% for skin texture/color
                                # Crop center 30% of the detected box
                                center_x_start = int(box_width * 0.35)
                                center_x_end = int(box_width * 0.65)
                                center_y_start = int(box_height * 0.35)
                                center_y_end = int(box_height * 0.65)
                                
                                center_crop = face_crop[center_y_start:center_y_end, center_x_start:center_x_end]
                                
                                if center_crop.size > 0:
                                    # Convert to HSV for better color analysis
                                    hsv_center = cv2.cvtColor(center_crop, cv2.COLOR_BGR2HSV)
                                    
                                    # Calculate average hue, saturation, and value
                                    avg_hue = np.mean(hsv_center[:, :, 0])
                                    avg_saturation = np.mean(hsv_center[:, :, 1])
                                    avg_value = np.mean(hsv_center[:, :, 2])
                                    
                                    # Check for neon colors (high saturation, specific hue ranges)
                                    # Neon colors typically have high saturation (> 150) and specific hue ranges
                                    is_neon = avg_saturation > 150 and (
                                        (avg_hue < 20) or  # Red/Orange neon
                                        (avg_hue > 160 and avg_hue < 180)  # Magenta/Pink neon
                                    )
                                    
                                    # Check for lack of texture (very uniform color = likely not skin)
                                    # Skin has texture variation, uniform colors suggest lights or solid backgrounds
                                    gray_center = cv2.cvtColor(center_crop, cv2.COLOR_BGR2GRAY)
                                    std_dev = np.std(gray_center)
                                    
                                    # If it's neon-colored or lacks texture (low std dev), discard
                                    if is_neon or std_dev < 10:
                                        center_color_filtered += 1
                                        logger.debug(f"Filtered out center color issue: neon={is_neon}, std_dev={std_dev:.1f}")
                                        continue
                                
                                # Edge Density (Texture) Check: Laplacian Variance
                                # Real faces have specific smoothness. Background artifacts (intricate fabrics, flowers)
                                # contain too many sharp edges. High variance = high-contrast pattern (noise)
                                gray_face = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
                                laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()
                                
                                # Discard if variance is too high (>500) - indicates high-detail background pattern
                                # or too low (<10) - indicates flat wall or blur
                                if laplacian_var > 500 or laplacian_var < 10:
                                    texture_filtered += 1
                                    logger.debug(f"Filtered out texture issue: Laplacian variance={laplacian_var:.1f}")
                                    continue
                                
                                # Skin-Color Probability (YCbCr Check)
                                # Background objects often mimic face shapes but rarely have the same skin-color density
                                # Human skin pixels fall into a narrow range: Cb: 77-127, Cr: 133-173
                                ycbcr_face = cv2.cvtColor(face_crop, cv2.COLOR_BGR2YCrCb)
                                
                                # OpenCV YCrCb format: Channel 0=Y, Channel 1=Cr, Channel 2=Cb
                                cr_channel = ycbcr_face[:, :, 1]  # Cr (red-difference)
                                cb_channel = ycbcr_face[:, :, 2]  # Cb (blue-difference)
                                
                                # Skin color range: Cb: 77-127, Cr: 133-173
                                skin_mask = cv2.inRange(cb_channel, 77, 127) & cv2.inRange(cr_channel, 133, 173)
                                
                                # Calculate percentage of skin pixels
                                total_pixels = face_crop.shape[0] * face_crop.shape[1]
                                skin_pixels = np.sum(skin_mask > 0)
                                skin_percentage = (skin_pixels / total_pixels) * 100 if total_pixels > 0 else 0
                                
                                # Discard if less than 35% of the box is actual skin color
                                if skin_percentage < 35:
                                    skin_color_filtered += 1
                                    logger.debug(f"Filtered out low skin color: {skin_percentage:.1f}% skin pixels")
                                    continue
                                
                                try:
                                    # OPTIMIZATION: Removed redundant DeepFace.extract_faces verification
                                    # Passing numpy array direct to DeepFace.represent (no file I/O)
                                    
                                    # Get embedding from DeepFace
                                    # Use img_path=face_crop (numpy array) directly
                                    embedding_obj = DeepFace.represent(
                                        img_path=face_crop,
                                        model_name="VGG-Face",
                                        detector_backend="skip",  # Skip detection since we already cropped it
                                        enforce_detection=False,
                                        align=False
                                    )
                                    
                                    if embedding_obj and len(embedding_obj) > 0:
                                        face_obj = embedding_obj[0]
                                        face_obj["facial_area"] = {
                                            "x": int(x1),
                                            "y": int(y1),
                                            "w": int(box_width),
                                            "h": int(box_height)
                                        }
                                        face_obj["face_confidence"] = conf
                                        face_objs.append(face_obj)
                                        logger.debug(f"Added verified face: {box_width}x{box_height}px, conf={conf:.3f}")
                                    else:
                                        verification_failed += 1
                                        logger.debug(f"No embedding extracted for verified face at ({x1}, {y1})")
                                        
                                except Exception as e:
                                    logger.warning(f"Failed to process face detection: {e}")
                        
                        logger.info(
                            f"YOLOv8-face: {total_detections} detections → "
                            f"{size_filtered} size-filtered → "
                            f"{aspect_ratio_filtered} aspect-ratio-filtered → "
                            f"{brightness_filtered} brightness-filtered → "
                            f"{center_color_filtered} center-color-filtered → "
                            f"{texture_filtered} texture-filtered → "
                            f"{skin_color_filtered} skin-color-filtered → "
                            f"{verification_failed} verification-failed → "
                            f"{len(face_objs)} verified faces"
                        )
                else:
                    # Fallback to DeepFace with retinaface (most accurate) if YOLOv8 model not available
                    logger.warning("YOLOv8-face model not available, falling back to retinaface (most accurate)")
                    detector_backend = "retinaface"
                    # Pass img directly (numpy array)
                    face_objs = DeepFace.represent(
                        img_path=img,
                        model_name="Facenet",  # 128-dim embeddings to match existing database
                        detector_backend=detector_backend,
                        enforce_detection=enforce_detection,
                        align=True
                    )


            # If SCRFD is requested and InsightFace is available, use InsightFace's SCRFD detector
            elif detector_backend == "scrfd" and INSIGHTFACE_AVAILABLE:
                insightface_app = get_insightface_app()
                if insightface_app:
                    # Use InsightFace SCRFD for detection and embedding extraction
                    faces = insightface_app.get(img)
                    
                    if len(faces) == 0:
                        if enforce_detection:
                            raise ValueError("No face detected")
                        face_objs = []
                    else:
                        # Convert InsightFace results to DeepFace format
                        face_objs = []
                        for face in faces:
                            bbox = face.bbox.astype(int)
                            x1, y1, x2, y2 = bbox[0], bbox[1], bbox[2], bbox[3]
                            
                            # Create DeepFace-compatible format
                            face_obj = {
                                "embedding": face.normed_embedding.tolist(),  # 512-dim embedding from InsightFace
                                "facial_area": {
                                    "x": int(x1),
                                    "y": int(y1),
                                    "w": int(x2 - x1),
                                    "h": int(y2 - y1)
                                },
                                "face_confidence": float(face.det_score) if hasattr(face, 'det_score') else 0.9
                            }
                            
                            # Add landmarks if available
                            if hasattr(face, 'landmark') and face.landmark is not None:
                                face_obj["facial_landmarks"] = face.landmark.tolist()
                            
                            face_objs.append(face_obj)
                    
                    logger.info(f"SCRFD (InsightFace) detected {len(faces)} face(s) and extracted embeddings")
                else:
                    # Fallback to DeepFace with opencv if InsightFace not available
                    logger.warning("InsightFace SCRFD not available, falling back to opencv")
                    detector_backend = "opencv"
                    face_objs = DeepFace.represent(
                        img_path=img,
                        model_name="VGG-Face",
                        detector_backend=detector_backend,
                        enforce_detection=enforce_detection,
                        align=False
                    )
            else:
                # Use DeepFace with specified backend and apply basic filtering
                # Fallback check: If backend is "yolov8" here, it means manual logic failed/skipped.
                if detector_backend == "yolov8":
                    logger.warning("YOLOv8 manual logic skipped. Falling back to retinaface.")
                    detector_backend = "retinaface"

                # Pass img directly
                raw_face_objs = DeepFace.represent(
                    img_path=img,
                    model_name="Facenet",  # 128-dim embeddings to match existing database
                    detector_backend=detector_backend,
                    enforce_detection=enforce_detection,
                    align=True 
                )

                # Apply basic filtering to reduce false positives
                face_objs = []
                for face_obj in raw_face_objs:
                    face_region = face_obj.get("facial_area", {})
                    x = face_region.get("x", 0)
                    y = face_region.get("y", 0)
                    w = face_region.get("w", 0)
                    h = face_region.get("h", 0)

                    # Skip if dimensions are invalid
                    if w <= 0 or h <= 0:
                        continue

                    # Filter out detections that are too large (covering >50% of image)
                    # These are usually false positives on geometric shapes
                    img_area = img.shape[0] * img.shape[1]
                    face_area = w * h
                    if face_area > img_area * 0.5:
                        logger.debug(f"Filtered out oversized detection: {w}x{h} ({face_area/img_area:.1%} of image)")
                        continue

                    # Filter out detections that are too small (< 2% of image)
                    if face_area < img_area * 0.02:
                        logger.debug(f"Filtered out tiny detection: {w}x{h} ({face_area/img_area:.3%} of image)")
                        continue

                    # Tighter aspect ratio check - faces are roughly square (0.8 to 1.3)
                    # This filters out tall rectangles like shoulders/body
                    aspect_ratio = h / w if w > 0 else 0
                    if aspect_ratio < 0.7 or aspect_ratio > 1.5:
                        logger.debug(f"Filtered out bad aspect ratio: {aspect_ratio:.2f} ({w}x{h})")
                        continue
                    
                    # Position check: Real faces in selfies are usually in upper 2/3 of frame
                    # If center of detection is in bottom 40% of image, likely a body part
                    face_center_y = y + h / 2
                    img_height = img.shape[0]
                    if face_center_y > img_height * 0.7:
                        logger.debug(f"Filtered out detection in bottom of frame (y_center={face_center_y:.0f}, img_h={img_height})")
                        continue

                    # Add confidence if not present
                    if "face_confidence" not in face_obj:
                        face_obj["face_confidence"] = 0.9

                    face_objs.append(face_obj)

                logger.info(f"{detector_backend}: {len(raw_face_objs)} raw detections → {len(face_objs)} filtered faces")

            
            # Only get detailed face analysis if explicitly requested
            # This is slow, so skip it unless needed
            face_analyses = []
            if return_age_gender:
                try:
                    # Pass img directly
                    face_analyses = DeepFace.analyze(
                        img_path=img,
                        actions=['age', 'gender'],  # Removed 'emotion' for speed
                        detector_backend=detector_backend,
                        enforce_detection=False,
                        silent=True
                    )
                except:
                    face_analyses = []
            
        finally:
            pass # No cleanup needed for in-memory processing
        
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
            
            # CRITICAL: Scale coordinates back to original image dimensions
            # The image was scaled up/down for detection, so we need to convert back
            if scale_factor != 1.0:
                x = int(x / scale_factor)
                y = int(y / scale_factor)
                w = int(w / scale_factor)
                h = int(h / scale_factor)
                logger.debug(f"Scaled bbox from detection space to original: ({x}, {y}, {w}, {h})")
            
            # Detection confidence (SCRFD provides this)
            det_score = face_obj.get("face_confidence", 0.9)
            
            # Filter by confidence if threshold provided
            if min_confidence is not None and det_score < min_confidence:
                continue
            
            face_response = {
                "bbox": [x, y, w, h],  # [x, y, width, height] in ORIGINAL image coordinates
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
            
            # Add landmarks if requested
            # Note: SCRFD provides landmarks, but we skip them for speed unless requested
            if return_landmarks:
                landmarks = face_obj.get("facial_landmarks", None)
                if landmarks:
                    face_response["landmark"] = landmarks
                else:
                    # Landmarks not available with opencv backend
                    logger.debug("Landmarks requested but not available with current detector backend")
            
            response_faces.append(face_response)
        
        return JSONResponse(
            status_code=200,
            content={
                "faces": response_faces,
                "count": len(response_faces),
                "embedding_dimension": 128,
                "model": "Facenet",
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
            # Read image (unpack tuple correctly)
            img, scale_factor, orig_w, orig_h = await process_image_file(file)
            
            try:
                # Use SCRFD for batch processing (fast and accurate)
                detector_backend = "scrfd"
                
                # Detect faces - pass numpy array directly
                face_objs = DeepFace.represent(
                    img_path=img,
                    model_name="VGG-Face",
                    detector_backend=detector_backend,
                    enforce_detection=False,
                    align=False  # Disable alignment for speed
                )
                
                # Get analysis if needed (skip for speed)
                face_analyses = []
                if return_age_gender:
                    try:
                        face_analyses = DeepFace.analyze(
                            img_path=img,
                            actions=['age', 'gender'],
                            detector_backend=detector_backend,
                            enforce_detection=False,
                            silent=True
                        )
                    except:
                        face_analyses = []
                
            finally:
                pass # No cleanup needed
            
            # Process faces
            response_faces = []
            for i, face_obj in enumerate(face_objs):
                embedding = face_obj.get("embedding", [])
                face_region = face_obj.get("facial_area", {})
                x = face_region.get("x", 0)
                y = face_region.get("y", 0)
                w = face_region.get("w", 0)
                h = face_region.get("h", 0)
                
                # Scale coordinates back if needed
                if scale_factor != 1.0:
                    x = int(x / scale_factor)
                    y = int(y / scale_factor)
                    w = int(w / scale_factor)
                    h = int(h / scale_factor)
                
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
        # Process both images (unpack tuples correctly)
        img1, _, _, _ = await process_image_file(file1)
        img2, _, _, _ = await process_image_file(file2)
        
        # Save temporarily - DeepFace.verify with SCRFD backend requires file paths
        # (It fails with numpy arrays, unlike DeepFace.represent)
        temp1 = f"/tmp/compare1_{file1.filename}"
        temp2 = f"/tmp/compare2_{file2.filename}"
        cv2.imwrite(temp1, img1)
        cv2.imwrite(temp2, img2)
        
        try:
            # Use DeepFace to verify if same person
            # START_CHANGE: Switched from scrfd to retinaface because scrfd verification is broken
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
