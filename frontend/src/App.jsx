import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import MainPage from './pages/MainPage'
import PostDetailPage from './pages/PostDetailPage'
import LoginPage from './pages/LoginPage'
import PostEditPage from './pages/PostEditPage'
import AdminPage from './pages/AdminPage'
import useAuthStore from './store/authStore'

function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/posts/new" element={<PrivateRoute><PostEditPage /></PrivateRoute>} />
        <Route path="/posts/:id/edit" element={<PrivateRoute><PostEditPage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPage /></PrivateRoute>} />
      </Route>
    </Routes>
  )
}
