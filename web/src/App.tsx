import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '@features/auth/components/LoginForm';
import { ProtectedRoute } from '@core/auth/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
