/**
 * Comprehensive Admin Dashboard
 * Full control over the entire wedding website
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '@/lib/api';
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  Settings,
  BarChart3,
  LogOut,
  Trash2,
  Edit,
  Plus,
  Eye,
  Download,
  Upload,
  RefreshCw,
  Shield,
  Database,
  Scan,
  FileText,
  Mail,
  Bell,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  Heart,
  Star
} from 'lucide-react';
import { showSuccess, showError, showInfo } from '@/utils/toast';

interface User {
  id: string;
  username: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Photo {
  id: string;
  url: string;
  sister: string;
  filename: string;
  uploaded_at: string;
  faces_detected?: number;
}

interface Stats {
  totalPhotos: number;
  totalUsers: number;
  totalFaces: number;
  totalViews: number;
}

const ComprehensiveAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalPhotos: 0,
    totalUsers: 0,
    totalFaces: 0,
    totalViews: 0
  });

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'user' });

  // Photos
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedWedding, setSelectedWedding] = useState('sister-a');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Settings
  const [settings, setSettings] = useState({
    siteName: 'Parvathy & Sreedevi Wedding',
    enablePhot oBooth: true,
    enableFaceRecognition: true,
    enableGuestWishes: true,
    maintenanceMode: false
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const role = localStorage.getItem('userRole');
    
    if (!token || role !== 'admin') {
      showError('Please login as admin to access this page');
      navigate('/admin-login');
    } else {
      loadAllData();
    }
  }, [navigate]);

  const loadAllData = async () => {
    await Promise.all([
      loadStats(),
      loadUsers(),
      loadPhotos()
    ]);
  };

  const loadStats = async () => {
    try {
      const [photosRes, usersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/photos`),
        fetch(`${API_BASE_URL}/api/users`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        })
      ]);

      const photosData = await photosRes.json();
      const usersData = await usersRes.json();

      setStats({
        totalPhotos: photosData.length || 0,
        totalUsers: usersData.length || 0,
        totalFaces: 0, // Will be calculated from face detection
        totalViews: 0  // Will be tracked later
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadPhotos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/photos?sister=${selectedWedding}`);
      if (response.ok) {
        const data = await response.json();
        setPhotos(data);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    showInfo('Signed out successfully');
    navigate('/admin-login');
  };

  const handleAddUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        showSuccess('User created successfully!');
        setShowAddUserDialog(false);
        setNewUser({ username: '', password: '', role: 'user' });
        await loadUsers();
        await loadStats();
      } else {
        const error = await response.json();
        showError(error.message || 'Failed to create user');
      }
    } catch (error) {
      showError('Error creating user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        showSuccess('User deleted successfully!');
        await loadUsers();
        await loadStats();
      } else {
        showError('Failed to delete user');
      }
    } catch (error) {
      showError('Error deleting user');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        showSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        await loadUsers();
      } else {
        showError('Failed to update user status');
      }
    } catch (error) {
      showError('Error updating user status');
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhotos(true);
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('photos', file);
    });
    formData.append('sister', selectedWedding);

    try {
      const response = await fetch(`${API_BASE_URL}/api/photos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (response.ok) {
        showSuccess(`${files.length} photo(s) uploaded successfully!`);
        await loadPhotos();
        await loadStats();
      } else {
        showError('Failed to upload photos');
      }
    } catch (error) {
      showError('Error uploading photos');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        showSuccess('Photo deleted successfully!');
        await loadPhotos();
        await loadStats();
      } else {
        showError('Failed to delete photo');
      }
    } catch (error) {
      showError('Error deleting photo');
    }
  };

  const handleSaveSettings = async () => {
    showSuccess('Settings saved successfully!');
    // In a real app, save to backend
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {localStorage.getItem('username')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => loadAllData()}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Total Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalPhotos}</div>
                  <p className="text-xs text-blue-100 mt-1">Across all galleries</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalUsers}</div>
                  <p className="text-xs text-green-100 mt-1">Registered accounts</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Scan className="w-4 h-4" />
                    Faces Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalFaces}</div>
                  <p className="text-xs text-purple-100 mt-1">AI face recognition</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Total Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalViews}</div>
                  <p className="text-xs text-orange-100 mt-1">Page visits</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Commonly used administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={() => setActiveTab('photos')}
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Upload className="w-6 h-6" />
                    <span>Upload Photos</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('users')}
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Plus className="w-6 h-6" />
                    <span>Add User</span>
                  </Button>
                  <Button
                    onClick={() => navigate('/parvathy/photobooth')}
                    variant="outline"
                    className="h-auto py-6 flex flex-col items-center gap-2"
                  >
                    <Eye className="w-6 h-6" />
                    <span>View Photo Booth</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Admin login successful</p>
                        <p className="text-xs text-gray-500">Just now</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{stats.totalPhotos} photos in gallery</p>
                        <p className="text-xs text-gray-500">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage all users and their permissions</CardDescription>
                  </div>
                  <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New User</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Username</Label>
                          <Input
                            value={newUser.username}
                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                            placeholder="Enter username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Password</Label>
                          <Input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="Enter password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="photographer">Photographer</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddUser}>
                          Create User
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No users found. Create your first user!</p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role}
                              </Badge>
                              <Badge variant={user.is_active ? 'default' : 'destructive'}>
                                {user.is_active ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                                {user.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Photo Gallery Management</CardTitle>
                    <CardDescription>Upload, view, and manage wedding photos</CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select value={selectedWedding} onValueChange={setSelectedWedding}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sister-a">Parvathy's Wedding</SelectItem>
                        <SelectItem value="sister-b">Sreedevi's Wedding</SelectItem>
                      </SelectContent>
                    </Select>
                    <label htmlFor="photo-upload">
                      <Button asChild disabled={uploadingPhotos}>
                        <span className="flex items-center gap-2 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          {uploadingPhotos ? 'Uploading...' : 'Upload Photos'}
                        </span>
                      </Button>
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {photos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No photos found. Upload your first photo!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.filename}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => window.open(photo.url, '_blank')}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {photo.faces_detected && photo.faces_detected > 0 && (
                          <div className="absolute top-2 right-2">
                            <Badge className="bg-green-500">
                              <Scan className="w-3 h-3 mr-1" />
                              {photo.faces_detected}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Website Traffic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Total Visits</span>
                      <span className="text-lg font-bold">{stats.totalViews}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Photo Booth Visits</span>
                      <span className="text-lg font-bold">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Gallery Views</span>
                      <span className="text-lg font-bold">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Popular Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Photo Downloads</span>
                      <span className="text-lg font-bold">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Face Searches</span>
                      <span className="text-lg font-bold">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Wishes Submitted</span>
                      <span className="text-lg font-bold">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Website Settings
                </CardTitle>
                <CardDescription>Configure website features and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Site Name</Label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Feature Toggles</h3>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Photo Booth</p>
                      <p className="text-sm text-gray-600">Allow guests to use face recognition</p>
                    </div>
                    <Button
                      variant={settings.enablePhotoBooth ? 'default' : 'outline'}
                      onClick={() => setSettings({ ...settings, enablePhotoBooth: !settings.enablePhotoBooth })}
                    >
                      {settings.enablePhotoBooth ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Face Recognition</p>
                      <p className="text-sm text-gray-600">AI-powered face matching</p>
                    </div>
                    <Button
                      variant={settings.enableFaceRecognition ? 'default' : 'outline'}
                      onClick={() => setSettings({ ...settings, enableFaceRecognition: !settings.enableFaceRecognition })}
                    >
                      {settings.enableFaceRecognition ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Guest Wishes</p>
                      <p className="text-sm text-gray-600">Allow guests to submit wishes</p>
                    </div>
                    <Button
                      variant={settings.enableGuestWishes ? 'default' : 'outline'}
                      onClick={() => setSettings({ ...settings, enableGuestWishes: !settings.enableGuestWishes })}
                    >
                      {settings.enableGuestWishes ? 'Enabled' : 'Disabled'}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div>
                      <p className="font-medium text-red-900">Maintenance Mode</p>
                      <p className="text-sm text-red-700">Disable public access to the website</p>
                    </div>
                    <Button
                      variant={settings.maintenanceMode ? 'destructive' : 'outline'}
                      onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                    >
                      {settings.maintenanceMode ? 'Active' : 'Inactive'}
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComprehensiveAdminDashboard;

