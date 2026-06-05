import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuthStore from '../stores/authStore'
import toast from 'react-hot-toast'
import { Rate } from 'antd'
import './HomePage.css'

const API_URL = 'http://localhost:4000'

//компонент для отображения состояний загрузки и ошибок
function MessageState({ children }) {
  return <div className="dashboard-state">{children}</div>
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="dashboard-state">
      <p>Ошибка: {error}</p>
      <button onClick={onRetry} className="btn-primary">Повторить</button>
    </div>
  )
}

//боковая панель навигации для соискателя
function SeekerSidebar({ user, ownResume, applicationsCount, invitationsCount }) {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-nav">
        <a className="nav-item nav-item--active">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          Панель управления
        </a>
        <a className="nav-item">
          <span className="material-symbols-outlined">description</span>
          Мои резюме
        </a>
        <a className="nav-item">
          <span className="material-symbols-outlined">assignment_turned_in</span>
          Отклики ({applicationsCount})
        </a>
        <a className="nav-item">
          <span className="material-symbols-outlined">mail</span>
          Приглашения ({invitationsCount})
        </a>
        <a className="nav-item">
          <span className="material-symbols-outlined">settings</span>
          Настройки
        </a>
      </div>

      {/*мини-карточка профиля соискателя*/}
      <div className="profile-mini-card">
        <div className="profile-mini-header">
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
              {ownResume ? '85%' : '0%'}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: ownResume ? '85%' : '0%' }}></div>
          </div>
        </div>
      </div>
    </aside>
  )
}

