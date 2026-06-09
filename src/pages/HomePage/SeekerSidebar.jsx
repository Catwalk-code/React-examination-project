export function SeekerSidebar({ user, ownResume, applicationsCount, invitationsCount }) {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-nav">
        <a className="nav-item nav-item--active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          Панель управления
        </a>
        <a className="nav-item">
          <span className="material-symbols-outlined">description</span>
          Моё резюме
        </a>
        <a className="nav-item">
          <span className="material-symbols-outlined">assignment_turned_in</span>
          Отклики ({applicationsCount})
        </a>
        <a className="nav-item">
          <span className="material-symbols-outlined">mail</span>
          Приглашения ({invitationsCount})
        </a>
      </div>

      {/*мини-карточка профиля соискателя*/}
      <div className="profile-mini-card">
        <div className="profile-mini-header--user">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="profile-name">{user?.name || 'Пользователь'}</p>
            <p className="profile-title">{ownResume?.title || 'Соискатель'}</p>
          </div>
        </div>
        <div className="profile-progress">
          <div className="profile-progress-header">
            <span className="text-label-sm">Заполненность профиля</span>
            <span className="text-label-sm text-primary">
              {ownResume ? '100%' : '0%'}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: ownResume ? '100%' : '0%' }}></div>
          </div>
        </div>
      </div>
      <div className="stat-card stat-card--primary">
        <p className="stat-card-label">Всего приглашений</p>
        <p className="stat-card-number">{invitationsCount}</p>
        <p className="stat-card-delta">
          <span className="material-symbols-outlined">trending_up</span>
          на этой неделе
        </p>
      </div>
    </aside>
  )
}