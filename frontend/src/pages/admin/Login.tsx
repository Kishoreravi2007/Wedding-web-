import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowLeft } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { API_BASE_URL } from '@/lib/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call backend API for authentication
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials. Please try again.');
      }

      // Check if user is admin
      const userRole = data.user?.role || data.role;
      if (userRole !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Store authentication token and user info
      const token = data.accessToken || data.token;
      localStorage.setItem('authToken', token);
      localStorage.setItem('token', token); // Also store as 'token' for consistency
      localStorage.setItem('userRole', userRole);
      localStorage.setItem('username', data.user?.username || data.username);

      showSuccess('Login successful! Welcome to the Admin Portal.');
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
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
              <Lock className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900">Admin Portal</CardTitle>
            <p className="text-gray-600 mt-2">Sign in to manage your professional wedding website.</p>
          </CardHeader>
          
          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base font-medium text-gray-800">
                  Username
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your professional username"
                    value={credentials.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="pl-12 text-lg"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-medium text-gray-800">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your secure password"
                    value={credentials.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-12 text-lg"
                    required
                  />
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
            The Ultimate Wedding Website Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
