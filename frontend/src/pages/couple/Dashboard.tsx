import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, LogOut, Users, Image, BarChart3, Calendar, Gift, Camera, Star, MessageCircle, Settings } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { useWebsite } from '@/contexts/WebsiteContext';
import WishDisplay from '@/components/WishDisplay'; // Import the WishDisplay component
import { getWishes } from '@/services/wishService'; // Import getWishes to update stats

const CoupleDashboard = () => {
  const navigate = useNavigate();
  const { content } = useWebsite();

  // Mock couple data
  const [coupleData] = useState({
    parvathy: {
      name: content.parvathy.name,
      role: content.parvathy.role,
      avatar: '/public/placeholder.svg'
    },
    sreedevi: {
      name: content.sreedevi.name, 
      role: content.sreedevi.role,
      avatar: '/public/placeholder.svg'
    },
    weddingDate: content.weddingDate,
    venue: content.venue,
    totalGuests: content.totalGuests
  });

  const [totalWishesCount, setTotalWishesCount] = useState(0);

  useEffect(() => {
    const fetchWishesCount = async () => {
      try {
        const wishes = await getWishes();
        setTotalWishesCount(wishes.length);
      } catch (error) {
        console.error("Failed to fetch wishes count:", error);
      }
    };
    fetchWishesCount();
  }, []);

  // Wedding statistics
  const [stats] = useState({
    totalPhotos: 0, // Will be updated when photos are uploaded
    totalViews: 0, // Will be updated based on actual usage
    avgRating: 5.0, // Perfect rating for the beautiful wedding
    totalGuests: content.totalGuests,
    eventsCompleted: 6 // Based on the schedule
  });

  const handleSignOut = async () => {
    navigate('/');
    showSuccess('Thank you for visiting your portal! 💕');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-pink-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6">
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-rose-800">Couple's Portal</h1>
              <p className="text-rose-600 mt-1 text-sm sm:text-base">Your special memories and wishes</p>
            </div>
            <Button 
              onClick={handleSignOut} 
              variant="outline" 
              className="w-full sm:w-auto justify-center flex items-center gap-2 border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Card className="bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0 shadow-xl mb-6 sm:mb-8">
          <CardContent className="p-6 sm:p-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold">{coupleData.parvathy.name} & {coupleData.sreedevi.name}</h2>
                </div>
              </div>
              <p className="text-pink-100 text-base sm:text-lg max-w-2xl mx-auto">
                Welcome to your personal portal! Here you can view all the beautiful wishes from your guests, 
                browse through your wedding photos, and see the love and joy your special day brought to everyone.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
          {[
            { icon: MessageCircle, value: totalWishesCount, label: 'Wishes' },
            { icon: Image, value: stats.totalPhotos, label: 'Photos' },
            { icon: BarChart3, value: stats.totalViews, label: 'Views' },
            { icon: Star, value: stats.avgRating, label: 'Rating' },
            { icon: Users, value: stats.totalGuests, label: 'Guests' },
            { icon: Calendar, value: stats.eventsCompleted, label: 'Events' }
          ].map((item) => (
            <Card key={item.label} className="bg-white/85 backdrop-blur-sm border-pink-200">
              <CardContent className="p-3 sm:p-4 text-center space-y-1 sm:space-y-2">
                <item.icon className="w-6 h-6 sm:w-8 sm:h-8 text-pink-500 mx-auto" />
                <p className="text-xl sm:text-2xl font-bold text-rose-800">{item.value}</p>
                <p className="text-xs sm:text-sm text-rose-600">{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="wishes" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-6 rounded-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            <TabsTrigger value="wishes" className="flex items-center gap-2 text-sm sm:text-base py-3">
              <Heart className="w-4 h-4" />
              Guest Wishes
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2 text-sm sm:text-base py-3">
              <Camera className="w-4 h-4" />
              Photo Gallery
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2 text-sm sm:text-base py-3">
              <Gift className="w-4 h-4" />
              Wedding Details
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2 text-sm sm:text-base py-3">
              <Settings className="w-4 h-4" />
              Website Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <WishDisplay recipient="parvathy" />
              <WishDisplay recipient="sreedevi" />
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
              <CardHeader>
                <CardTitle className="text-2xl text-rose-800 text-center">Your Wedding Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-rose-800 mb-2">Photo Gallery Coming Soon!</h3>
                  <p className="text-rose-600">
                    Your beautiful wedding photos will be available here once they're uploaded by your photographer.
                  </p>
                  <Button 
                    className="mt-4 bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={() => navigate('/parvathy/gallery')}
                  >
                    View Parvathy's Gallery
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-rose-800">Wedding Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-rose-800">Venue</h4>
                    <p className="text-rose-600">{coupleData.venue}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-rose-800">Total Guests</h4>
                    <p className="text-rose-600">{coupleData.totalGuests} people</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-pink-200">
                <CardHeader>
                  <CardTitle className="text-2xl text-rose-800">The Couple</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-pink-200 rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-rose-800">{coupleData.parvathy.name}</h4>
                      <p className="text-rose-600">{coupleData.parvathy.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-pink-200 rounded-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-rose-800">{coupleData.sreedevi.name}</h4>
                      <p className="text-rose-600">{content.sreedevi.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-rose-800 mb-4">Website Content Overview</h2>
              <p className="text-rose-600 mb-6">
                View the current website content that appears on the homepage.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-white/60 backdrop-blur-sm border-pink-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-rose-800">Parvathy ({content.parvathy.name})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-rose-800">Name</h4>
                      <p className="text-rose-600">{content.parvathy.name}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-rose-800">Role</h4>
                      <p className="text-rose-600">{content.parvathy.role}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-rose-800">Description</h4>
                      <p className="text-rose-600">{content.parvathy.description}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/60 backdrop-blur-sm border-pink-200">
                  <CardHeader>
                    <CardTitle className="text-xl text-rose-800">Sreedevi ({content.sreedevi.name})</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-rose-800">Name</h4>
                      <p className="text-rose-600">{content.sreedevi.name}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-rose-800">Role</h4>
                      <p className="text-rose-600">{content.sreedevi.role}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-rose-600">Description</h4>
                      <p className="text-rose-600">{content.sreedevi.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> To edit website content, please contact the website administrator. 
                  This view shows the current content for reference.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CoupleDashboard;
