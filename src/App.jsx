import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Public pages
import OrderForm from './pages/OrderForm';
import Confirmation from './pages/Confirmation';

// Admin pages
import Login from './admin/Login';
import NewDashboard from './admin/NewDashboard';
import OrderManagement from './admin/OrderManagement';
import CourierManagement from './admin/CourierManagement';
import CustomerCRM from './admin/CustomerCRM';
import RiskDashboard from './admin/RiskDashboard';
import CODAnalytics from './admin/CODAnalytics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OrderForm />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<NewDashboard />} />
          <Route path="/admin/orders" element={<OrderManagement />} />
          <Route path="/admin/courier" element={<CourierManagement />} />
          <Route path="/admin/customers" element={<CustomerCRM />} />
          <Route path="/admin/risk" element={<RiskDashboard />} />
          <Route path="/admin/analytics" element={<CODAnalytics />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
