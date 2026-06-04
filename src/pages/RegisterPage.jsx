import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('seeker') // seeker или company
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
        alert('Регистрация успешна! Теперь войдите.')
        navigate('/login')
      } else {
        alert('Ошибка регистрации: ' + data.error)
      }
    } catch (error) {
      alert('Ошибка соединения с сервером' + error.message)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', backgroundColor: 'var(--color-white)', color: 'var(--text)' }}>
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Имя:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid var(--border)', borderRadius: '4px' }}
          />
        </div>
        
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
        
        <div style={{ marginBottom: '15px' }}>
          <label>Тип аккаунта:</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid var(--border)', borderRadius: '4px' }}
          >
            <option value="seeker">Соискатель</option>
            <option value="company">Компания</option>
          </select>
        </div>
        
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-white)', border: '1px solid var(--color-secondary)', borderRadius: '4px' }}>
          Зарегистрироваться
        </button>
      </form>
      
      <p style={{ marginTop: '15px', color: 'var(--color-secondary)' }}>
        Уже есть аккаунт? <Link to="/login" style={{ color: 'var(--color-secondary)' }}>Войти</Link>
      </p>
    </div>
  )
}

export default RegisterPage