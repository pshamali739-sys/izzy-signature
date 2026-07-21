import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Public pages
import OrderForm from './pages/OrderForm';
import Confirmation from './pages/Confirmation';

// Admin pages
import Login from './admin/Login';
import EnterpriseDashboard from './admin/EnterpriseDashboard';
import CourierDispatch from './admin/CourierDispatch';

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
          <Route path="/admin" element={<EnterpriseDashboard />} />
          <Route path="/admin/courier" element={<CourierDispatch />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
