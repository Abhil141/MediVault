import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Vault from './pages/Vault';
import Login from './pages/Login';
import Register from './pages/Register';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import DocumentViewer from './pages/DocumentViewer';
import SharedDocumentView from './pages/SharedDocumentView';
import Chatbot from './pages/Chatbot';
import Timeline from './pages/Timeline';
import Profile from './pages/Profile';
import About from './pages/About';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <Toaster position="bottom-right" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/shared/:token" element={<SharedDocumentView />} />
              
              {/* Standalone protected routes */}
              <Route path="/document/:id/view" element={
                <ProtectedRoute>
                  <DocumentViewer />
                </ProtectedRoute>
              } />

              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="vault" element={<Vault />} />
                <Route path="chat" element={<Chatbot />} />
                <Route path="timeline" element={<Timeline />} />
                <Route path="profile" element={<Profile />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="privacy" element={<PrivacyPolicy />} />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
