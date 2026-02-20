import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Weddings from './pages/Weddings';
import WeddingDetail from './pages/WeddingDetail';
import Coupons from './pages/Coupons';
import FeedbackList from './pages/FeedbackList';
import Contacts from './pages/Contacts';
import Settings from './pages/Settings';
import Admins from './pages/Admins';
import Login from './pages/Login';

import AppLayout from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/weddings" element={<Weddings />} />
                  <Route path="/weddings/:id" element={<WeddingDetail />} />
                  <Route path="/purchases" element={<Purchases />} />
                  <Route path="/coupons" element={<Coupons />} />
                  <Route path="/feedback" element={<FeedbackList />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/admins" element={<Admins />} />
                </Routes>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
