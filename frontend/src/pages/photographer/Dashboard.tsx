import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { PhotoUploadSimple } from '@/components/PhotoUpload-simple'; // Import PhotoUploadSimple
import PhotoManager from './PhotoManager'; // Import PhotoManager
import FaceProcessor from './FaceProcessor'; // Import FaceProcessor
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image, Users, BarChart3, LogOut, Camera, Settings, Download, Eye, Star, Trash2 } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { mapApiPhotoToPhotoType } from '@/utils/photoMapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { Label } from '@/components/ui/label'; // Import Label
import { useWebsite } from '@/contexts/WebsiteContext';
import { Photo as PhotoType } from '@/types/photo'; // Import PhotoType
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
const PhotographerDashboard = () => {
  const navigate = useNavigate();
  const { content } = useWebsite();

  const photographerWeddingOptions = [ // Re-introduced for clarity
    { value: 'sister-a', label: 'Parvathy Wedding' },
    { value: 'sister-b', label: 'Sreedevi Wedding' },
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('parvathy-wedding'); // State for selected wedding, defaulting to 'parvathy-wedding' for simplicity

  // Wedding attendees data
  const [people, setPeople] = useState<any[]>([]);

  useEffect(() => {
    if (content) {
      setPeople([
        { id: '1', name: content.parvathy.name, role: 'Bride (Sister A)', avatar: '' },
        { id: '2', name: content.sreedevi.name, role: 'Bride (Sister B)', avatar: '' },
        { id: '3', name: 'Rajesh Kumar', role: 'Groom (Sister A)', avatar: '' },
        { id: '4,', name: 'Vikram Nair', role: 'Groom (Sister B)', avatar: '' },
        { id: '5', name: 'Lakshmi C', role: 'Mother of Brides', avatar: '' },
        { id: '6', name: 'Raman C', role: 'Father of Brides', avatar: '' },
        { id: '7', name: 'Priya C', role: 'Sister', avatar: '' },
        { id: '8', name: 'Arun C', role: 'Brother', avatar: '' },
        { id: '9', name: 'Dr. Suresh', role: 'Family Friend', avatar: '' },
        { id: '10', name: 'Meera', role: 'Best Friend', avatar: '' },
      ]);
      setIsLoading(false);
    }
  }, [content]);

  // Load all existing photos on component mount
  useEffect(() => {
    const loadAllPhotos = async () => {
      try {
        console.log('Loading all photos from API...');
        
        const [sisterAResponse, sisterBResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/photos?sister=sister-a`),
          fetch(`${API_BASE_URL}/api/photos?sister=sister-b`)
        ]);

        if (!sisterAResponse.ok || !sisterBResponse.ok) {
          console.error('Failed to fetch photos');
          return;
        }

        const [sisterAPhotosRaw, sisterBPhotosRaw] = await Promise.all([
          sisterAResponse.json(),
          sisterBResponse.json()
        ]);

        const allPhotosRaw = [...sisterAPhotosRaw, ...sisterBPhotosRaw];

        console.log(`Loaded ${allPhotosRaw.length} total photos (${sisterAPhotosRaw.length} Sister A, ${sisterBPhotosRaw.length} Sister B)`);

        const mappedPhotos: PhotoType[] = allPhotosRaw.map(mapApiPhotoToPhotoType);
        setUploadedPhotos(mappedPhotos);

        setStats(prev => ({
          ...prev,
          totalPhotos: allPhotosRaw.length,
          uploadedToday: allPhotosRaw.filter((p: any) => {
            const uploadDate = new Date(p.uploaded_at || p.created_at || p.timestamp);
            const today = new Date();
            return uploadDate.toDateString() === today.toDateString();
          }).length
        }));

        const sortedPhotos = [...allPhotosRaw]
          .sort((a: any, b: any) => new Date(b.uploaded_at || b.created_at || b.timestamp).getTime() - new Date(a.uploaded_at || a.created_at || a.timestamp).getTime())
          .slice(0, 5);

        setRecentUploads(sortedPhotos.map((photo: any) => ({
          id: photo.id,
          name: photo.title || photo.filename || 'Photo',
          size: formatFileSize(photo.size || 0),
          uploadTime: getTimeAgo(photo.uploaded_at || photo.created_at || photo.timestamp),
          event: photo.sister === 'sister-a' ? 'Sister A' : 'Sister B'
        })));

      } catch (error) {
        console.error('Error loading photos:', error);
      }
    };

    loadAllPhotos();
  }, []);

  // Helper function to get time ago
  const getTimeAgo = (date: string | Date): string => {
    const now = new Date();
    const uploadDate = new Date(date);
    const diffMs = now.getTime() - uploadDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // Photography statistics
  const [stats, setStats] = useState({
    totalPhotos: 0,
    uploadedToday: 0,
    totalViews: 0,
    avgRating: 0,
    totalDownloads: 0,
    eventsCovered: 0
  });

  // Recent uploads - starts empty, populated when photos are uploaded
  const [recentUploads, setRecentUploads] = useState<any[]>([]);

  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoType[]>([]);

  const handleSignOut = async () => {
    navigate('/');
  };

  const handlePhotoUploadSuccess = (photoId: string) => {
    fetch(`${API_BASE_URL}/api/photos/${photoId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch uploaded photo');
        }
        return response.json();
      })
      .then(photo => {
        if (!photo) {
          return;
        }

        const mappedPhoto = mapApiPhotoToPhotoType(photo);

        setUploadedPhotos(prev => {
          const withoutExisting = prev.filter(p => p.id !== mappedPhoto.id);
          return [mappedPhoto, ...withoutExisting];
        });

        setRecentUploads(prev => [{
          id: mappedPhoto.id,
          name: mappedPhoto.title,
          size: formatFileSize(photo.size || 0),
          uploadTime: 'Just now',
          event: mappedPhoto.event || ''
        }, ...prev].slice(0, 5));

        setStats(prev => ({
          ...prev,
          totalPhotos: prev.totalPhotos + 1,
          uploadedToday: prev.uploadedToday + 1
        }));

        showSuccess('Photo uploaded successfully!');
      })
      .catch(error => {
        console.error('Error fetching uploaded photo:', error);
      });
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpdatePhoto = (photoId: string, updates: Partial<PhotoType>) => {
    setUploadedPhotos(prev => prev.map(p => p.id === photoId ? { ...p, ...updates } : p));
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      // Remove from uploadedPhotos state
      setUploadedPhotos(prev => prev.filter(p => p.id !== photoId));
      
      // Remove from recentUploads state
      setRecentUploads(prev => prev.filter(u => u.id !== photoId));

      // Update statistics
      setStats(prev => ({
        ...prev,
        totalPhotos: Math.max(0, prev.totalPhotos - 1),
        uploadedToday: Math.max(0, prev.uploadedToday - 1)
      }));

      showSuccess('Photo deleted successfully!');
      console.log(`✅ Photo ${photoId} deleted successfully`);

    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-600">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin"></div>
          <p className="text-lg font-semibold">Loading Photographer Portal...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Photographer Portal</h1>
              <p className="text-gray-600">Professional wedding photography management</p>
            </div>
            <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Photos</p>
                  <p className="text-2xl font-bold">{stats.totalPhotos}</p>
                </div>
                <Image className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Uploaded Today</p>
                  <p className="text-2xl font-bold">{stats.uploadedToday}</p>
                </div>
                <Upload className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total Views</p>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.avgRating}⭐</p>
                </div>
                <Star className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100">Downloads</p>
                  <p className="text-2xl font-bold">{stats.totalDownloads}</p>
                </div>
                <Download className="w-8 h-8 text-indigo-200" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100">Events</p>
                  <p className="text-2xl font-bold">{stats.eventsCovered}</p>
                </div>
                <Camera className="w-8 h-8 text-pink-200" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Photos
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Recent Uploads
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Manage Photos
            </TabsTrigger>
            <TabsTrigger value="faces" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Process Faces
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Wedding Photos</h2>
              <p className="text-gray-600 mb-6">
                Upload your wedding photos with proper metadata and tags.
                Guests will be able to find their photos easily using our face detection system.
              </p>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="wedding-select">Select Wedding</Label>
                    <Select value={selectedWeddingId} onValueChange={setSelectedWeddingId}>
                      <SelectTrigger id="wedding-select">
                        <SelectValue placeholder="Select a wedding" />
                      </SelectTrigger>
                      <SelectContent>
                        {photographerWeddingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedWeddingId ? (
                    <PhotoUploadSimple weddingId={selectedWeddingId} onUploadSuccess={handlePhotoUploadSuccess} />
                  ) : (
                    <p className="text-gray-500 text-center mt-4">Please select a wedding to upload photos.</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Uploads</h2>
                <p className="text-gray-600 mb-6">
                  View and manage your recently uploaded photos.
                </p>
              
              <div className="space-y-4">
                {recentUploads.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No recent uploads yet. Upload some photos to see them here!</p>
                  </div>
                ) : (
                  recentUploads.map((upload) => {
                    // Find the full photo object for this upload
                    const fullPhoto = uploadedPhotos.find(p => p.id === upload.id);
                    
                    return (
                      <Card key={upload.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {fullPhoto && fullPhoto.thumbnail ? (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                <img 
                                  src={fullPhoto.thumbnail} 
                                  alt={upload.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Image className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900">{upload.name}</h3>
                              <p className="text-sm text-gray-600">{upload.size} • {upload.uploadTime}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{upload.event}</Badge>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  if (fullPhoto?.url) {
                                    window.open(fullPhoto.url, '_blank');
                                  }
                                }}
                                title="View photo"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  if (fullPhoto?.url) {
                                    const link = document.createElement('a');
                                    link.href = fullPhoto.url;
                                    link.download = upload.name;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }
                                }}
                                title="Download photo"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeletePhoto(upload.id)}
                                title="Delete photo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <PhotoManager />
          </TabsContent>

          <TabsContent value="faces" className="space-y-6">
            <FaceProcessor />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default PhotographerDashboard;
