import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import './Header.css'

function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        findjob.by
      </Link>

      <nav className="header-nav">
        {user ? (
          <>
            <Link to="/home" className="nav-link">
              Вакансии
            </Link>
            
            <span className="nav-greeting">
              Привет, <strong>{user.name}</strong>!
            </span>
            
            <button onClick={handleLogout} className="btn-logout">
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-outline--header">
              Войти
            </Link>
            
            <Link to="/register" className="btn-filled">
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header