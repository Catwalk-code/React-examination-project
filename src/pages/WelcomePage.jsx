import './WelcomePage.css'

function WelcomePage() {
  return (
    <div className="welcome-page">
      <div className="welcome-hero">
        <h1>Добро пожаловать на findjob.by!</h1>
        <p>Найдите работу мечты или идеального сотрудника</p>
      </div>

      <div className="welcome-features">
        <div className="feature-card">
          <h3>Для соискателей</h3>
          <ul>
            <li>Разместите своё резюме</li>
            <li>Откликайтесь на вакансии</li>
            <li>Пишите отзывы о компаниях</li>
          </ul>
        </div>

        <div className="feature-card">
          <h3>Для компаний</h3>
          <ul>
            <li>Публикуйте вакансии</li>
            <li>Ищите кандидатов по резюме</li>
            <li>Приглашайте на собеседование</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage