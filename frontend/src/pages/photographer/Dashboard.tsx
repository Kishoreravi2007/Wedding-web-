import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import PhotoGallery from '@/components/PhotoGallery-simple';
import PeopleManager from '@/components/PeopleManager';
import { PhotoUploadSimple } from '@/components/PhotoUpload-simple'; // Import PhotoUploadSimple
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image, Users, BarChart3, LogOut, Camera, Settings, Download, Eye, Star } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import Select components
import { Label } from '@/components/ui/label'; // Import Label
import { useWebsite } from '@/contexts/WebsiteContext';
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

  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);

  const handleSignOut = async () => {
    navigate('/');
  };

  const handlePhotosUploaded = (photoId: string) => { // PhotoUploadFirebase returns a single photoId
    console.log('Photo uploaded with ID:', photoId);
    
    // For now, we'll just update stats. A full implementation would fetch the photo details by ID.
    setStats(prev => ({
      ...prev,
      totalPhotos: prev.totalPhotos + 1,
      uploadedToday: prev.uploadedToday + 1
    }));
    
    // We can't easily add to recentUploads or uploadedPhotos without fetching the full photo object.
    // For a real app, you'd fetch the photo details using photoId and then update state.
    // For now, we'll just show a success message.
    const weddingName = photographerWeddingOptions.find(option => option.value === selectedWeddingId)?.label || 'Unknown Wedding';
    showSuccess(`Photo uploaded successfully! ID: ${photoId} for ${weddingName}`);
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
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Photos
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Recent Uploads
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Photo Gallery
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
                    <PhotoUploadSimple weddingId={selectedWeddingId} />
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
                {recentUploads.map((upload) => (
                  <Card key={upload.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Image className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{upload.name}</h3>
                          <p className="text-sm text-gray-600">{upload.size} • {upload.uploadTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{upload.event}</Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Photo Gallery Management</h2>
              <p className="text-gray-600 mb-6">
                View, edit, and manage all uploaded wedding photos.
                Tag people in photos to enable face-based search for guests.
              </p>
              <PhotoGallery isPhotographerView={true} uploadedPhotos={uploadedPhotos} />
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default PhotographerDashboard;
