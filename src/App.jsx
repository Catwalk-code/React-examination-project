import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './stores/authStore'
import WelcomePage from './pages/WelcomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Header from './pages/Header'
import HomePage from './pages/HomePage'


function App() {
  const  { user } = useAuthStore()

    return (
    <>
      <Header />
      <Routes>
        {/* Если залогинен, то редирект на главную, иначе - лендинг */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/home" /> : <WelcomePage />} 
        />
        
        <Route 
        path="/home"
        element={user ? <HomePage /> : <Navigate to="/login" />} 
        />

        <Route 
        path="/login" 
        element={<LoginPage />} 
        />
        <Route 
        path="/register" 
        element={<RegisterPage 
        />} 
        />
      </Routes>
    </>
  )
}

export default App