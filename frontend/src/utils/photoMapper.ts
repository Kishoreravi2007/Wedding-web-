import { Photo as PhotoType } from '@/types/photo';

interface ApiFaceDescriptor {
  descriptor?: number[] | Float32Array;
}

interface ApiFace {
  bounding_box?: { x: number; y: number; width: number; height: number };
  box?: { x: number; y: number; width: number; height: number };
  confidence?: number;
  is_verified?: boolean;
  person_id?: string | null;
  person?: { name?: string };
  people?: { name?: string };
  face_descriptor_id?: string;
  face_descriptors?: ApiFaceDescriptor | null;
}

interface ApiPhoto {
  id: string;
  public_url?: string;
  publicUrl?: string;
  url?: string;
  thumbnail?: string;
  filename?: string;
  title?: string;
  description?: string | null;
  tags?: string[] | null;
  sister?: string | null;
  event_type?: string | null;
  uploaded_at?: string | null;
  created_at?: string | null;
  timestamp?: string | null;
  views?: number | null;
  downloads?: number | null;
  photographer?: string | null;
  photographer_id?: string | null;
  photo_faces?: ApiFace[] | null;
}

const toFloat32Array = (values?: number[] | Float32Array): Float32Array | undefined => {
  if (!values) return undefined;
  if (values instanceof Float32Array) return values;
  try {
    return new Float32Array(values);
  } catch (error) {
    console.warn('Unable to convert descriptor to Float32Array:', error);
    return undefined;
  }
};

export const mapApiPhotoToPhotoType = (apiPhoto: ApiPhoto): PhotoType => {
  const url = apiPhoto.public_url || apiPhoto.publicUrl || apiPhoto.url || '';
  const uploadedAt = apiPhoto.uploaded_at || apiPhoto.created_at || apiPhoto.timestamp || new Date().toISOString();

  const faces = (apiPhoto.photo_faces || []).map((face) => ({
    descriptor: toFloat32Array(face.face_descriptors?.descriptor) || new Float32Array(),
    detection: undefined,
    personName: face.people?.name || face.person?.name || undefined,
    box: face.bounding_box || face.box,
  }));

  return {
    id: apiPhoto.id,
    url,
    thumbnail: apiPhoto.thumbnail || url,
    title: apiPhoto.title || apiPhoto.filename || 'Untitled Photo',
    description: apiPhoto.description || '',
    tags: apiPhoto.tags || [],
    event: apiPhoto.event_type || apiPhoto.sister || undefined,
    date: new Date(uploadedAt).toISOString(),
    views: apiPhoto.views || 0,
    downloads: apiPhoto.downloads || 0,
    photographer: apiPhoto.photographer || apiPhoto.photographer_id || undefined,
    faces,
    timestamp: new Date(uploadedAt),
  };
};


