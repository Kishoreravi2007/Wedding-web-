import os
import cv2
import numpy as np
from deepface import DeepFace
from deepface.commons import image_utils # Updated import
import json
import shutil
import argparse

# Configuration
MODEL_NAME = "VGG-Face" # or "Facenet", "OpenFace", "DeepFace", "DeepID", "ArcFace", "Dlib"
DETECTOR_BACKEND = "opencv" # or "ssd", "dlib", "mtcnn", "retinaface", "mediapipe", "yolov8"
DISTANCE_METRIC = "cosine" # or "euclidean", "euclidean_l2"
THRESHOLD = 0.4 # Cosine similarity threshold for clustering. Adjust as needed. Lower means stricter clustering.

def get_image_paths(directory):
    image_paths = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                image_paths.append(os.path.join(root, file))
    return image_paths

def cluster_faces(gallery_dir, reference_images_dir, guest_mapping_file):
    print(f"Starting face clustering process for gallery: {gallery_dir}")

    # Clear existing reference images for this specific wedding
    if os.path.exists(reference_images_dir):
        shutil.rmtree(reference_images_dir)
    os.makedirs(reference_images_dir)

    image_paths = get_image_paths(gallery_dir)
    if not image_paths:
        print(f"No images found in {gallery_dir}. Please add photos to this directory.")
        return

    all_faces_data = [] # Stores {'embedding': [...], 'img_path': '...', 'face_img': np.array}

    print(f"Scanning {len(image_paths)} images for faces...")
    for img_path in image_paths:
        try:
            img_tuple = image_utils.load_image(img_path)
            # Check if load_image returns a tuple (img, path) or just img
            if isinstance(img_tuple, tuple):
                img = img_tuple[0]
            else:
                img = img_tuple
            
            # Detect faces and get their regions
            face_objs = DeepFace.extract_faces(
                img_path=img,
                detector_backend=DETECTOR_BACKEND,
                enforce_detection=False # Allow processing even if no face is detected
            )

            if face_objs:
                for face_obj in face_objs:
                    facial_area = face_obj['facial_area']
                    if facial_area['w'] > 0 and facial_area['h'] > 0:
                        x = facial_area['x']
                        y = facial_area['y']
                        w = facial_area['w']
                        h = facial_area['h']
                        face_img = img[y:y+h, x:x+w]
                        
                        # Generate embedding for the detected face
                        embedding_objs = DeepFace.represent(
                            img_path=face_img,
                            model_name=MODEL_NAME,
                            detector_backend="skip", # Face is already detected
                            enforce_detection=False
                        )
                        if embedding_objs:
                            all_faces_data.append({
                                'embedding': embedding_objs[0]['embedding'],
                                'img_path': img_path,
                                'face_img': face_img # Store the cropped face image
                            })
            else:
                print(f"No face detected in {img_path}")

        except Exception as e:
            print(f"Error processing {img_path}: {e}")

    if not all_faces_data:
        print("No faces detected across all images. Exiting clustering.")
        return

    print(f"Detected {len(all_faces_data)} faces. Starting clustering...")

    clusters = [] # Each cluster will be a list of indices from all_faces_data
    guest_mapping = {}
    guest_count = 0

    for i, face_data_i in enumerate(all_faces_data):
        found_cluster = False
        for cluster_idx, cluster in enumerate(clusters):
            # Compare with the representative face of the cluster (first face added to the cluster)
            representative_face_data = all_faces_data[cluster[0]]
            
            distance = DeepFace.verify(
                img1_path=face_data_i['face_img'], # Pass the cropped face image
                img2_path=representative_face_data['face_img'], # Pass the cropped face image
                model_name=MODEL_NAME,
                distance_metric=DISTANCE_METRIC,
                detector_backend="skip", # Faces are already detected and cropped
                enforce_detection=False
            )['distance']

            if distance < THRESHOLD:
                clusters[cluster_idx].append(i)
                found_cluster = True
                break
        
        if not found_cluster:
            # Create a new cluster
            clusters.append([i])
            guest_count += 1
            guest_id = f"Guest_{guest_count:03d}"
            guest_mapping[guest_id] = []
            
            # Save the representative face for the new cluster
            representative_face_img = face_data_i['face_img']
            guest_folder = os.path.join(reference_images_dir, guest_id) # Use the argument
            os.makedirs(guest_folder, exist_ok=True)
            cv2.imwrite(os.path.join(guest_folder, f"{guest_id}_rep.jpg"), representative_face_img)
            print(f"Created new guest: {guest_id}")

    print(f"Clustering complete. Found {len(clusters)} unique guests.")

    # Populate guest_mapping with original image paths
    for cluster_idx, cluster in enumerate(clusters):
        guest_id = f"Guest_{cluster_idx + 1:03d}"
        guest_mapping[guest_id] = []
        for face_idx in cluster:
            original_img_path = all_faces_data[face_idx]['img_path']
            # Store relative path for mapping
            relative_path = os.path.relpath(original_img_path, os.getcwd()).replace("\\", "/")
            if relative_path not in guest_mapping[guest_id]:
                guest_mapping[guest_id].append(relative_path)

    # Save guest mapping to JSON
    with open(guest_mapping_file, 'w') as f:
        json.dump(guest_mapping, f, indent=2)
    print(f"Guest mapping saved to {guest_mapping_file}")

    print("Face clustering process finished.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Cluster faces from wedding photos.")
    parser.add_argument("--gallery", required=True, help="Path to the wedding gallery directory (e.g., uploads/wedding_gallery/sister_a)")
    parser.add_argument("--output", required=True, help="Path to the output reference images directory (e.g., backend/reference_images/sister_a)")
    parser.add_argument("--mapping", default="backend/guest_mapping.json", help="Path to save the guest mapping JSON file.")
    args = parser.parse_args()

    # Ensure output directory exists
    os.makedirs(args.output, exist_ok=True)

    cluster_faces(args.gallery, args.output, args.mapping)
