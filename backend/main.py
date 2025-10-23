from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from deepface import DeepFace
import cv2
import numpy as np
import base64
import os
import json

app = FastAPI()

# Base directory for reference images and wedding galleries
BASE_REFERENCE_DIR = "backend/reference_images"
BASE_GALLERY_DIR = "uploads/wedding_gallery"
GUEST_MAPPING_FILE_TEMPLATE = "backend/guest_mapping_{wedding_name}.json"

@app.post("/api/recognize")
async def recognize_face(
    file: UploadFile = File(...),
    wedding_name: str = Form(...) # Expecting 'sister_a' or 'sister_b'
):
    try:
        # Validate wedding_name
        if wedding_name not in ["sister_a", "sister_b"]:
            raise HTTPException(status_code=400, detail="Invalid wedding_name provided. Must be 'sister_a' or 'sister_b'.")

        reference_images_dir = os.path.join(BASE_REFERENCE_DIR, wedding_name)
        guest_mapping_file = GUEST_MAPPING_FILE_TEMPLATE.format(wedding_name=wedding_name)

        # Read the uploaded image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Could not decode image.")

        # Ensure the reference image directory exists and has been populated
        if not os.path.exists(reference_images_dir) or not os.listdir(reference_images_dir):
            return JSONResponse(status_code=404, content={"message": f"Reference images directory for {wedding_name} not found or empty. Please run clustering script."})
        
        if not os.path.exists(guest_mapping_file):
            return JSONResponse(status_code=404, content={"message": f"Guest mapping file for {wedding_name} not found. Please run clustering script."})

        # Load guest mapping
        with open(guest_mapping_file, 'r') as f:
            guest_mapping = json.load(f)

        # Perform face recognition
        dfs = DeepFace.find(
            img_path=img,
            db_path=reference_images_dir,
            model_name="VGG-Face",
            detector_backend="opencv",
            distance_metric="cosine",
            enforce_detection=False
        )

        if not dfs or dfs[0].empty:
            return JSONResponse(status_code=404, content={"message": "No matching photos found."})

        matched_original_photos = []
        for df in dfs:
            for index, row in df.iterrows():
                identity_path = row['identity']
                # Extract the guest ID from the identity path (e.g., 'Guest_001_rep.jpg' -> 'Guest_001')
                guest_id = os.path.basename(os.path.dirname(identity_path))
                
                if guest_id in guest_mapping:
                    # Prepend the base gallery path to the relative paths stored in mapping
                    full_paths = [os.path.join(BASE_GALLERY_DIR, p) for p in guest_mapping[guest_id]]
                    matched_original_photos.extend(full_paths)
        
        # Remove duplicates and convert to web-friendly paths
        matched_original_photos = list(set(matched_original_photos))
        # Convert Windows paths to URL-friendly paths
        web_paths = [p.replace("\\", "/") for p in matched_original_photos]

        return JSONResponse(status_code=200, content={"message": "Photos found!", "matches": web_paths})

    except Exception as e:
        print(f"Error during face recognition: {e}")
        return JSONResponse(status_code=500, content={"message": f"An error occurred: {str(e)}"})
