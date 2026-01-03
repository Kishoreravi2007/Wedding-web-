import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const CoupleLogin = () => {
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

    try {
      const { API_BASE_URL } = await import('@/lib/api');
      const axios = (await import('axios')).default;

      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: credentials.username,
        password: credentials.password,
      });

      const token = response.data.accessToken || response.data.token;

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', response.data.user?.role || 'couple');
        showSuccess('Welcome to your special portal! 💕');
        navigate('/couple');
      } else {
        throw new Error('Authentication failed. No token received.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred. Please try again.';
      showError(errorMessage);
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
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-6 flex items-center gap-2 text-rose-800 hover:text-rose-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>

        <Card className="shadow-2xl border-rose-300">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mb-4 ring-4 ring-rose-200">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-rose-900">Couple's Portal</CardTitle>
            <p className="text-rose-700 mt-2">Your personal space for wishes, memories, and more.</p>
          </CardHeader>

          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base font-medium text-rose-800">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your shared username"
                  value={credentials.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="text-lg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-rose-800">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your secret password"
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
                      <EyeOff className="h-5 w-5 text-rose-500" />
                    ) : (
                      <Eye className="h-5 w-5 text-rose-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold py-4 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  'Secure Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-md text-rose-600">
            Your special day, your special memories 💕
          </p>
        </div>
      </div>
    </div>
  );
};

export default CoupleLogin;
