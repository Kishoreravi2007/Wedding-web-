import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { useWebsite } from '@/contexts/WebsiteContext';
import UniversalUpload from '@/components/UniversalUpload';
import {
  Music,
  Camera,
  Calendar,
  Settings,
  Users,
  BarChart3,
  Upload,
  Trash2,
  Edit,
  Plus,
  LogOut,
  Play,
  Pause,
  Volume2,
  FileText,
  Image as ImageIcon,
  Clock,
  MapPin
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { content, updateContent, updateNestedContent } = useWebsite();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentMusic, setCurrentMusic] = useState('/wedding-music.mp3');
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(50);
  const [selectedWedding, setSelectedWedding] = useState('A'); // Default to Sister A

  // Photo gallery - starts empty, populated when photos are uploaded
  const [photos, setPhotos] = useState<any[]>([]);

  const [schedules, setSchedules] = useState([
    { id: '1', title: 'Ganapathikidal Ceremony (Sister A)', time: '10:00 AM', location: 'Main Hall', sister: 'A', date: '2024-12-15' },
    { id: '2', title: 'Wedding Ceremony (Sister A)', time: '11:30 AM', location: 'Wedding Hall', sister: 'A', date: '2024-12-15' },
    { id: '3', title: 'Reception (Sister A)', time: '7:00 PM', location: 'Reception Hall', sister: 'A', date: '2024-12-15' },
    { id: '4', title: 'Dakshina Ceremony (Sister B)', time: '2:00 PM', location: 'Main Hall', sister: 'B', date: '2024-12-16' },
    { id: '5', title: 'Muhurtham Ceremony (Sister B)', time: '4:00 PM', location: 'Wedding Hall', sister: 'B', date: '2024-12-16' },
    { id: '6', title: 'Reception (Sister B)', time: '7:30 PM', location: 'Reception Hall', sister: 'B', date: '2024-12-16' },
  ]);


  const handleSignOut = () => {
    navigate('/');
  };

  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In real app, upload to server
      setCurrentMusic(URL.createObjectURL(file));
      showSuccess('Music uploaded successfully!');
    }
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const newPhoto = {
          id: Date.now().toString(),
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
          uploadDate: new Date().toISOString().split('T')[0],
          tags: ['new'],
          wedding: selectedWedding // Add the selected wedding
        };
        setPhotos(prev => [...prev, newPhoto]);
      });
      showSuccess(`${files.length} photos uploaded successfully!`);
    }
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id));
    showSuccess('Photo deleted successfully!');
  };

  const handleAddSchedule = (newEvent: any) => {
    const event = {
      id: Date.now().toString(),
      ...newEvent
    };
    setSchedules(prev => [...prev, event]);
    showSuccess('Event added to schedule!');
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(event => event.id !== id));
    showSuccess('Event deleted from schedule!');
  };

  const handleEditSchedule = (id: string, updatedEvent: any) => {
    setSchedules(prev => prev.map(event => 
      event.id === id ? { ...event, ...updatedEvent } : event
    ));
    showSuccess('Event updated successfully!');
  };

  const toggleMusic = () => {
    setIsPlaying(!isPlaying);
  };


  const handleSaveContent = () => {
    // In a real app, this would save to your backend
    showSuccess('Website content saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-2">Admin Portal</h1>
            <p className="text-slate-600">Manage your wedding website</p>
          </div>
          <Button onClick={handleSignOut} variant="outline" className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Photos</p>
                  <p className="text-2xl font-bold text-slate-900">{photos.length}</p>
                </div>
                <ImageIcon className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Events Scheduled</p>
                  <p className="text-2xl font-bold text-slate-900">{schedules.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Music Files</p>
                  <p className="text-2xl font-bold text-slate-900">1</p>
                </div>
                <Music className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Website Status</p>
                  <Badge className="bg-green-100 text-green-800">Live</Badge>
                </div>
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Current Music
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button onClick={toggleMusic} size="sm">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <div className="flex-1">
                      <p className="font-medium">Wedding Music</p>
                      <p className="text-sm text-slate-600">wedding-music.mp3</p>
                    </div>
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Volume: {musicVolume}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {schedules.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-slate-600">{event.time} • {event.location}</p>
                        </div>
                        <Badge variant={event.sister === 'A' ? 'default' : 'secondary'}>
                          Sister {event.sister}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Music Management Tab */}
          <TabsContent value="music" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Music Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <Button onClick={toggleMusic} size="sm">
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <div className="flex-1">
                    <p className="font-medium">Current Music: wedding-music.mp3</p>
                    <p className="text-sm text-slate-600">Duration: 3:45 • Size: 4.2 MB</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(Number(e.target.value))}
                      className="w-20"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-2">Upload New Music</h3>
                  <p className="text-slate-600 mb-4">Upload MP3, WAV, or other audio formats organized by event type</p>
                  <UniversalUpload 
                    onFilesUploaded={(uploadedFiles) => {
                      if (uploadedFiles.length > 0) {
                        // In a real app, you would handle the uploaded files properly
                        showSuccess(`${uploadedFiles.length} music file(s) uploaded successfully to ${uploadedFiles[0]?.eventType || 'music'} directory!`);
                      }
                    }}
                    allowedTypes="music"
                    title="Upload Music Files"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Photo Management Tab */}
          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Photo Gallery Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-2">Upload New Photos</h3>
                  <p className="text-slate-600 mb-4">Upload JPG, PNG, or other image formats organized by event type</p>
                  <UniversalUpload 
                    onFilesUploaded={(uploadedFiles) => {
                      if (uploadedFiles.length > 0) {
                        // In a real app, you would handle the uploaded files properly
                        showSuccess(`${uploadedFiles.length} photo(s) uploaded successfully to ${uploadedFiles[0]?.eventType || 'photo'} directory!`);
                      }
                    }}
                    allowedTypes="images"
                    title="Upload Photo Files"
                    sisterName={selectedWedding === 'A' ? 'sister-a' : 'sister-b'}
                  />
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {photos.map((photo) => (
                    <Card key={photo.id} className="overflow-hidden">
                      <div className="aspect-square bg-slate-100 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-slate-400" />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium truncate">{photo.name}</h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePhoto(photo.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-slate-600">{photo.size}</p>
                        <p className="text-sm text-slate-600">{photo.uploadDate}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {photo.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Management Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Event Schedule Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add New Event
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Event</DialogTitle>
                    </DialogHeader>
                    <AddEventForm onSubmit={handleAddSchedule} />
                  </DialogContent>
                </Dialog>

                <div className="space-y-4">
                  {schedules.map((event) => (
                    <Card key={event.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <Clock className="w-5 h-5 text-slate-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{event.title}</h4>
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {event.time} • {event.date}
                            </p>
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.location}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={event.sister === 'A' ? 'default' : 'secondary'}>
                            Sister {event.sister}
                          </Badge>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Event</DialogTitle>
                              </DialogHeader>
                              <EditEventForm 
                                event={event} 
                                onSubmit={(updatedEvent) => handleEditSchedule(event.id, updatedEvent)} 
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSchedule(event.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Website Content Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Main Page Content</h3>
                    <div>
                      <label className="block text-sm font-medium mb-2">Website Title</label>
                      <Input 
                        value={content.title} 
                        onChange={(e) => updateContent({ title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle</label>
                      <Input 
                        value="Choose your sister's celebration" 
                        onChange={(e) => {/* Subtitle removed from main page */}}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Sister A ({content.parvathy.name})</h3>
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <Input 
                        value={content.parvathy.name} 
                        onChange={(e) => updateNestedContent('parvathy.name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Description</label>
                      <Textarea 
                        value={content.parvathy.description} 
                        onChange={(e) => updateNestedContent('parvathy.description', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <Input 
                        type="color" 
                        value="#8C3B3B" 
                        onChange={(e) => {/* Color management can be added later */}}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Sister B ({content.sreedevi.name})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <Input 
                        value={content.sreedevi.name} 
                        onChange={(e) => updateNestedContent('sreedevi.name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Color</label>
                      <Input 
                        type="color" 
                        value="#1B5E20" 
                        onChange={(e) => {/* Color management can be added later */}}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea 
                      value={content.sreedevi.description} 
                      onChange={(e) => updateNestedContent('sreedevi.description', e.target.value)}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveContent} className="w-full">Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Website Traffic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
          <div className="flex justify-between">
            <span>Sister A Gallery</span>
            <span className="font-semibold">0 views</span>
          </div>
          <div className="flex justify-between">
            <span>Sister B Gallery</span>
            <span className="font-semibold">0 views</span>
          </div>
                    <div className="flex justify-between">
                      <span>Photo Downloads</span>
                      <span className="font-semibold">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
          <div className="flex justify-between">
            <span>Sister A Gallery</span>
            <span className="font-semibold">0 views</span>
          </div>
          <div className="flex justify-between">
            <span>Sister B Gallery</span>
            <span className="font-semibold">0 views</span>
          </div>
                    <div className="flex justify-between">
                      <span>Photo Booth</span>
                      <span className="font-semibold">0 views</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Add Event Form Component
const AddEventForm = ({ onSubmit }: { onSubmit: (event: any) => void }) => {
  const { content } = useWebsite();
  const [formData, setFormData] = useState({
    title: '',
    time: '',
    location: '',
    sister: 'A',
    date: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({ title: '', time: '', location: '', sister: 'A', date: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Event Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Time</label>
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Sister</label>
        <Select value={formData.sister} onValueChange={(value) => setFormData({ ...formData, sister: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Sister A ({content.parvathy?.name || 'Sister A'})</SelectItem>
            <SelectItem value="B">Sister B ({content.sreedevi?.name || 'Sister B'})</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Add Event</Button>
    </form>
  );
};

// Edit Event Form Component
const EditEventForm = ({ event, onSubmit }: { event: any, onSubmit: (event: any) => void }) => {
  const { content } = useWebsite();
  const [formData, setFormData] = useState({
    title: event.title,
    time: event.time,
    location: event.location,
    sister: event.sister,
    date: event.date
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Event Title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Date</label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Time</label>
          <Input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Location</label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Sister</label>
        <Select value={formData.sister} onValueChange={(value) => setFormData({ ...formData, sister: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">Sister A ({content.parvathy?.name || 'Sister A'})</SelectItem>
            <SelectItem value="B">Sister B ({content.sreedevi?.name || 'Sister B'})</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Update Event</Button>
    </form>
  );
};

export default AdminDashboard;
