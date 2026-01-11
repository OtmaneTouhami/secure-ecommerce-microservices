import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from '@/features/auth';
import { CartProvider } from '@/features/orders';
import { ThemeProvider } from '@/context/ThemeContext';
import Layout from '@/components/layout/Layout';

// Pages
import HomePage from '@/pages/HomePage';
import ForbiddenPage from '@/pages/ForbiddenPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Features
import { ProductsPage, ProductDetailPage } from '@/features/products';
import { OrdersPage, OrderDetailPage, CartPage } from '@/features/orders';
import {
  DashboardPage,
  ProductManagementPage,
  OrderManagementPage,
  LowStockPage
} from '@/features/admin';

// Styles
import '@/styles/globals.css';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/forbidden" element={<ForbiddenPage />} />

                {/* Products - Require auth for full access */}
                <Route path="/products" element={
                  <ProtectedRoute requiredRole="CLIENT">
                    <ProductsPage />
                  </ProtectedRoute>
                } />
                <Route path="/products/:id" element={
                  <ProtectedRoute requiredRole="CLIENT">
                    <ProductDetailPage />
                  </ProtectedRoute>
                } />

                {/* Orders - Client only */}
                <Route path="/orders" element={
                  <ProtectedRoute requiredRole="CLIENT">
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute requiredRole="CLIENT">
                    <OrderDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute requiredRole="CLIENT">
                    <CartPage />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/products" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <ProductManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/orders" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <OrderManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/low-stock" element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <LowStockPage />
                  </ProtectedRoute>
                } />

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
