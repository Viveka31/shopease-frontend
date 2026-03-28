import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Buyer Pages
import HomePage from './pages/buyer/HomePage';
import ProductsPage from './pages/buyer/ProductsPage';
import ProductDetailPage from './pages/buyer/ProductDetailPage';
import CartPage from './pages/buyer/CartPage';
import CheckoutPage from './pages/buyer/CheckoutPage';
import OrderConfirmationPage from './pages/buyer/OrderConfirmationPage';
import OrdersPage from './pages/buyer/OrdersPage';
import OrderDetailPage from './pages/buyer/OrderDetailPage';
import WishlistPage from './pages/buyer/WishlistPage';
import ProfilePage from './pages/buyer/ProfilePage';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerAddProduct from './pages/seller/SellerAddProduct';
import SellerEditProduct from './pages/seller/SellerEditProduct';
import SellerOrders from './pages/seller/SellerOrders';

// Route Guards
const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader-wrap"><div className="spinner" /></div>;
  if (user) return <Navigate to={user.role === 'seller' ? '/seller/dashboard' : '/'} replace />;
  return children;
};

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Buyer / Public */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
        <Route path="/products/:id" element={<Layout><ProductDetailPage /></Layout>} />

        {/* Protected Buyer */}
        <Route path="/cart" element={<PrivateRoute><Layout><CartPage /></Layout></PrivateRoute>} />
        <Route path="/checkout" element={<PrivateRoute><Layout><CheckoutPage /></Layout></PrivateRoute>} />
        <Route path="/order-confirmation/:id" element={<PrivateRoute><Layout><OrderConfirmationPage /></Layout></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><Layout><OrdersPage /></Layout></PrivateRoute>} />
        <Route path="/orders/:id" element={<PrivateRoute><Layout><OrderDetailPage /></Layout></PrivateRoute>} />
        <Route path="/wishlist" element={<PrivateRoute><Layout><WishlistPage /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><ProfilePage /></Layout></PrivateRoute>} />

        {/* Seller */}
        <Route path="/seller/dashboard" element={<PrivateRoute role="seller"><Layout><SellerDashboard /></Layout></PrivateRoute>} />
        <Route path="/seller/products" element={<PrivateRoute role="seller"><Layout><SellerProducts /></Layout></PrivateRoute>} />
        <Route path="/seller/products/add" element={<PrivateRoute role="seller"><Layout><SellerAddProduct /></Layout></PrivateRoute>} />
        <Route path="/seller/products/edit/:id" element={<PrivateRoute role="seller"><Layout><SellerEditProduct /></Layout></PrivateRoute>} />
        <Route path="/seller/orders" element={<PrivateRoute role="seller"><Layout><SellerOrders /></Layout></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px', borderRadius: '10px' },
          success: { iconTheme: { primary: '#00C2A8', secondary: '#fff' } },
        }} />
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}
