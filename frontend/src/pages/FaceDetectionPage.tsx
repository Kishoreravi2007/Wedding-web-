/**
 * Face Detection Page
 * 
 * This page provides the face detection feature for the wedding website
 * with a clean, integrated interface.
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FaceDetectionPage: React.FC = () => {
  const navigate = useNavigate();

  const openFaceDetection = () => {
    // Open the standalone face detection page
    window.open('/face-detection.html', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
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
                <h1 className="text-2xl font-bold text-gray-900">Face Detection</h1>
                <p className="text-gray-600">AI-powered face detection and analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Feature Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-6 h-6" />
                AI Face Detection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-4">Features</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Real-time face detection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Photo upload analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Webcam live detection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Emotion recognition
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Facial landmark detection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Confidence scoring
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg mb-4">Perfect for Wedding Photos</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Automatic face tagging
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Guest photo discovery
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Emotion analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Group photo organization
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Photo quality assessment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Interactive photo booth
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How to Use */}
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">📸 Photo Upload</h4>
                  <ol className="space-y-2 text-gray-600">
                    <li>1. Click "Upload Photo" button</li>
                    <li>2. Select an image from your device</li>
                    <li>3. Wait for face detection to complete</li>
                    <li>4. View results with bounding boxes</li>
                    <li>5. Download the annotated image</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">📹 Live Webcam</h4>
                  <ol className="space-y-2 text-gray-600">
                    <li>1. Click "Start Webcam" button</li>
                    <li>2. Allow camera permissions</li>
                    <li>3. See real-time face detection</li>
                    <li>4. View live statistics</li>
                    <li>5. Click "Stop Webcam" when done</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">AI Models</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• TinyFaceDetector</li>
                    <li>• FaceLandmark68Net</li>
                    <li>• FaceRecognitionNet</li>
                    <li>• FaceExpressionNet</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Performance</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Real-time processing</li>
                    <li>• Client-side only</li>
                    <li>• No data collection</li>
                    <li>• Privacy protected</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Features</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• 7 emotion categories</li>
                    <li>• 68 facial landmarks</li>
                    <li>• Confidence scoring</li>
                    <li>• Batch processing</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Launch Button */}
          <div className="text-center">
            <Button
              onClick={openFaceDetection}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg"
            >
              <Camera className="w-6 h-6 mr-2" />
              Launch Face Detection
              <ExternalLink className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-gray-500 mt-4">
              Opens in a new tab for the best experience
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceDetectionPage;
