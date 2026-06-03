import {Link} from 'react-router-dom'

function WelcomePage(){
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Добро пожаловать на findjob.by!</h1>
        <p>Найдите работу мечты или идеального сотрудника</p>
        
        <div style={{ marginTop: '30px' }}>
          <Link to="/login" style={{ marginRight: '20px' }}>
            <button>Войти</button>
          </Link>
          <Link to="/register">
            <button>Регистрация</button>
          </Link>
        </div>

        <div style={{ marginTop: '50px', display: 'flex', gap: '30px', justifyContent: 'center' }}>
          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', maxWidth: '300px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <h3>Для соискателей</h3>
            <ul style={{ textAlign: 'left' }}>
              <li>Разместите своё резюме</li>
              <li>Откликайтесь на вакансии</li>
              <li>Пишите отзывы о компаниях</li>
            </ul>
          </div>

          <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', maxWidth: '300px' }}>
            <h3>Для компаний</h3>
            <ul style={{ textAlign: 'left' }}>
              <li>Публикуйте вакансии</li>
              <li>Ищите кандидатов</li>
              <li>Приглашайте на собеседование</li>
            </ul>
          </div>
      </div>
    </div>
  )
}

export default WelcomePage