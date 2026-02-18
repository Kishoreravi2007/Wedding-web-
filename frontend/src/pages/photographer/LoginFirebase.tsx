/**
 * Photographer Login with Firebase Authentication
 * 
 * This component provides photographer login using Firebase Auth
 * with proper role-based access control.
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useFirebaseAuth } from '@/contexts/AuthContext';

const PhotographerLoginFirebase = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useFirebaseAuth();

  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await signIn(credentials.email, credentials.password);

      // Check if user has photographer role
      if (user.role !== 'photographer') {
        showError('Access denied. Photographer role required.');
        return;
      }

      showSuccess('Login successful! Welcome to the Photographer Portal.');
      navigate('/photographer');

    } catch (error: any) {
      showError(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <Card className="shadow-2xl border-gray-300">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-4 ring-4 ring-gray-300">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Photographer Portal</CardTitle>
            <p className="text-gray-600 mt-2">Sign in with your Firebase account to upload and manage wedding photos.</p>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-medium text-gray-800">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={credentials.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-gray-800">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="text-lg pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-4 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-semibold py-4 text-lg"
                disabled={isLoading || loading}
              >
                {isLoading || loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Sign In with Firebase'
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Demo Credentials:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Email:</strong> photographer@wedding.com</p>
                <p><strong>Password:</strong> photo123</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-md text-gray-600">
            Professional Wedding Photography Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotographerLoginFirebase;
