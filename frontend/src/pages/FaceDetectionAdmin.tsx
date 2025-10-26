import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Image as ImageIcon, 
  Upload, 
  Search, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  Eye,
  Download
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { motion } from 'framer-motion';

interface Guest {
  id: string;
  photos: string[];
  name?: string;
  referenceImage: string;
}

interface GalleryStats {
  totalGuests: number;
  totalPhotos: number;
  totalFaces: number;
}

const FaceDetectionAdmin: React.FC = () => {
  const [sisterAGuests, setSisterAGuests] = useState<Guest[]>([]);
  const [sisterBGuests, setSisterBGuests] = useState<Guest[]>([]);
  const [statsA, setStatsA] = useState<GalleryStats>({ totalGuests: 0, totalPhotos: 0, totalFaces: 0 });
  const [statsB, setStatsB] = useState<GalleryStats>({ totalGuests: 0, totalPhotos: 0, totalFaces: 0 });
  const [loading, setLoading] = useState(true);
  const [testImage, setTestImage] = useState<File | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [activeWedding, setActiveWedding] = useState<'sister_a' | 'sister_b'>('sister_a');

  useEffect(() => {
    loadFaceData();
  }, []);

  const loadFaceData = async () => {
    try {
      setLoading(true);
      
      // Load Sister A data
      const mappingAResponse = await fetch(`${API_BASE_URL}/backend/guest_mapping_sister_a.json`);
      const mappingA = await mappingAResponse.json();
      
      const guestsA: Guest[] = Object.keys(mappingA).map(guestId => ({
        id: guestId,
        photos: mappingA[guestId],
        referenceImage: `${API_BASE_URL}/backend/reference_images/sister_a/${guestId}/${guestId}_rep.jpg`
      }));
      
      setSisterAGuests(guestsA);
      setStatsA({
        totalGuests: guestsA.length,
        totalPhotos: new Set(Object.values(mappingA).flat()).size,
        totalFaces: Object.values(mappingA).flat().length
      });

      // Load Sister B data
      const mappingBResponse = await fetch(`${API_BASE_URL}/backend/guest_mapping_sister_b.json`);
      const mappingB = await mappingBResponse.json();
      
      const guestsB: Guest[] = Object.keys(mappingB).map(guestId => ({
        id: guestId,
        photos: mappingB[guestId],
        referenceImage: `${API_BASE_URL}/backend/reference_images/sister_b/${guestId}/${guestId}_rep.jpg`
      }));
      
      setSisterBGuests(guestsB);
      setStatsB({
        totalGuests: guestsB.length,
        totalPhotos: new Set(Object.values(mappingB).flat()).size,
        totalFaces: Object.values(mappingB).flat().length
      });

    } catch (error) {
      console.error('Error loading face data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestFaceRecognition = async () => {
    if (!testImage) return;

    try {
      setTestLoading(true);
      const formData = new FormData();
      formData.append('file', testImage);
      formData.append('wedding_name', activeWedding);

      const response = await fetch(`${API_BASE_URL}/api/recognize`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setTestResults(result);
    } catch (error) {
      console.error('Error testing face recognition:', error);
      setTestResults({ error: 'Failed to test face recognition' });
    } finally {
      setTestLoading(false);
    }
  };

  const renderGuestCard = (guest: Guest) => (
    <motion.div
      key={guest.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="p-4">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>{guest.id}</span>
            <Badge variant="secondary">{guest.photos.length} photos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={guest.referenceImage}
              alt={guest.id}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-face.png';
              }}
            />
          </div>
          <div className="space-y-2">
            <Input 
              placeholder="Add name..." 
              className="text-sm"
              defaultValue={guest.name}
            />
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="w-3 h-3 mr-1" />
              View Photos
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg">Loading face detection data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Face Detection Admin</h1>
        <p className="text-gray-600">Manage and view face recognition data for both wedding galleries</p>
      </motion.div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sister A - Total Guests</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsA.totalGuests}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statsA.totalFaces} faces detected
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sister B - Total Guests</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsB.totalGuests}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {statsB.totalFaces} faces detected
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
              <ImageIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statsA.totalPhotos + statsB.totalPhotos}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across both galleries
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sister-a" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sister-a">Sister A Gallery</TabsTrigger>
          <TabsTrigger value="sister-b">Sister B Gallery</TabsTrigger>
          <TabsTrigger value="test">Test Recognition</TabsTrigger>
        </TabsList>

        <TabsContent value="sister-a" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sister A - Detected Guests ({sisterAGuests.length})</h2>
            <Button onClick={loadFaceData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sisterAGuests.map(renderGuestCard)}
          </div>
        </TabsContent>

        <TabsContent value="sister-b" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sister B - Detected Guests ({sisterBGuests.length})</h2>
            <Button onClick={loadFaceData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {sisterBGuests.map(renderGuestCard)}
          </div>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Face Recognition</CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload a photo to test the face recognition system
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Wedding</label>
                <div className="flex gap-2">
                  <Button
                    variant={activeWedding === 'sister_a' ? 'default' : 'outline'}
                    onClick={() => setActiveWedding('sister_a')}
                    className="flex-1"
                  >
                    Sister A
                  </Button>
                  <Button
                    variant={activeWedding === 'sister_b' ? 'default' : 'outline'}
                    onClick={() => setActiveWedding('sister_b')}
                    className="flex-1"
                  >
                    Sister B
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Test Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setTestImage(e.target.files?.[0] || null)}
                />
              </div>

              {testImage && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preview</label>
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(testImage)}
                      alt="Test preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleTestFaceRecognition}
                disabled={!testImage || testLoading}
                className="w-full"
              >
                {testLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find Matches
                  </>
                )}
              </Button>

              {testResults && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Results</label>
                  {testResults.error ? (
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <p className="text-sm text-red-700">{testResults.error}</p>
                      </CardContent>
                    </Card>
                  ) : testResults.matches && testResults.matches.length > 0 ? (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <p className="text-sm font-medium text-green-700">
                            Found {testResults.matches.length} matching photo(s)!
                          </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {testResults.matches.map((match: string, index: number) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden bg-white">
                              <img
                                src={match}
                                alt={`Match ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                        <p className="text-sm text-yellow-700">No matches found</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FaceDetectionAdmin;

