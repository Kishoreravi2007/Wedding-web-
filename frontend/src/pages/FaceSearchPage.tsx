/**
 * Face Search Page
 * 
 * This page provides the main face search experience for guests
 * to find photos of themselves from the wedding event.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Users, Camera, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FaceSearch from '@/components/FaceSearch';

const FaceSearchPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/')}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Find Your Photos</h1>
                <p className="text-gray-600">AI-powered face search to find photos of yourself</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Welcome Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500" />
                Welcome to Face Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">How It Works</h3>
                  <ol className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
                      <span>Upload a clear selfie of yourself</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
                      <span>Our AI will detect and analyze your face</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">3</div>
                      <span>Search through all wedding photos automatically</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">4</div>
                      <span>View and download matching photos with confidence scores</span>
                    </li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4">Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      AI-powered face recognition
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Confidence scoring for matches
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      High-quality photo downloads
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Privacy-focused (no data stored)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Works on all devices
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Instant results
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Face Search Component */}
          <FaceSearch eventId="wedding-event" />

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Your Privacy is Protected</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Your selfie is processed locally in your browser</li>
                    <li>• No photos are stored on our servers</li>
                    <li>• Face data is not saved or shared</li>
                    <li>• All processing happens on your device</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">How It Works</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Face detection using advanced AI models</li>
                    <li>• Mathematical face comparison algorithms</li>
                    <li>• Secure cloud storage for event photos</li>
                    <li>• No personal data collection</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips for Best Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Tips for Best Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Photo Quality</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Use a clear, well-lit selfie</li>
                    <li>• Look directly at the camera</li>
                    <li>• Ensure your face is centered</li>
                    <li>• Avoid sunglasses or face coverings</li>
                    <li>• Use a recent photo for best matching</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Troubleshooting</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• If no matches found, try a different photo</li>
                    <li>• Ensure good lighting in your selfie</li>
                    <li>• Make sure your face is clearly visible</li>
                    <li>• Try different angles or expressions</li>
                    <li>• Contact support if issues persist</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FaceSearchPage;
