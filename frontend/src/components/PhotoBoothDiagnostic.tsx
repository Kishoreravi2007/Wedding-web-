/**
 * Photo Booth Diagnostic Component
 * 
 * This component helps diagnose and fix Photo Booth issues
 * by providing detailed troubleshooting information.
 */

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  AlertCircle, 
  CheckCircle, 
  Camera, 
  Users, 
  Lightbulb,
  RefreshCw,
  Info
} from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  solution?: string;
}

const PhotoBoothDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // Test 1: Check if face-api.js is loaded
    try {
      if (typeof window !== 'undefined' && (window as any).faceapi) {
        results.push({
          test: 'Face-api.js Library',
          status: 'pass',
          message: 'Face-api.js library is loaded successfully'
        });
      } else {
        results.push({
          test: 'Face-api.js Library',
          status: 'fail',
          message: 'Face-api.js library is not loaded',
          solution: 'Check if face-api.js is properly imported and models are available'
        });
      }
    } catch (error) {
      results.push({
        test: 'Face-api.js Library',
        status: 'fail',
        message: 'Error checking face-api.js library',
        solution: 'Ensure face-api.js is properly loaded'
      });
    }

    // Test 2: Check camera permissions
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      results.push({
        test: 'Camera Access',
        status: 'pass',
        message: 'Camera access granted successfully'
      });
      stream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      let solution = 'Check camera permissions in your browser settings';
      if (error.name === 'NotAllowedError') {
        solution = 'Click "Allow" when prompted for camera access, or check browser settings';
      } else if (error.name === 'NotFoundError') {
        solution = 'No camera found. Please connect a camera and try again';
      }
      
      results.push({
        test: 'Camera Access',
        status: 'fail',
        message: `Camera access denied: ${error.message}`,
        solution
      });
    }

    // Test 3: Check HTTPS/localhost
    try {
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      
      if (isSecure) {
        results.push({
          test: 'Secure Context',
          status: 'pass',
          message: 'Running in secure context (HTTPS or localhost)'
        });
      } else {
        results.push({
          test: 'Secure Context',
          status: 'fail',
          message: 'Not running in secure context',
          solution: 'Use HTTPS or localhost for camera access to work'
        });
      }
    } catch (error) {
      results.push({
        test: 'Secure Context',
        status: 'fail',
        message: 'Error checking secure context',
        solution: 'Ensure you are using HTTPS or localhost'
      });
    }

    // Test 4: Check browser compatibility
    try {
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasCanvas = !!document.createElement('canvas').getContext;
      const hasWebGL = !!document.createElement('canvas').getContext('webgl');
      
      if (hasGetUserMedia && hasCanvas && hasWebGL) {
        results.push({
          test: 'Browser Compatibility',
          status: 'pass',
          message: 'Browser supports all required features'
        });
      } else {
        const missing = [];
        if (!hasGetUserMedia) missing.push('getUserMedia');
        if (!hasCanvas) missing.push('Canvas');
        if (!hasWebGL) missing.push('WebGL');
        
        results.push({
          test: 'Browser Compatibility',
          status: 'fail',
          message: `Missing browser features: ${missing.join(', ')}`,
          solution: 'Use a modern browser like Chrome, Firefox, Safari, or Edge'
        });
      }
    } catch (error) {
      results.push({
        test: 'Browser Compatibility',
        status: 'fail',
        message: 'Error checking browser compatibility',
        solution: 'Try using a different browser'
      });
    }

    // Test 5: Check model files
    try {
      const response = await fetch('/models/tiny_face_detector_model-weights_manifest.json');
      if (response.ok) {
        results.push({
          test: 'Face Detection Models',
          status: 'pass',
          message: 'Face detection models are accessible'
        });
      } else {
        results.push({
          test: 'Face Detection Models',
          status: 'fail',
          message: 'Face detection models not found',
          solution: 'Run: cd backend && node setup-face-models.js'
        });
      }
    } catch (error) {
      results.push({
        test: 'Face Detection Models',
        status: 'fail',
        message: 'Error checking face detection models',
        solution: 'Ensure model files are in /models/ directory'
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const failedTests = diagnostics.filter(d => d.status === 'fail').length;
  const passedTests = diagnostics.filter(d => d.status === 'pass').length;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Photo Booth Diagnostic
          </CardTitle>
          <p className="text-gray-600">
            Troubleshooting tool to identify and fix Photo Booth issues
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-blue-900">Diagnostic Summary</h3>
              <Button
                onClick={runDiagnostics}
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                {isRunning ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isRunning ? 'Running...' : 'Run Again'}
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{passedTests}</div>
                <div className="text-green-700">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{failedTests}</div>
                <div className="text-red-700">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{diagnostics.length}</div>
                <div className="text-blue-700">Total</div>
              </div>
            </div>
          </div>

          {/* Diagnostic Results */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Test Results</h3>
            
            {diagnostics.map((diagnostic, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getStatusColor(diagnostic.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(diagnostic.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{diagnostic.test}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        diagnostic.status === 'pass' ? 'bg-green-100 text-green-800' :
                        diagnostic.status === 'fail' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {diagnostic.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{diagnostic.message}</p>
                    {diagnostic.solution && (
                      <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Solution:</p>
                            <p className="text-sm text-blue-800">{diagnostic.solution}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Common Issues */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-3">Common Photo Booth Issues</h3>
            <div className="space-y-2 text-sm text-yellow-800">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>"Take Photo" button is disabled:</strong> Ensure your face is detected first. 
                  Position your face in the center of the camera frame with good lighting.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Camera not starting:</strong> Check browser permissions and ensure you're using HTTPS or localhost.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>No face detection:</strong> Ensure good lighting, position your face clearly, and try different angles.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <div>
                  <strong>Models not loading:</strong> Check if face-api.js models are available at /models/ directory.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Fixes */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3">Quick Fixes</h3>
            <div className="space-y-2 text-sm text-green-800">
              <div>1. <strong>Refresh the page</strong> to reload models and reset the camera</div>
              <div>2. <strong>Allow camera permissions</strong> when prompted by your browser</div>
              <div>3. <strong>Ensure good lighting</strong> on your face for better detection</div>
              <div>4. <strong>Position your face</strong> in the center of the camera frame</div>
              <div>5. <strong>Try a different browser</strong> if issues persist</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoBoothDiagnostic;
