import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import AdminDashboard from './components/AdminDashboard'
import LoginForm from './components/LoginForm'
import ProtectedRoute from './components/ProtectedRoute'
import RegisterForm from './components/RegisterForm'
import SiteLayout from './components/SiteLayout'
import AuthProvider from './context/AuthProvider'
import {
  HomePage,
  OrderPage,
  ProductsPage,
  UserPage,
} from './pages/HotelPages'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="products" element={<ProductsPage />} />
          </Route>
          <Route path="login" element={<LoginForm />} />
          <Route path="register" element={<RegisterForm />} />
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route element={<SiteLayout />}>
              <Route path="order" element={<OrderPage />} />
              <Route path="user" element={<UserPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
