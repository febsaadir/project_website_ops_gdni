import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cashback from './pages/Cashback';
import Incentive from './pages/Incentive';
import CheckCoverage from './pages/CheckCoverage';
import TrackingAllocation from './pages/TrackingAllocation';
import ProductInfo from './pages/ProductInfo'; // Import Halaman Baru

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* Sales Ops Routes */}
            <Route index element={<Dashboard />} />
            <Route path="cashback" element={<Cashback />} />
            <Route path="incentive" element={<Incentive />} />
            
            {/* Product Routes (NEW) */}
            <Route path="product-info" element={<ProductInfo />} />

            {/* Supply Chain Routes */}
            <Route path="check-coverage" element={<CheckCoverage />} />
            <Route path="tracking-allocation" element={<TrackingAllocation />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}