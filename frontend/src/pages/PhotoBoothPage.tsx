/**
 * Photo Booth Page
 * 
 * This page provides the main Photo Booth experience with enhanced face detection
 * and better user guidance for the wedding website.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Users, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PhotoBooth from '@/components/PhotoBooth';

const PhotoBoothPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
                <h1 className="text-2xl font-bold text-gray-900">Photo Booth</h1>
                <p className="text-gray-600">AI-powered photo booth with face detection</p>
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
                <Camera className="w-6 h-6" />
                Welcome to the Photo Booth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">How It Works</h3>
                  <ol className="space-y-2 text-gray-600">
                    <li>1. Click "Start Camera" to begin</li>
                    <li>2. Position your face in the center of the frame</li>
                    <li>3. Wait for face detection (green boxes will appear)</li>
                    <li>4. Click "Take Photo" when ready</li>
                    <li>5. Your photo will be automatically downloaded</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4">Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Real-time face detection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Multiple face support
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Confidence scoring
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Automatic photo download
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Enhanced error handling
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photo Booth Component */}
          <PhotoBooth />

          {/* Tips Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Tips for Best Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Lighting Tips</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Face a window or light source</li>
                    <li>• Avoid backlighting (light behind you)</li>
                    <li>• Ensure even lighting on your face</li>
                    <li>• Avoid harsh shadows</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Positioning Tips</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Center your face in the frame</li>
                    <li>• Look directly at the camera</li>
                    <li>• Keep your face at arm's length</li>
                    <li>• Avoid extreme angles</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle>Having Issues?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">"No Face Detected" Error</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check your lighting - face should be well-lit</li>
                    <li>• Ensure your face is centered in the frame</li>
                    <li>• Try moving closer or farther from the camera</li>
                    <li>• Make sure nothing is blocking your face</li>
                    <li>• Click "Retry Detection" to try again</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Camera Not Working</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Allow camera permissions when prompted</li>
                    <li>• Make sure no other app is using the camera</li>
                    <li>• Try refreshing the page</li>
                    <li>• Check if your camera is working in other apps</li>
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

export default PhotoBoothPage;
