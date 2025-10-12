export interface Face {
  descriptor: Float32Array;
  detection?: any; // face-api.js FaceDetection object (made optional as we might not always have full detection)
  personName?: string; // Optional: to store recognized person's name
  box?: { x: number; y: number; width: number; height: number }; // Optional: bounding box of the face
}

export interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  title: string;
  description?: string;
  tags: string[];
  event: string;
  date: string;
  views: number;
  downloads: number;
  isUploaded?: boolean;
  faces?: Face[]; // Optional: array of detected faces in the photo
  photographer?: string; // Optional: name of the photographer
  timestamp?: Date; // Optional: when the photo was taken/uploaded, `date` is already a string.
}
