import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Shipments } from './pages/Shipments';
import { CreateShipment } from './pages/CreateShipment';
import { ShipmentDetails } from './pages/ShipmentDetails';
import { Login } from './pages/Login';

// Mock auth guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="shipments" element={<Shipments />} />
          <Route path="shipments/new" element={<CreateShipment />} />
          <Route path="shipments/:id" element={<ShipmentDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
