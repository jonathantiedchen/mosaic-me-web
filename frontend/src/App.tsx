import { Routes, Route, Navigate } from 'react-router-dom';
import { MosaicProvider } from './hooks/useMosaic';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <MosaicProvider>
          <HomePage />
        </MosaicProvider>
      } />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
