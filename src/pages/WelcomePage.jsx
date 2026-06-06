import { Link } from 'react-router-dom'
import './WelcomePage.css'

function WelcomePage() {
  return (
    <div className="welcome-page">
      <main>
        {/*Hero секция с поиском*/}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Найдите новую{' '}
              <span className="text-primary">профессию</span>{' '}
              с лёгкостью
            </h1>
            <p className="hero-subtitle">
              Связывайтесь с лучшими работодателями через платформу, созданную для увеличения скорости поиска работы
            </p>
            
            {/*поисковая строка*/}
            
          </div>

          <div className="hero-image">
            <div className="hero-image-bg"></div>
            <img 
              src="src/assets/woman-thinking-at-work.jpg"
              alt="Профессионал за работой"
              className="hero-img"
            />
          </div>
        </section>

        {/*Статистика*/}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">12.480+</div>
              <div className="stat-label">Активных вакансий</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">850+</div>
              <div className="stat-label">Топ компаний</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">45.000</div>
              <div className="stat-label">Проверенных резюме</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">92%</div>
              <div className="stat-label">Точность подбора</div>
            </div>
          </div>
        </section>

        {/*Преимущества для соискателей и работодателей*/}
        <section className="features-section">
          <div className="features-grid">
            {/*карточка для соискателей*/}
            <div className="feature-card">
              <div className="feature-icon feature-icon--seeker">
                <span className="material-symbols-outlined">person_search</span>
              </div>
              <h2>Соискателям</h2>
              <ul>
                <li>
                  <span className="material-symbols-outlined check-icon">check_circle</span>
                  <span>Подбор вакансий на основе ИИ по вашему уникальному профилю навыков.</span>
                </li>
                <li>
                  <span className="material-symbols-outlined check-icon">check_circle</span>
                  <span>Прямое общение с проверенными HR-менеджерами.</span>
                </li>
                <li>
                  <span className="material-symbols-outlined check-icon">check_circle</span>
                  <span>Отслеживайте статус ваших откликов в режиме реального времени.</span>
                </li>
              </ul>
              <Link to="/login" className="btn-primary btn-full">Загрузить резюме</Link>
            </div>

            {/*карточка для работодателей*/}
            <div className="feature-card">
              <div className="feature-icon feature-icon--employer">
                <span className="material-symbols-outlined">business_center</span>
              </div>
              <h2>Работодателям</h2>
              <ul>
                <li>
                  <span className="material-symbols-outlined check-icon">check_circle</span>
                  <span>Публикуйте вакансии и охватите более 45к активных специалистов.</span>
                </li>
                <li>
                  <span className="material-symbols-outlined check-icon">check_circle</span>
                  <span>Умная фильтрация для выявления лучших 5% кандидатов.</span>
                </li>
                <li>
                  <span className="material-symbols-outlined check-icon">check_circle</span>
                  <span>Инструменты бренда работодателя для демонстрации культуры компании.</span>
                </li>
              </ul>
              <Link to="/login" className="btn-outline btn-full">Разместить вакансию</Link>
            </div>
          </div>
        </section>

        {/*Последние вакансии*/}
        <section className="vacancies-section">
          <div className="vacancies-header">
            <div>
              <h2>Последние вакансии</h2>
              <p>Новые возможности, опубликованные за последние 24 часа</p>
            </div>
          </div>

          <div className="vacancies-grid">
            {/*вакансия 1*/}
            <div className="vacancy-card">
              <div className="vacancy-card-header">
                <div className="vacancy-logo vacancy-logo--t">T</div>
                <span className="vacancy-badge">Полная занятость</span>
              </div>
              <h3>Старший продуктовый дизайнер</h3>
              <p className="vacancy-company">TechSolutions Inc.</p>
              <div className="vacancy-meta">
                <span className="material-symbols-outlined">location_on</span>
                Минск
                <span className="material-symbols-outlined">payments</span>
                3.5k - 5k
              </div>
              <Link to="/login">
              <button className="btn-outline btn-full">Откликнуться</button>
              </Link>
            </div>

            {/*вакансия 2*/}
            <div className="vacancy-card">
              <div className="vacancy-card-header">
                <div className="vacancy-logo vacancy-logo--d">D</div>
                <span className="vacancy-badge">Удаленно</span>
              </div>
              <h3>Ведущий бэкенд-разработчик</h3>
              <p className="vacancy-company">DataFlow Systems</p>
              <div className="vacancy-meta">
                <span className="material-symbols-outlined">location_on</span>
                Удаленно
                <span className="material-symbols-outlined">payments</span>
                4k - 6.5k
              </div>
              <Link to="/login">
              <button className="btn-outline btn-full">Откликнуться</button>
              </Link>
            </div>

            {/*вакансия 3*/}
            <div className="vacancy-card">
              <div className="vacancy-card-header">
                <div className="vacancy-logo vacancy-logo--g">G</div>
                <span className="vacancy-badge">Гибрид</span>
              </div>
              <h3>Специалист по маркетингу</h3>
              <p className="vacancy-company">GreenGlobal</p>
              <div className="vacancy-meta">
                <span className="material-symbols-outlined">location_on</span>
                Гомель
                <span className="material-symbols-outlined">payments</span>
                1.2k - 2k
              </div>
              <Link to="/login">
              <button className="btn-outline btn-full">Откликнуться</button>
              </Link>
            </div>
          </div>
        </section>

        {/*CTA секция*/}
        <section className="cta-section">
          <div className="cta-content">
            <div className="cta-pattern"></div>
            <h2>Готовы изменить свою карьеру?</h2>
            <p>Присоединяйтесь к тысячам профессионалов, которые нашли работу своей мечты на findjob.by. Ваша следующая возможность — всего в одном клике.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn-white">Создать аккаунт</Link>
              <Link to="/login">
                <button className="btn-outline-white">Войти</button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/*Footer*/}
      <footer className="welcome-footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-brand">
              <h2>findjob.by</h2>
              <p>Ведущая платформа по подбору персонала в Беларуси, соединяющая таланты с возможностями.</p>
            </div>
            <div className="footer-column">
              <h4>Платформа</h4>
              <Link to="/">Поиск вакансий</Link>
              <Link to="/">Компании</Link>
              <Link to="/">Цены</Link>
            </div>
            <div className="footer-column">
              <h4>Поддержка</h4>
              <Link to="/">О нас</Link>
              <Link to="/">Контакты</Link>
              <Link to="/">Карта сайта</Link>
            </div>
            
          </div>
          <div className="footer-bottom">
            <p>© 2026 findjob.by. Все права защищены.</p>
            <div className="footer-links">
              <Link to="/">Политика конфиденциальности</Link>
              <Link to="/">Условия использования</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default WelcomePage