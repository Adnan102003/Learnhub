import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const CourseCatalog = lazy(() => import('./pages/public/CourseCatalog'));
const CourseDetail = lazy(() => import('./pages/public/CourseDetail'));

// Student pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const MyLearning = lazy(() => import('./pages/student/MyLearning'));
const CoursePlayer = lazy(() => import('./pages/student/CoursePlayer'));
const Certificates = lazy(() => import('./pages/student/Certificates'));

// Instructor pages
const InstructorDashboard = lazy(() => import('./pages/instructor/InstructorDashboard'));
const CreateCourse = lazy(() => import('./pages/instructor/CreateCourse'));
const EditCourse = lazy(() => import('./pages/instructor/EditCourse'));
const CourseBuilder = lazy(() => import('./pages/instructor/CourseBuilder'));
const InstructorAnalytics = lazy(() => import('./pages/instructor/InstructorAnalytics'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const CourseManagement = lazy(() => import('./pages/admin/CourseManagement'));

// Profile & Settings
const Profile = lazy(() => import('./pages/common/Profile'));
const Settings = lazy(() => import('./pages/common/Settings'));

function App() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CourseCatalog />} />
          <Route path="/courses/:id" element={<CourseDetail />} />

          {/* Protected Routes - Student */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                {user?.role === 'student' && <StudentDashboard />}
                {user?.role === 'instructor' && <InstructorDashboard />}
                {user?.role === 'admin' && <AdminDashboard />}
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-learning" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyLearning />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learn/:courseId" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <CoursePlayer />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/certificates" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Certificates />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes - Instructor */}
          <Route 
            path="/instructor/courses" 
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/create-course" 
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <CreateCourse />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/courses/:id/edit" 
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <EditCourse />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/courses/:id/builder" 
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <CourseBuilder />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/analytics" 
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorAnalytics />
              </ProtectedRoute>
            } 
          />

          {/* Protected Routes - Admin */}
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/courses" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CourseManagement />
              </ProtectedRoute>
            } 
          />

          {/* Common Protected Routes */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default App;