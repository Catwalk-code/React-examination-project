import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

function Header() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header style={{
      backgroundColor: '#fff',
      borderBottom: '1px solid #e5e7eb',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '0 0 6px 6px', // Внешний радиус снизу
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      {/* Лого */}
      <Link to="/" style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2563eb',
        textDecoration: 'none'
      }}>
        findjob.by
      </Link>

      {/* Навигация */}
      <nav style={{
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
      }}>
        {user ? (
          <>
            <Link to="/home" style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Вакансии
            </Link>
            
            <span style={{ color: '#6b7280' }}>
              Привет, <strong>{user.name}</strong>!
            </span>
            
            <Link to="/profile" style={{
              color: '#374151',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Профиль
            </Link>
            
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '4px', 
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              padding: '8px 16px',
              color: '#2563eb',
              textDecoration: 'none',
              border: '2px solid #2563eb',
              borderRadius: '4px', 
              fontWeight: '500'
            }}>
              Войти
            </Link>
            
            <Link to="/register" style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px', 
              fontWeight: '500'
            }}>
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header
