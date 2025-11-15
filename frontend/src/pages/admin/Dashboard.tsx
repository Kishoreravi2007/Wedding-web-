import React from 'react';
import { Link } from 'react-router-dom';
import WeddingManager from '@/components/WeddingManager';
import { Button } from '@/components/ui/button';
import { Home, Users, Settings, LogOut, Mail } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Wedding Website Admin
              </h1>
              <nav className="flex gap-4 ml-8">
                <Link to="/admin/dashboard">
                  <Button variant="ghost" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Weddings
                  </Button>
                </Link>
                <Link to="/admin/contact-messages">
                  <Button variant="ghost" size="sm">
                    <Mail className="mr-2 h-4 w-4" />
                    Messages
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="ghost" size="sm">
                    <Home className="mr-2 h-4 w-4" />
                    View Site
                  </Button>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <Link to="/admin/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </Link>
              <Button variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <WeddingManager />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-6 py-4 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} Wedding Website. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;