//боковая панель навигации для компании
function CompanySidebar({ user, vacanciesCount, applicationsCount }) {
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
        <a className="nav-item">
          <span className="material-symbols-outlined">settings</span>
          Настройки
        </a>
      </div>

      {/*мини-карточка профиля компании*/}
      <div className="profile-mini-card">
        <div className="profile-mini-header">
          <div className="profile-avatar profile-avatar--company">
            {user?.name?.charAt(0)?.toUpperCase() || 'C'}
          </div>
          <div>
            <p className="profile-name">{user?.name || 'Компания'}</p>
            <p className="profile-title">Работодатель</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

//карточка статуса резюме для соискателя
function ResumeStatusCard({ ownResume, onEdit }) {
  return (
    <div className="stat-card stat-card--resume">
      <div className="stat-card-content">
        <div className="stat-card-icon stat-card-icon--secondary">
          <span className="material-symbols-outlined">article</span>
        </div>
        <div>
          <h3 className="stat-card-title">
            {ownResume ? 'Основное резюме' : 'Резюме не создано'}
          </h3>
          <p className="stat-card-subtitle">
            {ownResume 
              ? `Активно • Обновлено недавно` 
              : 'Создайте резюме, чтобы откликаться на вакансии'}
          </p>
        </div>
      </div>
      <div className="stat-card-actions">
        {ownResume && (
          <button className="btn-outline" onClick={onEdit}>
            Предпросмотр
          </button>
        )}
        <button className="btn-primary">
          {ownResume ? 'Редактировать' : 'Создать резюме'}
        </button>
      </div>
    </div>
  )
}

//карточка статистики приглашений
function InvitationsCard({ count, delta }) {
  return (
    <div className="stat-card stat-card--primary">
      <p className="stat-card-label">Всего приглашений</p>
      <p className="stat-card-number">{count}</p>
      <p className="stat-card-delta">
        <span className="material-symbols-outlined">trending_up</span>
        +{delta} на этой неделе
      </p>
    </div>
  )
}

//карточка статистики вакансий для компании
function VacanciesCard({ count }) {
  return (
    <div className="stat-card stat-card--primary">
      <p className="stat-card-label">Активных вакансий</p>
      <p className="stat-card-number">{count}</p>
      <p className="stat-card-delta">
        <span className="material-symbols-outlined">work</span>
        Опубликованных
      </p>
    </div>
  )
}

//карточка отклика с статусом
function ApplicationCard({ application, vacancy, company }) {
  const statusClass = application.status === 'new' 
    ? 'status-badge--new' 
    : 'status-badge--interview'
  
  const statusText = application.status === 'new' 
    ? 'На рассмотрении' 
    : 'Интервью'

  return (
    <div className="application-card">
      <div className="application-card-icon">
        {vacancy?.title?.charAt(0)?.toUpperCase() || '?'}
      </div>
      <div className="application-card-content">
        <h4 className="application-card-title">{vacancy?.title || 'Вакансия'}</h4>
        <p className="application-card-subtitle">
          {company?.name || 'Компания'} • Отклик отправлен
        </p>
      </div>
      <span className={`status-badge ${statusClass}`}>{statusText}</span>
      <button className="icon-button">
        <span className="material-symbols-outlined">more_vert</span>
      </button>
    </div>
  )
}

//карточка вакансии для списка доступных
function VacancyCard({ vacancy, company, onApply }) {
  return (
    <div className="vacancy-card">
      <div className="vacancy-card-header">
        <div className="vacancy-card-icon">
          <span className="material-symbols-outlined">work</span>
        </div>
        <button className="icon-button">
          <span className="material-symbols-outlined">bookmark</span>
        </button>
      </div>
      <h3 className="vacancy-card-title">{vacancy.title}</h3>
      <p className="vacancy-card-company">{company?.name || 'Компания'}</p>
      <div className="vacancy-card-tags">
        <span className="vacancy-tag">{vacancy.location || 'Не указано'}</span>
        <span className="vacancy-tag vacancy-tag--salary">
          {vacancy.salary || 'Зарплата не указана'}
        </span>
      </div>
      <button className="btn-outline btn-full" onClick={() => onApply(vacancy)}>
        Быстрый отклик
      </button>
    </div>
  )
}

//панель компании с формами и списками
function CompanyDashboard({
  userId,
  vacancyForm,
  setVacancyForm,
  handleCreateVacancy,
  handleDeleteVacancy,
  vacancies,
  resumes,
  usersById,
  inviteCandidate,
  incomingApplications
}) {
  const myVacancies = vacancies.filter((v) => v.companyId === userId)

  return (
    <div className="dashboard-grid">
      <div className="dashboard-main">
        {/*форма создания вакансии*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Разместить вакансию</h2>
            <span className="material-symbols-outlined text-primary">add_circle</span>
          </div>
          <form onSubmit={handleCreateVacancy} className="dashboard-form">
            <input
              className="form-input"
              required
              placeholder="Название вакансии"
              value={vacancyForm.title}
              onChange={(e) => setVacancyForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <div className="form-row">
              <input
                className="form-input"
                required
                placeholder="Локация"
                value={vacancyForm.location}
                onChange={(e) => setVacancyForm((prev) => ({ ...prev, location: e.target.value }))}
              />
              <input
                className="form-input"
                required
                placeholder="Зарплата"
                value={vacancyForm.salary}
                onChange={(e) => setVacancyForm((prev) => ({ ...prev, salary: e.target.value }))}
              />
            </div>
            <textarea
              className="form-input"
              required
              rows={3}
              placeholder="Описание вакансии"
              value={vacancyForm.description}
              onChange={(e) => setVacancyForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <button type="submit" className="btn-primary">
              <span className="material-symbols-outlined">publish</span>
              Опубликовать
            </button>
          </form>
        </section>

        {/*список моих вакансий*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Мои вакансии</h2>
            <span className="section-count">{myVacancies.length}</span>
          </div>
          {myVacancies.length === 0 && (
            <div className="empty-state">
              <span className="material-symbols-outlined">work_off</span>
              <p>У вас пока нет вакансий</p>
            </div>
          )}
          {myVacancies.map((vacancy) => (
            <article key={vacancy.id} className="list-item">
              <div className="list-item-icon">
                {vacancy.title.charAt(0).toUpperCase()}
              </div>
              <div className="list-item-content">
                <h4 className="list-item-title">{vacancy.title}</h4>
                <p className="list-item-text">{vacancy.description}</p>
                <div className="list-item-meta">
                  <span className="material-symbols-outlined">location_on</span>
                  {vacancy.location}
                  <span className="material-symbols-outlined">payments</span>
                  {vacancy.salary}
                </div>
              </div>
              <button
                onClick={() => handleDeleteVacancy(vacancy.id)}
                className="btn-danger btn-sm"
              >
                <span className="material-symbols-outlined">delete</span>
                Удалить
              </button>
            </article>
          ))}
        </section>
      </div>

      <div className="dashboard-aside">
        {/*резюме кандидатов*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Резюме кандидатов</h2>
            <span className="section-count">{resumes.length}</span>
          </div>
          {resumes.length === 0 && (
            <div className="empty-state">
              <span className="material-symbols-outlined">description</span>
              <p>Пока нет резюме</p>
            </div>
          )}
          {resumes.map((resume) => (
            <article key={resume.id} className="list-item">
              <div className="list-item-icon list-item-icon--accent">
                {resume.title.charAt(0).toUpperCase()}
              </div>
              <div className="list-item-content">
                <h4 className="list-item-title">{resume.title}</h4>
                <p className="list-item-subtitle">
                  {usersById[resume.userId]?.name || 'Кандидат'}
                </p>
                <p className="list-item-text">Навыки: {resume.skills}</p>
              </div>
              <button
                onClick={() => inviteCandidate(resume)}
                className="btn-primary btn-sm"
              >
                Пригласить
              </button>
            </article>
          ))}
        </section>

        {/*отклики на мои вакансии*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Отклики</h2>
            <span className="section-count">{incomingApplications.length}</span>
          </div>
          {incomingApplications.length === 0 && (
            <div className="empty-state">
              <span className="material-symbols-outlined">inbox</span>
              <p>Пока нет откликов</p>
            </div>
          )}
          {incomingApplications.map((app) => (
            <article key={app.id} className="list-item">
              <div className="list-item-content">
                <h4 className="list-item-title">
                  {vacancies.find((v) => v.id === app.vacancyId)?.title}
                </h4>
                <p className="list-item-subtitle">
                  {usersById[app.seekerId]?.name || 'Соискатель'}
                </p>
              </div>
              <span className="status-badge status-badge--new">Новый</span>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}

//панель соискателя с формами и списками
function SeekerDashboard({
  ownResume,
  resumeForm,
  setResumeForm,
  handleSaveResume,
  handleDeleteResume,
  vacancies,
  usersById,
  applyToVacancy,
  applications,
  userId,
  companyList,
  reviewForm,
  setReviewForm,
  submitReview,
  hasAppliedToCompany,
  reviews
}) {
  //фильтруем отклики и приглашения текущего пользователя
  const myApplications = applications.filter(
    (app) => app.seekerId === userId && app.type === 'vacancy_application'
  )
  const myInvitations = applications.filter(
    (app) => app.seekerId === userId && app.type === 'resume_invite'
  )

  return (
    <div className="dashboard-grid">
      <div className="dashboard-main">
        {/*форма резюме*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">
              {ownResume ? 'Обновить резюме' : 'Создать резюме'}
            </h2>
            <span className="material-symbols-outlined text-primary">description</span>
          </div>
          <form onSubmit={handleSaveResume} className="dashboard-form">
            <input
              className="form-input"
              required
              placeholder="Желаемая должность"
              value={resumeForm.title}
              onChange={(e) => setResumeForm((prev) => ({ ...prev, title: e.target.value }))}
            />
            <input
              className="form-input"
              required
              placeholder="Навыки (через запятую)"
              value={resumeForm.skills}
              onChange={(e) => setResumeForm((prev) => ({ ...prev, skills: e.target.value }))}
            />
            <textarea
              className="form-input"
              required
              rows={3}
              placeholder="Опыт работы"
              value={resumeForm.experience}
              onChange={(e) => setResumeForm((prev) => ({ ...prev, experience: e.target.value }))}
            />
            <div className="form-actions">
              <button type="submit" className="btn-primary">
                <span className="material-symbols-outlined">save</span>
                {ownResume ? 'Сохранить изменения' : 'Создать резюме'}
              </button>
              {ownResume && (
                <button
                  type="button"
                  onClick={handleDeleteResume}
                  className="btn-danger"
                >
                  <span className="material-symbols-outlined">delete</span>
                  Удалить
                </button>
              )}
            </div>
          </form>
        </section>

        {/*отклики и приглашения с табами*/}
        <section className="dashboard-section">
          <div className="tabs">
            <button className="tab tab--active">
              Отклики ({myApplications.length})
            </button>
            <button className="tab">
              Приглашения ({myInvitations.length})
            </button>
            <button className="tab">Архив</button>
          </div>
          
          {myApplications.length === 0 && myInvitations.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined">inbox</span>
              <p>У вас пока нет откликов или приглашений</p>
            </div>
          ) : (
            <div className="applications-list">
              {myApplications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  vacancy={vacancies.find((v) => v.id === app.vacancyId)}
                  company={usersById[app.companyId]}
                />
              ))}
              {myInvitations.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={{ ...app, status: 'interview' }}
                  vacancy={vacancies.find((v) => v.id === app.vacancyId)}
                  company={usersById[app.companyId]}
                />
              ))}
            </div>
          )}
        </section>

        {/*рекомендованные вакансии*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Рекомендовано вам</h2>
            <a href="#" className="section-link">
              Смотреть все
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
          <div className="vacancies-grid">
            {vacancies.slice(0, 4).map((vacancy) => (
              <VacancyCard
                key={vacancy.id}
                vacancy={vacancy}
                company={usersById[vacancy.companyId]}
                onApply={applyToVacancy}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="dashboard-aside">
        {/*форма отзыва*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Оставить отзыв</h2>
            <span className="material-symbols-outlined text-primary">rate_review</span>
          </div>
          
          {companyList.length === 0 ? (
            <div className="empty-state">
              <p>Нет доступных компаний для отзыва</p>
            </div>
          ) : (
            <>
              <select
                className="form-input"
                value={reviewForm.companyId}
                onChange={(e) => setReviewForm((prev) => ({ ...prev, companyId: e.target.value }))}
              >
                <option value="" disabled>Выберите компанию</option>
                {companyList.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              
              {reviewForm.companyId && !hasAppliedToCompany(Number(reviewForm.companyId)) && (
                <div className="warning-box">
                  <span className="material-symbols-outlined">info</span>
                  <p>Чтобы оставить отзыв, сначала откликнитесь на вакансию этой компании</p>
                </div>
              )}
              
              {reviewForm.companyId && hasAppliedToCompany(Number(reviewForm.companyId)) && (
                <>
                  {reviews.some(
                    (r) => r.authorId === userId && r.companyId === Number(reviewForm.companyId)
                  ) ? (
                    <div className="warning-box">
                      <span className="material-symbols-outlined">check_circle</span>
                      <p>Вы уже оставили отзыв. Отредактируйте его в списке ниже</p>
                    </div>
                  ) : (
                    <form onSubmit={submitReview} className="dashboard-form">
                      <div className="rating-input">
                        <label>Оценка:</label>
                        <Rate
                          value={Number(reviewForm.rating)}
                          onChange={(value) => setReviewForm((prev) => ({ ...prev, rating: value }))}
                        />
                      </div>
                      <textarea
                        className="form-input"
                        required
                        rows={3}
                        placeholder="Напишите ваш отзыв"
                        value={reviewForm.text}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, text: e.target.value }))}
                      />
                      <button type="submit" className="btn-primary btn-full">
                        Опубликовать отзыв
                      </button>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </section>

        {/*последние отзывы*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Последние отзывы</h2>
          </div>
          {reviews.length === 0 ? (
            <div className="empty-state">
              <p>Пока отзывов нет</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.slice(0, 3).map((review) => (
                <article key={review.id} className="review-card">
                  <div className="review-card-header">
                    <h4 className="review-card-company">
                      {usersById[review.companyId]?.name || 'Компания'}
                    </h4>
                    <Rate value={review.rating} disabled style={{ fontSize: '14px' }} />
                  </div>
                  <p className="review-card-text">"{review.text}"</p>
                  <div className="review-card-footer">
                    <small className="review-card-author">
                      — {usersById[review.authorId]?.name || 'Пользователь'}
                    </small>
                    {review.authorId === userId && (
                      <ReviewActions 
                        review={review}
                      />
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

//компонент действий с отзывом (редактирование/удаление)
function ReviewActions({ review }) {
  //используем кастомное событие для связи с родительским компонентом
  return (
    <div className="review-actions">
      <button 
        className="btn-sm btn-outline"
        onClick={() => window.dispatchEvent(new CustomEvent('editReview', { detail: review }))}
      >
        <span className="material-symbols-outlined">edit</span>
      </button>
      <button 
        className="btn-sm btn-danger"
        onClick={() => window.dispatchEvent(new CustomEvent('deleteReview', { detail: review.id }))}
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
    </div>
  )
}

//главный компонент страницы
function HomePage() {
  const { user, token } = useAuthStore()
  const role = user?.role || 'seeker'
  const userId = user?.id ?? null

  const [vacancies, setVacancies] = useState([])
  const [resumes, setResumes] = useState([])
  const [applications, setApplications] = useState([])
  const [reviews, setReviews] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editingReviewId, setEditingReviewId] = useState(null)
  const [editReviewForm, setEditReviewForm] = useState({
    rating: 5,
    text: ''
  })

  const [vacancyForm, setVacancyForm] = useState({
    title: '',
    description: '',
    salary: '',
    location: ''
  })
  const [resumeForm, setResumeForm] = useState({
    title: '',
    skills: '',
    experience: ''
  })
  const [reviewForm, setReviewForm] = useState({
    companyId: '',
    rating: 5,
    text: ''
  })

  const companyList = useMemo(
    () => users.filter((u) => u.role === 'company'),
    [users]
  )
  const usersById = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  )
  const ownResume = useMemo(
    () => resumes.find((r) => r.userId === userId),
    [resumes, userId]
  )

  //подсчёт откликов и приглашений для сайдбара
  const myApplicationsCount = useMemo(
    () => applications.filter((a) => a.seekerId === userId && a.type === 'vacancy_application').length,
    [applications, userId]
  )
  const myInvitationsCount = useMemo(
    () => applications.filter((a) => a.seekerId === userId && a.type === 'resume_invite').length,
    [applications, userId]
  )
  const myVacanciesCount = useMemo(
    () => vacancies.filter((v) => v.companyId === userId).length,
    [vacancies, userId]
  )
  const incomingApplicationsCount = useMemo(
    () => {
      const companyVacancyIds = vacancies
        .filter((v) => v.companyId === userId)
        .map((v) => v.id)
      return applications.filter(
        (a) => a.type === 'vacancy_application' && companyVacancyIds.includes(a.vacancyId)
      ).length
    },
    [applications, vacancies, userId]
  )

  //функция для запросов с авторизацией через токен
  const fetchWithAuth = async (path, options = {}) => {
    const headers = {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...options.headers
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data.error || 'Ошибка запроса')
    }

    return response
  }

  //загрузка всех данных с сервера одним запросом
  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [vacanciesRes, resumesRes, appsRes, reviewsRes, usersRes] =
        await Promise.all([
          fetch(`${API_URL}/vacancies`),
          fetch(`${API_URL}/resumes`),
          fetch(`${API_URL}/applications`),
          fetch(`${API_URL}/reviews`),
          fetch(`${API_URL}/users`)
        ])

      if (!vacanciesRes.ok || !resumesRes.ok || !appsRes.ok || !reviewsRes.ok || !usersRes.ok) {
        throw new Error('Не удалось загрузить данные')
      }

      const [vacanciesData, resumesData, appsData, reviewsData, usersData] = await Promise.all([
        vacanciesRes.json(),
        resumesRes.json(),
        appsRes.json(),
        reviewsRes.json(),
        usersRes.json()
      ])

      setVacancies(vacanciesData)
      setResumes(resumesData)
      setApplications(appsData)
      setReviews(reviewsData)
      setUsers(usersData)
      
      //синхронизируем форму резюме с текущим резюме пользователя
      const currentOwnResume = resumesData.find((r) => r.userId === userId)
      setResumeForm({
        title: currentOwnResume?.title || '',
        skills: currentOwnResume?.skills || '',
        experience: currentOwnResume?.experience || ''
      })
      setReviewForm((prev) => ({
        ...prev,
        companyId:
          prev.companyId || String(usersData.find((u) => u.role === 'company')?.id || '')
      }))
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
  //откладываем вызов на следующий тик event loop, чтобы избежать каскадных рендеров
  const timeoutId = setTimeout(() => {
    loadData()
  }, 0)

  return () => clearTimeout(timeoutId)
}, [loadData])
  //обработчик создания вакансии
  const handleCreateVacancy = async (event) => {
    event.preventDefault()
    try {
      await fetchWithAuth('/vacancies', {
        method: 'POST',
        body: JSON.stringify({
          ...vacancyForm,
          companyId: userId,
          createdAt: new Date().toISOString()
        })
      })
      setVacancyForm({ title: '', description: '', salary: '', location: '' })
      await loadData()
      toast.success('Вакансия опубликована')
    } catch (err) {
      toast.error(err.message)
    }
  }

  //обработчик сохранения/обновления резюме
  const handleSaveResume = async (event) => {
    event.preventDefault()
    const payload = {
      ...resumeForm,
      userId,
      updatedAt: new Date().toISOString()
    }

    try {
      if (ownResume) {
        await fetchWithAuth(`/resumes/${ownResume.id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...ownResume, ...payload })
        })
      } else {
        await fetchWithAuth('/resumes', {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            createdAt: new Date().toISOString()
          })
        })
      }
      await loadData()
      toast.success(ownResume ? 'Резюме обновлено' : 'Резюме создано')
    } catch (err) {
      toast.error(err.message)
    }
  }

  //обработчик отклика на вакансию
  const applyToVacancy = async (vacancy) => {
    const alreadyApplied = applications.some(
      (app) =>
        app.type === 'vacancy_application' &&
        app.vacancyId === vacancy.id &&
        app.seekerId === userId
    )

    if (alreadyApplied) {
      toast.error('Вы уже откликались на эту вакансию')
      return
    }

    try {
      await fetchWithAuth('/applications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'vacancy_application',
          vacancyId: vacancy.id,
          resumeId: ownResume?.id || null,
          seekerId: userId,
          companyId: vacancy.companyId,
          status: 'new',
          createdAt: new Date().toISOString()
        })
      })
      await loadData()
      toast.success('Отклик отправлен')
    } catch (err) {
      toast.error(err.message)
    }
  }

  //проверка, откликался ли пользователь на вакансии компании
  const hasAppliedToCompany = (companyId) => {
    const companyVacancyIds = vacancies
      .filter((v) => v.companyId === companyId)
      .map((v) => v.id)
    
    return applications.some(
      (app) =>
        app.type === 'vacancy_application' &&
        app.seekerId === userId &&
        companyVacancyIds.includes(app.vacancyId)
    )
  }

  //обработчик приглашения кандидата
  const inviteCandidate = async (resume) => {
    const alreadyInvited = applications.some(
      (app) =>
        app.type === 'resume_invite' &&
        app.resumeId === resume.id &&
        app.companyId === userId
    )

    if (alreadyInvited) {
      toast.error('Вы уже приглашали этого кандидата')
      return
    }

    try {
      await fetchWithAuth('/applications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'resume_invite',
          resumeId: resume.id,
          seekerId: resume.userId,
          companyId: userId,
          status: 'sent',
          createdAt: new Date().toISOString()
        })
      })
      await loadData()
      toast.success('Приглашение отправлено')
    } catch (err) {
      toast.error(err.message)
    }
  }

  //обработчик публикации отзыва с проверкой дубликатов
  const submitReview = async (event) => {
    event.preventDefault()
    
    const existingReview = reviews.find(
      (review) => review.authorId === userId && review.companyId === Number(reviewForm.companyId)
    )
    
    if (existingReview) {
      toast.error('Вы уже оставили отзыв на эту компанию')
      return
    }
    
    try {
      await fetchWithAuth('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          companyId: Number(reviewForm.companyId),
          authorId: userId,
          userId: userId,
          rating: Number(reviewForm.rating),
          text: reviewForm.text,
          createdAt: new Date().toISOString()
        })
      })
      setReviewForm((prev) => ({ ...prev, rating: 5, text: '' }))
      await loadData()
      toast.success('Отзыв опубликован')
    } catch (err) {
      toast.error(err.message)
    }
  }

  //универсальное модальное окно подтверждения через toast
  const confirmAction = (message, onConfirm) => {
    toast(
      (t) => (
        <div className="confirm-toast">
          <span>{message}</span>
          <div className="confirm-toast-actions">
            <button
              onClick={() => {
                toast.dismiss(t.id)
                onConfirm()
              }}
              className="btn-danger btn-sm"
            >
              Подтвердить
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="btn-outline btn-sm"
            >
              Отмена
            </button>
          </div>
        </div>
      ),
      { duration: 5000 }
    )
  }

  //обработчик удаления вакансии
  const handleDeleteVacancy = (vacancyId) => {
    confirmAction('Удалить вакансию?', async () => {
      try {
        await fetchWithAuth(`/vacancies/${vacancyId}`, { method: 'DELETE' })
        await loadData()
        toast.success('Вакансия удалена')
      } catch (err) {
        toast.error(err.message)
      }
    })
  }

  //обработчик удаления резюме
  const handleDeleteResume = () => {
    if (!ownResume) return
    confirmAction('Удалить резюме?', async () => {
      try {
        await fetchWithAuth(`/resumes/${ownResume.id}`, { method: 'DELETE' })
        setResumeForm({ title: '', skills: '', experience: '' })
        await loadData()
        toast.success('Резюме удалено')
      } catch (err) {
        toast.error(err.message)
      }
    })
  }

  //обработчик удаления отзыва
  const handleDeleteReview = (reviewId) => {
    confirmAction('Удалить отзыв?', async () => {
      try {
        const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
          method: 'DELETE',
          headers: { Authorization: 'Bearer ' + token }
        })
        
        if (!response.ok) {
          throw new Error('Не удалось удалить отзыв')
        }
        
        await loadData()
        toast.success('Отзыв удалён')
      } catch (err) {
        toast.error(err.message)
      }
    })
  }

  //обработчики редактирования отзыва
  const startEditReview = (review) => {
    setEditingReviewId(review.id)
    setEditReviewForm({
      rating: review.rating,
      text: review.text
    })
  }

  const cancelEditReview = () => {
    setEditingReviewId(null)
    setEditReviewForm({ rating: 5, text: '' })
  }

  //сохранение отредактированного отзыва с полным объектом
  const saveEditReview = async (reviewId) => {
    const originalReview = reviews.find((r) => r.id === reviewId)
    if (!originalReview) return

    try {
      await fetchWithAuth(`/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...originalReview,
          rating: Number(editReviewForm.rating),
          text: editReviewForm.text,
          userId: userId
        })
      })
      await loadData()
      setEditingReviewId(null)
      toast.success('Отзыв обновлён')
    } catch (err) {
      toast.error(err.message)
    }
  }

  //подписка на кастомные события от компонента ReviewActions
  useEffect(() => {
    const handleEdit = (e) => startEditReview(e.detail)
    const handleDelete = (e) => handleDeleteReview(e.detail)
    
    window.addEventListener('editReview', handleEdit)
    window.addEventListener('deleteReview', handleDelete)
    
    return () => {
      window.removeEventListener('editReview', handleEdit)
      window.removeEventListener('deleteReview', handleDelete)
    }
  }, [reviews, token])

  if (!user) {
    return <MessageState>Выполните вход, чтобы продолжить</MessageState>
  }

  if (loading) {
    return <MessageState>Загрузка...</MessageState>
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />
  }

  return (
    <div className="dashboard-layout">
      {/*боковая панель в зависимости от роли*/}
      {role === 'seeker' && (
        <SeekerSidebar
          user={user}
          ownResume={ownResume}
          applicationsCount={myApplicationsCount}
          invitationsCount={myInvitationsCount}
        />
      )}
      {role === 'company' && (
        <CompanySidebar
          user={user}
          vacanciesCount={myVacanciesCount}
          applicationsCount={incomingApplicationsCount}
        />
      )}

      {/*основной контент дашборда*/}
      <main className="dashboard-content">
        {/*верхняя статистика в виде bento-grid*/}
        <section className="stats-grid">
          {role === 'seeker' ? (
            <>
              <div className="stats-grid-main">
                <ResumeStatusCard ownResume={ownResume} />
              </div>
              <div className="stats-grid-side">
                <InvitationsCard count={myInvitationsCount} delta={0} />
              </div>
            </>
          ) : (
            <>
              <div className="stats-grid-main">
                <VacanciesCard count={myVacanciesCount} />
              </div>
              <div className="stats-grid-side">
                <InvitationsCard count={incomingApplicationsCount} delta={0} />
              </div>
            </>
          )}
        </section>

        {/*форма редактирования отзыва (появляется при редактировании)*/}
        {editingReviewId && (
          <section className="edit-review-modal">
            <div className="edit-review-header">
              <h3>Редактирование отзыва</h3>
              <button onClick={cancelEditReview} className="icon-button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="rating-input">
              <label>Оценка:</label>
              <Rate
                value={Number(editReviewForm.rating)}
                onChange={(value) => setEditReviewForm((prev) => ({ ...prev, rating: value }))}
              />
            </div>
            <textarea
              className="form-input"
              rows={3}
              value={editReviewForm.text}
              onChange={(e) => setEditReviewForm((prev) => ({ ...prev, text: e.target.value }))}
            />
            <div className="form-actions">
              <button onClick={() => saveEditReview(editingReviewId)} className="btn-primary">
                Сохранить
              </button>
              <button onClick={cancelEditReview} className="btn-outline">
                Отмена
              </button>
            </div>
          </section>
        )}

        {/*основной контент в зависимости от роли*/}
        {role === 'company' && (
          <CompanyDashboard
            userId={userId}
            vacancyForm={vacancyForm}
            setVacancyForm={setVacancyForm}
            handleCreateVacancy={handleCreateVacancy}
            handleDeleteVacancy={handleDeleteVacancy}
            vacancies={vacancies}
            resumes={resumes}
            usersById={usersById}
            inviteCandidate={inviteCandidate}
            incomingApplications={applications.filter(
              (app) => app.type === 'vacancy_application' && 
              vacancies.filter((v) => v.companyId === userId).map((v) => v.id).includes(app.vacancyId)
            )}
          />
        )}

        {role === 'seeker' && (
          <SeekerDashboard
            ownResume={ownResume}
            resumeForm={resumeForm}
            setResumeForm={setResumeForm}
            handleSaveResume={handleSaveResume}
            handleDeleteResume={handleDeleteResume}
            vacancies={vacancies}
            usersById={usersById}
            applyToVacancy={applyToVacancy}
            applications={applications}
            userId={userId}
            companyList={companyList}
            reviewForm={reviewForm}
            setReviewForm={setReviewForm}
            submitReview={submitReview}
            hasAppliedToCompany={hasAppliedToCompany}
            reviews={reviews}
          />
        )}
      </main>
    </div>
  )
}

export default HomePage