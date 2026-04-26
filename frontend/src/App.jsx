import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import OAuth2Callback from './pages/OAuth2Callback';
import DashboardPage from './pages/DashboardPage';
import FacilitiesPage from './pages/FacilitiesPage';
import FacilityDetailPage from './pages/FacilityDetailPage';
import BookingsPage from './pages/BookingsPage';
import TicketsPage from './pages/TicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import AIChatbot from './components/chat/AIChatbot';
import CalendarPage from './pages/CalendarPage';
import './App.css';

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-spinner" />
        <p>Loading Smart Campus...</p>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <Navbar />}
      {isAuthenticated && <AIChatbot />}
      <main className="app-main">
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/oauth2/callback" element={<OAuth2Callback />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/facilities" element={<ProtectedRoute><FacilitiesPage /></ProtectedRoute>} />
          <Route path="/facilities/:id" element={<ProtectedRoute><FacilityDetailPage /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
          <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
          <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
        </Routes>
      </main>
      <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
    </>
  );
}
