/**
 * Face Verification Panel
 * 
 * Interface for manually verifying or correcting face identifications
 * with confidence threshold management and bulk operations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  X,
  AlertCircle,
  Users,
  Settings,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  UserCheck,
  UserX,
  Edit
} from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { showSuccess, showError } from '@/utils/toast';

interface UnidentifiedFace {
  id: string;
  bounding_box: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  photo: {
    id: string;
    filename: string;
    public_url: string;
    title: string;
  };
}

interface Person {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
}

interface LowConfidenceFace {
  id: string;
  confidence: number;
  is_verified: boolean;
  bounding_box: any;
  person: Person;
  photo: {
    id: string;
    filename: string;
    public_url: string;
  };
}

const FaceVerificationPanel: React.FC = () => {
  const [unidentifiedFaces, setUnidentifiedFaces] = useState<UnidentifiedFace[]>([]);
  const [lowConfidenceFaces, setLowConfidenceFaces] = useState<LowConfidenceFace[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFace, setSelectedFace] = useState<UnidentifiedFace | LowConfidenceFace | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [reprocessing, setReprocessing] = useState(false);
  const [defaultThreshold, setDefaultThreshold] = useState(0.6);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch unidentified faces
      const unidentifiedRes = await fetch(
        `${API_BASE_URL}/api/photos-enhanced/unidentified-faces?limit=50`,
        { headers: getAuthHeaders() }
      );
      const unidentifiedData = await unidentifiedRes.json();
      setUnidentifiedFaces(unidentifiedData.faces);

      // Fetch people
      const peopleRes = await fetch(
        `${API_BASE_URL}/api/faces/people`,
        { headers: getAuthHeaders() }
      );
      const peopleData = await peopleRes.json();
      setPeople(peopleData.people);

      // Fetch low confidence faces
      const lowConfRes = await fetch(
        `${API_BASE_URL}/api/faces/statistics`,
        { headers: getAuthHeaders() }
      );
      // This would need to be implemented in the backend
      // For now, we'll leave it empty
      setLowConfidenceFaces([]);

    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load verification data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFace = async (faceId: string, personId: string, isVerified: boolean = true) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/faces/verify/${faceId}`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ personId, isVerified })
        }
      );

      if (!response.ok) throw new Error('Verification failed');

      showSuccess('Face verified successfully');
      loadData(); // Reload data
      setSelectedFace(null);
      setSelectedPerson('');
    } catch (error) {
      console.error('Error verifying face:', error);
      showError('Failed to verify face');
    }
  };

  const handleReprocessWithThreshold = async (threshold: number) => {
    setReprocessing(true);
    try {
      const faceIds = unidentifiedFaces.map(f => f.id);
      
      const response = await fetch(
        `${API_BASE_URL}/api/photos-enhanced/reprocess-faces`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ faceIds, threshold })
        }
      );

      if (!response.ok) throw new Error('Reprocessing failed');

      const data = await response.json();
      const successCount = data.results.filter((r: any) => r.success).length;
      
      showSuccess(`Reprocessed ${successCount} faces successfully`);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error reprocessing:', error);
      showError('Failed to reprocess faces');
    } finally {
      setReprocessing(false);
    }
  };

  const handleBulkVerify = async (faceIds: string[], personId: string) => {
    try {
      const promises = faceIds.map(faceId =>
        fetch(`${API_BASE_URL}/api/faces/verify/${faceId}`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ personId, isVerified: true })
        })
      );

      await Promise.all(promises);
      showSuccess(`Verified ${faceIds.length} faces`);
      loadData();
    } catch (error) {
      console.error('Error bulk verifying:', error);
      showError('Failed to verify faces');
    }
  };

  const filteredPeople = people.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Face Verification & Management
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Review and verify unidentified or low-confidence face detections
              </p>
            </div>
            <Button onClick={loadData} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="unidentified" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="unidentified">
            <UserX className="w-4 h-4 mr-2" />
            Unidentified ({unidentifiedFaces.length})
          </TabsTrigger>
          <TabsTrigger value="low-confidence">
            <AlertCircle className="w-4 h-4 mr-2" />
            Low Confidence ({lowConfidenceFaces.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Unidentified Faces Tab */}
        <TabsContent value="unidentified" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : unidentifiedFaces.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">All faces have been identified!</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-600">
                      {unidentifiedFaces.length} unidentified face(s) found
                    </p>
                    <Button
                      onClick={() => handleReprocessWithThreshold(defaultThreshold - 0.1)}
                      disabled={reprocessing}
                    >
                      {reprocessing ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Retry with Lower Threshold
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {unidentifiedFaces.map((face) => (
                      <div
                        key={face.id}
                        className="group relative cursor-pointer"
                        onClick={() => setSelectedFace(face)}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={face.photo.public_url}
                            alt={face.photo.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          {/* Face box overlay */}
                          <div
                            className="absolute border-2 border-yellow-400 bg-yellow-400 bg-opacity-10"
                            style={{
                              left: `${face.bounding_box.x}%`,
                              top: `${face.bounding_box.y}%`,
                              width: `${face.bounding_box.width}%`,
                              height: `${face.bounding_box.height}%`
                            }}
                          />
                        </div>
                        <div className="mt-2">
                          <p className="text-sm font-medium truncate">
                            {face.photo.title}
                          </p>
                          <Badge variant="secondary" className="mt-1">
                            Unknown
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Low Confidence Tab */}
        <TabsContent value="low-confidence" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">
                  Low confidence faces feature coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Face Recognition Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">
                    Default Confidence Threshold: {Math.round(defaultThreshold * 100)}%
                  </Label>
                  <Slider
                    value={[defaultThreshold]}
                    onValueChange={(value) => setDefaultThreshold(value[0])}
                    min={0.3}
                    max={0.95}
                    step={0.05}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Lower threshold = More matches but potentially less accurate
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Batch Operations</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Reprocess all unidentified faces with a new threshold
                  </p>
                  <Button
                    onClick={() => handleReprocessWithThreshold(defaultThreshold)}
                    disabled={reprocessing || unidentifiedFaces.length === 0}
                    variant="outline"
                  >
                    {reprocessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Reprocess All Unidentified Faces
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2">Statistics</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Unidentified Faces</p>
                      <p className="text-2xl font-bold">{unidentifiedFaces.length}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Total People</p>
                      <p className="text-2xl font-bold">{people.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Verification Dialog */}
      {selectedFace && (
        <Dialog open={!!selectedFace} onOpenChange={() => setSelectedFace(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Identify Person in Photo</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Photo Preview */}
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedFace.photo.public_url}
                  alt={selectedFace.photo.title}
                  className="w-full h-full object-contain"
                />
                {/* Highlighted face */}
                <div
                  className="absolute border-4 border-blue-500 bg-blue-500 bg-opacity-20"
                  style={{
                    left: `${selectedFace.bounding_box.x}%`,
                    top: `${selectedFace.bounding_box.y}%`,
                    width: `${selectedFace.bounding_box.width}%`,
                    height: `${selectedFace.bounding_box.height}%`
                  }}
                />
              </div>

              {/* Person Selection */}
              <div className="space-y-2">
                <Label>Search and Select Person</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredPeople.map((person) => (
                  <div
                    key={person.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPerson === person.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedPerson(person.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{person.name}</p>
                        <p className="text-sm text-gray-600">{person.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedFace(null);
                  setSelectedPerson('');
                  setSearchQuery('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedPerson) {
                    handleVerifyFace(selectedFace.id, selectedPerson, true);
                  }
                }}
                disabled={!selectedPerson}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verify Identity
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Helper component
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

export default FaceVerificationPanel;

