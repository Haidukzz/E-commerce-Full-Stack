import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { useToast } from './hooks/useToast'
import { ToastContainer } from './components/Toast'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import LoginPage from './pages/LoginPage'
import ShopPage from './pages/ShopPage'
import OrdersPage from './pages/OrdersPage'
import AdminPage from './pages/AdminPage'

function ProtectedRoute({ children, staffOnly = false }) {
  const { isLoggedIn, isStaff } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  if (staffOnly && !isStaff) return <Navigate to="/loja" replace />
  return children
}

function AppRoutes() {
  const { toasts, toast } = useToast()
  const props = { toast }

  return (
    <>
      <Navbar />
      <CartDrawer toast={toast} />
      <ToastContainer toasts={toasts} />
      <Routes>
        <Route path="/login"   element={<LoginPage   {...props} />} />
        <Route path="/loja"    element={<ShopPage    {...props} />} />
        <Route path="/pedidos" element={<ProtectedRoute><OrdersPage {...props} /></ProtectedRoute>} />
        <Route path="/admin"   element={<ProtectedRoute staffOnly><AdminPage {...props} /></ProtectedRoute>} />
        <Route path="*"        element={<Navigate to="/loja" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
