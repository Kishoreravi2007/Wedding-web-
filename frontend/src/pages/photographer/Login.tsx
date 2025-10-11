import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const PhotographerLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate a more realistic API call
    try {
      // In a real application, you would make an API call to your backend for authentication
      // For demonstration, we'''ll simulate a delay and check against environment variables
      // or a more secure client-side storage, but for now, we'''ll keep the logic simple.
      await new Promise(resolve => setTimeout(resolve, 1500));

      // IMPORTANT: Replace this with a real authentication mechanism
      if (credentials.username === 'photographer' && credentials.password === 'qwerty') {
        showSuccess('Login successful! Welcome to the Photographer Portal.');
        navigate('/photographer');
      } else {
        throw new Error('Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      showError(error.message || 'An unexpected error occurred. Please try again.');
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
            <p className="text-gray-600 mt-2">Sign in to upload and manage your stunning wedding photos.</p>
          </CardHeader>
          
          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base font-medium text-gray-800">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your professional username"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
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
                    placeholder="Enter your secure password"
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="text-lg"
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
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Secure Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-md text-gray-600">
            The Ultimate Wedding Photography Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotographerLogin;
