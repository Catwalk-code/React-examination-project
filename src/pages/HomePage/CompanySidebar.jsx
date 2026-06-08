//боковая панель навигации для компании
export function CompanySidebar({ user, vacanciesCount, applicationsCount }) {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-nav">
        <a className="nav-item nav-item--active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          Панель управления
        </a>
        <a className="nav-item">
          <span className="material-symbols-outlined">work</span>
          Мои вакансии ({vacanciesCount})
        </a>
        <a className="nav-item">
          <span className="material-symbols-outlined">assignment_turned_in</span>
          Отклики ({applicationsCount})
        </a>
        <a className="nav-item">
          <span className="material-symbols-outlined">group</span>
          Кандидаты
        </a>
      </div>

      {/*мини-карточка профиля компании*/}
      <div className="profile-mini-card">
        <div className="profile-mini-header--company">
          <div className="profile-avatar profile-avatar--company">
            {user?.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div>
            <p className="profile-name">{user?.name || 'Компания'}</p>
            <p className="profile-title">Работодатель</p>
          </div>
        </div>
      </div>

      {/*блоки статистики*/}
      <div className="stat-card stat-card--primary">
        <p className="stat-card-label">Активных вакансий</p>
        <p className="stat-card-number">{vacanciesCount}</p>
        <p className="stat-card-delta">
          <span className="material-symbols-outlined">work</span>
          Опубликованных
        </p>
      </div>

      <div className="stat-card stat-card--primary">
        <p className="stat-card-label">Всего приглашений</p>
        <p className="stat-card-number">{applicationsCount}</p>
        <p className="stat-card-delta">
          <span className="material-symbols-outlined">trending_up</span>
          на этой неделе
        </p>
      </div>
    </aside>
  )
}