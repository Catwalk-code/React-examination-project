import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthStore from '../stores/authStore'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Используем функцию login из store
        login(data.user, data.accessToken)
        navigate('/home')
      } else {
        alert('Ошибка входа: ' + data.error)
      }
    } catch (error) {
      console.error('Ошибка при входе:', error)
      alert('Ошибка соединения с сервером: ' + error.message)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', backgroundColor: 'var(--color-white)', color: 'var(--text)' }}>
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid var(--border)', borderRadius: '4px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Пароль:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid var(--border)', borderRadius: '4px' }}
          />
        </div>
        
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-white)', border: '1px solid var(--color-secondary)', borderRadius: '4px' }}>
          Войти
        </button>
      </form>
      
      <p style={{ marginTop: '15px', color: 'var(--text)' }}>
        Нет аккаунта? <Link to="/register" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>Зарегистрироваться</Link>
      </p>
    </div>
  )
}

export default LoginPage