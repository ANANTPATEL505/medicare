import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public pages
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import DoctorDetail from './pages/DoctorDetail';
import Services from './pages/Services';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import TriageAssistant from './pages/TriageAssistant';

// Patient pages
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import Prescriptions from './pages/patient/Prescriptions';
import PrescriptionDetail from './pages/patient/PrescriptionDetail';
import MedicalHistory from './pages/patient/MedicalHistory';
import ProfileSettings from './pages/patient/ProfileSettings';
import Notifications from './pages/patient/Notifications';
import TriageHistory from './pages/patient/TriageHistory';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminPatients from './pages/admin/AdminPatients';
import AdminBlogs from './pages/admin/AdminBlogs';
import AdminPrescriptions from './pages/admin/AdminPrescriptions';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorPatients from './pages/doctor/DoctorPatients';
import DoctorPatientDetail from './pages/doctor/DoctorPatientDetail';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';

import './styles.css';

const roleDefaultRoute = (role) => {
  if (role === 'admin') return '/admin';
  if (role === 'doctor') return '/doctor';
  return '/dashboard';
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleDefaultRoute(user.role)} replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="/doctors/:id" element={<DoctorDetail />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/ai-triage" element={<TriageAssistant />} />

          {/* Patient */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><Dashboard /></ProtectedRoute>} />
          <Route path="/book/:doctorId" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><Prescriptions /></ProtectedRoute>} />
          <Route path="/patient/prescriptions/:id" element={<ProtectedRoute allowedRoles={['patient', 'admin', 'doctor']}><PrescriptionDetail /></ProtectedRoute>} />
          <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><MedicalHistory /></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
          <Route path="/patient/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/patient/triage" element={<ProtectedRoute allowedRoles={['patient', 'admin']}><TriageHistory /></ProtectedRoute>} />

          {/* Doctor */}
          <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorAppointments /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorPatients /></ProtectedRoute>} />
          <Route path="/doctor/patients/:id" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorPatientDetail /></ProtectedRoute>} />
          <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor', 'admin']}><DoctorPrescriptions /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><AdminDoctors /></ProtectedRoute>} />
          <Route path="/admin/appointments" element={<ProtectedRoute allowedRoles={['admin']}><AdminAppointments /></ProtectedRoute>} />
          <Route path="/admin/patients" element={<ProtectedRoute allowedRoles={['admin']}><AdminPatients /></ProtectedRoute>} />
          <Route path="/admin/blogs" element={<ProtectedRoute allowedRoles={['admin']}><AdminBlogs /></ProtectedRoute>} />
          <Route path="/admin/prescriptions" element={<ProtectedRoute allowedRoles={['admin']}><AdminPrescriptions /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute allowedRoles={['admin']}><AdminMessages /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['admin']}><AdminAuditLogs /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px' },
          success: { iconTheme: { primary: '#0a9396' } }
        }} />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
