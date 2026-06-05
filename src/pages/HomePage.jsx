import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuthStore from '../stores/authStore'
import toast from 'react-hot-toast'
import { Rate } from 'antd';
import './HomePage.css'

const API_URL = 'http://localhost:4000'

function MessageState({ children }) {
  return <div className="home-page__state">{children}</div>
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="home-page__state">
      <p>Ошибка: {error}</p>
      <button onClick={onRetry} className="home-page__button">Повторить</button>
    </div>
  )
}

function Section({ children }) {
  return <section className="home-page__section">{children}</section>
}

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
  return (
    <>
      <Section>
        <h2>Разместить вакансию</h2>
        <form onSubmit={handleCreateVacancy} className="home-page__form">
          <input
            className = "home-page__input"
            required
            placeholder="Название вакансии"
            value={vacancyForm.title}
            onChange={(event) => setVacancyForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <input
            className = "home-page__input"
            required
            placeholder="Локация"
            value={vacancyForm.location}
            onChange={(event) => setVacancyForm((prev) => ({ ...prev, location: event.target.value }))}
          />
          <input
            className = "home-page__input"
            required
            placeholder="Зарплата"
            value={vacancyForm.salary}
            onChange={(event) => setVacancyForm((prev) => ({ ...prev, salary: event.target.value }))}
          />
          <textarea
            required
            rows={3}
            placeholder="Описание"
            value={vacancyForm.description}
            onChange={(event) => setVacancyForm((prev) => ({ ...prev, description: event.target.value }))}
          />
          <button type="submit" className="home-page__button">Опубликовать</button>
        </form>
      </Section>

      <Section>
        <h2>Мои вакансии</h2>
        {vacancies.filter((vacancy) => vacancy.companyId === userId).length === 0 && (
          <p>У вас пока нет вакансий.</p>
        )}
        {vacancies.filter((vacancy) => vacancy.companyId === userId).map((vacancy) => (
          <article key={vacancy.id} className="home-page__item">
            <div className="home-page__item-header">
              <strong>{vacancy.title}</strong>
              <button 
                onClick={() => handleDeleteVacancy(vacancy.id)} 
                className="home-page__button home-page__button--danger"
              >
                Удалить
              </button>
            </div>
            <p className="home-page__text">{vacancy.description}</p>
            <small>{vacancy.location} · {vacancy.salary}</small>
          </article>
        ))}
      </Section>

      <Section>
        <h2>Резюме кандидатов</h2>
        {resumes.map((resume) => (
          <article key={resume.id} className="home-page__item">
            <strong>{resume.title}</strong> — {usersById[resume.userId]?.name || 'Кандидат'}
            <p className="home-page__text">Навыки: {resume.skills}</p>
            <p className="home-page__text">Опыт: {resume.experience}</p>
            <button onClick={() => inviteCandidate(resume)} className="home-page__button">Пригласить</button>
          </article>
        ))}
      </Section>

      <Section>
        <h2>Отклики на мои вакансии</h2>
        {incomingApplications.length === 0 && <p>Пока нет откликов.</p>}
        {incomingApplications.map((application) => (
          <article key={application.id} className="home-page__item">
            <p className="home-page__meta">
              Вакансия: <strong>{vacancies.find((vacancy) => vacancy.id === application.vacancyId)?.title}</strong>
            </p>
            <p className="home-page__meta">
              Кандидат: {usersById[application.seekerId]?.name || 'Соискатель'}
            </p>
          </article>
        ))}
      </Section>
    </>
  )
}

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
  return (
    <>
      <Section>
        <h2>{ownResume ? 'Обновить резюме' : 'Создать резюме'}</h2>
        <form onSubmit={handleSaveResume} className="home-page__form">
          <input
            className = "home-page__input"
            required
            placeholder="Желаемая должность"
            value={resumeForm.title}
            onChange={(event) => setResumeForm((prev) => ({ ...prev, title: event.target.value }))}
          />
          <input
            className = "home-page__input"
            required
            placeholder="Навыки (через запятую)"
            value={resumeForm.skills}
            onChange={(event) => setResumeForm((prev) => ({ ...prev, skills: event.target.value }))}
          />
          <textarea
            className = "home-page__input"
            required
            rows={3}
            placeholder="Опыт"
            value={resumeForm.experience}
            onChange={(event) => setResumeForm((prev) => ({ ...prev, experience: event.target.value }))}
          />
          <div className="home-page__form-actions">
            <button type="submit" className="home-page__button">
              {ownResume ? 'Сохранить изменения' : 'Создать резюме'}
            </button>
            {ownResume && (
              <button 
                type="button" 
                onClick={handleDeleteResume}
                className="home-page__button home-page__button--danger"
              >
                Удалить резюме
              </button>
            )}
          </div>
        </form>
      </Section>

      <Section>
        <h2>Доступные вакансии</h2>
        {vacancies.map((vacancy) => (
          <article key={vacancy.id} className="home-page__item">
            <strong>{vacancy.title}</strong> — {usersById[vacancy.companyId]?.name || 'Компания'}
            <p className="home-page__text">{vacancy.description}</p>
            <small>{vacancy.location} · {vacancy.salary}</small>
            <div className="home-page__actions">
              <button onClick={() => applyToVacancy(vacancy)} className="home-page__button">Откликнуться</button>
            </div>
          </article>
        ))}
      </Section>

      <Section>
        <h2>Мои отклики и приглашения</h2>
        {applications
          .filter((application) => application.seekerId === userId)
          .map((application) => (
            <article key={application.id} className="home-page__item">
              <p className="home-page__meta">
                {application.type === 'vacancy_application' ? 'Отклик на вакансию' : 'Приглашение от компании'}
              </p>
              {application.vacancyId && (
                <p className="home-page__meta">
                  Вакансия: {vacancies.find((vacancy) => vacancy.id === application.vacancyId)?.title}
                </p>
              )}
              <p className="home-page__meta">
                Компания: {usersById[application.companyId]?.name || 'Компания'}
              </p>
            </article>
          ))}
      </Section>

      <Section>
        <h2>Оставить отзыв о компании</h2>
        {companyList.length === 0 && <p>Нет доступных компаний для отзыва.</p>}
        {companyList.length > 0 && (
          <>
            <select
              required
              value={reviewForm.companyId}
              onChange={(event) => setReviewForm((prev) => ({ ...prev, companyId: event.target.value }))}
              className="home-page__input"
            >
              <option value="" disabled>
                Выберите компанию
              </option>
              {companyList.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            
            {reviewForm.companyId && !hasAppliedToCompany(Number(reviewForm.companyId)) && (
              <div className="home-page__warning">
                <p>Чтобы оставить отзыв, сначала откликнитесь на вакансию этой компании.</p>
              </div>
            )}
            
            {reviewForm.companyId && hasAppliedToCompany(Number(reviewForm.companyId)) && (
              <>
                {reviews.some(
                  (r) => r.authorId === userId && r.companyId === Number(reviewForm.companyId)
                ) ? (
                  <div className="home-page__warning">
                    <p>Вы уже оставили отзыв на эту компанию. Вы можете отредактировать его в списке ниже.</p>
                  </div>
                ) : (
                  <form onSubmit={submitReview} className="home-page__form">
                    <div className="home-page__rating">
                      <label>Оценка:</label>
                      <Rate
                        value={Number(reviewForm.rating)}
                        onChange={(value) => setReviewForm((prev) => ({ ...prev, rating: value }))}
                      />
                    </div>
                    <textarea
                      className="home-page__input"
                      required
                      rows={3}
                      placeholder="Напишите ваш отзыв"
                      value={reviewForm.text}
                      onChange={(event) => setReviewForm((prev) => ({ ...prev, text: event.target.value }))}
                    />
                    <button type="submit" className="home-page__button">Опубликовать отзыв</button>
                  </form>
                )}
              </>
            )}
          </>
        )}
</Section>
    </>
  )
}

