
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useWebsite } from '@/contexts/WebsiteContext';
import { PortalLayout } from './PortalLayout';
import { DashboardUploadSection } from './components/DashboardUploadSection';
import { DashboardActivityTable } from './components/DashboardActivityTable';
import { DashboardStats } from './components/DashboardStats';
import { API_BASE_URL } from '@/lib/api';
import { mapApiPhotoToPhotoType } from '@/utils/photoMapper';
import { Button } from '@/components/ui/button';
import { Photo as PhotoType } from '@/types/photo';

const PhotographerDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { content } = useWebsite();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [weddingDetails, setWeddingDetails] = useState<any>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<PhotoType[]>([]);
  const [stats, setStats] = useState({
    totalPhotos: 0,
    photosWithFaces: 0,
    processing: false,
    processedCount: 0
  });

  // 1. Fetch Wedding Details
  useEffect(() => {
    const fetchWeddingDetails = async () => {
      if (!currentUser?.wedding_id) {
        setIsLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_BASE_URL}/api/auth/photographer/wedding-details`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setWeddingDetails(data.wedding);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeddingDetails();
  }, [currentUser]);

  // 2. Fetch Photos & Stats
  useEffect(() => {
    if (!weddingDetails?.id) return;

    const loadData = async () => {
      try {
        // Fetch Photos
        const res = await fetch(`${API_BASE_URL}/api/photos?weddingId=${weddingDetails.id}`);
        if (res.ok) {
          const data = await res.json();
          const photosRaw = Array.isArray(data) ? data : (data.photos || []);
          const mapped = photosRaw.map(mapApiPhotoToPhotoType);

          // Sort by newest
          mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

          setUploadedPhotos(mapped);

          // Calc Stats
          const withFaces = mapped.filter(p => p.faces && p.faces.length > 0).length;
          setStats(prev => ({
            ...prev,
            totalPhotos: mapped.length,
            photosWithFaces: withFaces
          }));
        }

        // Fetch AI Stats (Optional, if separate endpoint exists)
        const statsRes = await fetch(`${API_BASE_URL}/api/faces/statistics?sister=${weddingDetails.id}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          // Merge if detection is robust
        }

      } catch (e) {
        console.error(e);
      }
    };
    loadData();
  }, [weddingDetails]);

  const handleUploadSuccess = (photoId: string) => {
    // Refresh photos or optimistically update
    // Simplified: trigger re-fetch or manual add
    // For now, let's just re-fetch logic essentially (copy-paste for speed in this context)
    // Ideally extract `loadData` to function.
    // Quick dirty fix:
    const fetchNew = async () => {
      const res = await fetch(`${API_BASE_URL}/api/photos/${photoId}`);
      if (res.ok) {
        const photo = await res.json();
        const mapped = mapApiPhotoToPhotoType(photo);
        setUploadedPhotos(prev => [mapped, ...prev]);
        setStats(prev => ({ ...prev, totalPhotos: prev.totalPhotos + 1 }));
      }
    };
    fetchNew();
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <PortalLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-[#111318] text-4xl font-black leading-tight tracking-tight">Photo Management</h1>
          <p className="text-[#636f88] text-lg font-normal">
            Manage your batch uploads and monitor AI-powered processing tasks for
            <span className="font-bold text-primary"> {weddingDetails?.groom_name || 'Wedding'} & {weddingDetails?.bride_name || 'Events'}</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            Help & Documentation
          </Button>
          {/* Quick Upload Button could go here or is redundant with the big drag zone */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Upload & Active Tasks */}
        <div className="lg:col-span-2 space-y-8">
          <DashboardUploadSection
            weddingId={weddingDetails?.id || ''}
            onUploadSuccess={handleUploadSuccess}
          />

          <DashboardActivityTable
            photos={uploadedPhotos.slice(0, 10)} // Show recent 10
            onManage={(photo) => console.log('Manage', photo)}
          />
        </div>

        {/* Right Column: AI Processing Status & Stats */}
        <div className="space-y-8">
          <DashboardStats
            stats={stats}
            onContextAction={(action) => console.log(action)}
          />
        </div>
      </div>
    </PortalLayout>
  );
};

export default PhotographerDashboard;
