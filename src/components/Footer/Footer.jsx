import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
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
  )
}

export default Footer