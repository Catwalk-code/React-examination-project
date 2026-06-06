import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../stores/authStore'
import './LoginPage.css'

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
        login(data.user, data.accessToken)
        toast.success('Добро пожаловать!')
        navigate('/home')
      } else {
        toast.error('Введены неверные данные')
    }
    } catch (error) {
      console.error('Ошибка при входе:', error)
      toast.error('Ошибка соединения с сервером: ' + error.message)
    }
  }

  return (
    <div className="auth-page">
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            className="form-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <input
            type="password"
            className="form-input"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn-primary--login">
          Войти
        </button>
      </form>
      
      <p className="auth-footer">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  )
}

export default LoginPage