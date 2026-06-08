import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import './RegisterPage.css'

const capitalizeWords = (str) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('seeker')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        toast.success('Регистрация успешна! Теперь войдите.')
        navigate('/login')
      } else {
        toast.error('Ошибка регистрации: ' + (data.message || data.error || 'Неизвестная ошибка'))
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error)
      toast.error('Ошибка соединения с сервером: ' + error.message)
    }
  }

  const handleNameChange = (e) => {
    const value = e.target.value
    setName(capitalizeWords(value))
  }

  return (
    <div className="auth-page">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            placeholder={role === 'company' ? 'Название компании' : 'ФИО'}
            value={name}
            onChange={handleNameChange}
            required
          />
        </div>
        
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
        
        <div className="form-group">
          <select
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            required
          >
            <option value="seeker">Соискатель</option>
            <option value="company">Компания</option>
          </select>
        </div>
        
        <button type="submit" className="btn-primary--form">
          Зарегистрироваться
        </button>
      </form>
      
      <p className="auth-footer">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  )
}

export default RegisterPage