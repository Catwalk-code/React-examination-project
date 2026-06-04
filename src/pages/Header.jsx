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
      backgroundColor: 'var(--color-white)',
      borderBottom: '1px solid var(--border)',
      padding: '15px 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '0 0 6px 6px', // Внешний радиус снизу
      boxShadow: '0 2px 4px rgba(23, 37, 42, 0.1)'
    }}>
      {/* Лого */}
      <Link to="/" style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: 'var(--color-secondary)',
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
              color: 'var(--text)',
              textDecoration: 'none',
              fontWeight: '500'
            }}>
              Вакансии
            </Link>
            
            <span style={{ color: 'var(--color-secondary)' }}>
              Привет, <strong>{user.name}</strong>!
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-white)',
                border: '1px solid var(--color-secondary)',
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
              color: 'var(--color-secondary)',
              textDecoration: 'none',
              border: '2px solid var(--color-secondary)',
              borderRadius: '4px', 
              fontWeight: '500'
            }}>
              Войти
            </Link>
            
            <Link to="/register" style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-white)',
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