function ReviewsSection({ 
  reviews, 
  usersById, 
  userId, 
  editingReviewId, 
  editReviewForm, 
  setEditReviewForm, 
  startEditReview, 
  cancelEditReview, 
  saveEditReview,
  handleDeleteReview
}) {
  return (
    <Section>
      <h2>Отзывы о компаниях</h2>
      {reviews.length === 0 && <p>Пока отзывов нет.</p>}
      {reviews.map((review) => (
        <article key={review.id} className="home-page__item">
          <p className="home-page__meta">
            <strong>{usersById[review.companyId]?.name || 'Компания'}</strong>
            <Rate value={review.rating} disabled style={{ fontSize: '14px', marginLeft: '8px' }} />
          </p>
          
          {editingReviewId === review.id ? (
          <div className="home-page__edit-form">
            <div className="home-page__edit-rating">
              <label>Оценка:</label>
              <Rate
                value={Number(editReviewForm.rating)}
                onChange={(value) => setEditReviewForm((prev) => ({ ...prev, rating: value }))}
              />
            </div>
            <textarea
              rows={3}
              value={editReviewForm.text}
              onChange={(e) => setEditReviewForm((prev) => ({ ...prev, text: e.target.value }))}
              className="home-page__edit-textarea"
            />
            <div className="home-page__edit-actions">
              <button onClick={() => saveEditReview(review.id)} className="home-page__button">
                Сохранить
              </button>
              <button onClick={cancelEditReview} className="home-page__button home-page__button--cancel">
                Отмена
              </button>
            </div>
          </div>
        ) : (
            <>
              <p className="home-page__meta">{review.text}</p>
              <small>Автор: {usersById[review.authorId]?.name || 'Пользователь'}</small>
              {review.authorId === userId && (
                <div className="home-page__review-actions">
                  <button 
                    onClick={() => startEditReview(review)} 
                    className="home-page__button home-page__button--edit"
                  >
                    Редактировать
                  </button>
                  <button 
                    onClick={() => handleDeleteReview(review.id)} 
                    className="home-page__button home-page__button--danger"
                  >
                    Удалить
                  </button>
                </div>
              )}
            </>
          )}
        </article>
      ))}
    </Section>
  )
}

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
    () => users.filter((currentUser) => currentUser.role === 'company'),
    [users]
  )
  const usersById = useMemo(
    () => Object.fromEntries(users.map((currentUser) => [currentUser.id, currentUser])),
    [users]
  )
  const ownResume = useMemo(
    () => resumes.find((resume) => resume.userId === userId),
    [resumes, userId]
  )

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

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [vacanciesResponse, resumesResponse, applicationsResponse, reviewsResponse, usersResponse] =
        await Promise.all([
          fetch(`${API_URL}/vacancies`),
          fetch(`${API_URL}/resumes`),
          fetch(`${API_URL}/applications`),
          fetch(`${API_URL}/reviews`),
          fetch(`${API_URL}/users`)
        ])

      const hasFailed =
        !vacanciesResponse.ok ||
        !resumesResponse.ok ||
        !applicationsResponse.ok ||
        !reviewsResponse.ok ||
        !usersResponse.ok

      if (hasFailed) {
        throw new Error('Не удалось загрузить данные')
      }

      const [vacanciesData, resumesData, applicationsData, reviewsData, usersData] = await Promise.all([
        vacanciesResponse.json(),
        resumesResponse.json(),
        applicationsResponse.json(),
        reviewsResponse.json(),
        usersResponse.json()
      ])

      setVacancies(vacanciesData)
      setResumes(resumesData)
      setApplications(applicationsData)
      setReviews(reviewsData)
      setUsers(usersData)
      const currentOwnResume = resumesData.find((resume) => resume.userId === userId)
      setResumeForm({
        title: currentOwnResume?.title || '',
        skills: currentOwnResume?.skills || '',
        experience: currentOwnResume?.experience || ''
      })
      setReviewForm((prev) => ({
        ...prev,
        companyId:
          prev.companyId || String(usersData.find((currentUser) => currentUser.role === 'company')?.id || '')
      }))
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [loadData])

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
    } catch (createError) {
      toast.error(createError.message)
    }
  }

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
  } catch (error) {
    toast.error(error.message)
  }
}

  const confirmAction = (message, onConfirm) => {
  toast(
    (t) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span>{message}</span>
        <button
          onClick={() => {
            toast.dismiss(t.id)
            onConfirm()
          }}
          style={{
            padding: '6px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Подтвердить
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          style={{
            padding: '6px 12px',
            backgroundColor: '#e5e7eb',
            color: '#374151',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          Отмена
        </button>
      </div>
    ),
    { duration: 5000 }
  )
}

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
          body: JSON.stringify({
            ...ownResume,
            ...payload
          })
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
    } catch (saveError) {
      toast.error(saveError.message)
    }
  }

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

const handleDeleteReview = (reviewId) => {
  confirmAction('Удалить отзыв?', async () => {
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token
        }
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

  const applyToVacancy = async (vacancy) => {
    const alreadyApplied = applications.some(
      (application) =>
        application.type === 'vacancy_application' &&
        application.vacancyId === vacancy.id &&
        application.seekerId === userId
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
    } catch (applyError) {
      toast.error(applyError.message)
    }
  }

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

  const inviteCandidate = async (resume) => {
    const alreadyInvited = applications.some(
      (application) =>
        application.type === 'resume_invite' &&
        application.resumeId === resume.id &&
        application.companyId === userId
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
    } catch (inviteError) {
      toast.error(inviteError.message)
    }
  }

  const submitReview = async (event) => {
  event.preventDefault()
  
  //проверяем, есть ли уже отзыв от этого пользователя на эту компанию
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
  } catch (reviewError) {
    toast.error(reviewError.message)
  }
}

  const companyVacancyIds = useMemo(
    () => vacancies.filter((vacancy) => vacancy.companyId === userId).map((vacancy) => vacancy.id),
    [vacancies, userId]
  )

  const incomingApplications = useMemo(
    () =>
      applications.filter(
        (application) =>
          application.type === 'vacancy_application' && companyVacancyIds.includes(application.vacancyId)
      ),
    [applications, companyVacancyIds]
  )

  if (!user) {
    return <MessageState>Выполните вход, чтобы продолжить.</MessageState>
  }

  if (loading) {
    return <MessageState>Загрузка...</MessageState>
  }

  if (error) {
    return <ErrorState error={error} onRetry={loadData} />
  }

  return (
    <div className="home-page">
      <h1 className="home-page__title">Платформа вакансий</h1>

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
          incomingApplications={incomingApplications}
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

      <ReviewsSection 
        reviews={reviews} 
        usersById={usersById}
        userId={userId}
        editingReviewId={editingReviewId}
        editReviewForm={editReviewForm}
        setEditReviewForm={setEditReviewForm}
        startEditReview={startEditReview}
        cancelEditReview={cancelEditReview}
        saveEditReview={saveEditReview}
        handleDeleteReview={handleDeleteReview}
    />
    </div>
  )
}

export default HomePage