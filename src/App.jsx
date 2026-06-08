import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './stores/authStore'
import WelcomePage from './pages/WelcomePage/WelcomePage'
import LoginPage from './pages/LoginPage/LoginPage'
import RegisterPage from './pages/RegisterPage/RegisterPage'
import Header from './components/Header/Header'
import HomePage from './pages/HomePage/HomePage'


function App() {
  const  { user } = useAuthStore()

    return (
    <>
      <Header />
      <Routes>
        {/*если залогинен, то показывает главную, иначе лендинг */}
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