import { Routes, Route, Navigate } from 'react-router-dom';
import { MosaicProvider } from './hooks/useMosaic';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { SharedMosaicPage } from './pages/SharedMosaicPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    // One provider for both routes, so a mosaic opened from a link stays loaded on the main page
    <MosaicProvider>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/m/:id" element={<SharedMosaicPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/datenschutz" element={<Navigate to="/privacy" replace />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </MosaicProvider>
  );
}

export default App;
