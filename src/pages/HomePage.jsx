import { useEffect, useMemo, useState } from 'react'
import useAuthStore from '../stores/authStore'

const API_URL = 'http://localhost:4000'

function HomePage() {
  const { user, token } = useAuthStore()
  const role = user?.role || 'seeker'

  const [vacancies, setVacancies] = useState([])
  const [resumes, setResumes] = useState([])
  const [applications, setApplications] = useState([])
  const [reviews, setReviews] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
    () => resumes.find((resume) => resume.userId === user?.id),
    [resumes, user?.id]
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

  const loadData = async () => {
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
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (ownResume) {
      setResumeForm({
        title: ownResume.title || '',
        skills: ownResume.skills || '',
        experience: ownResume.experience || ''
      })
    }
  }, [ownResume])

  const handleCreateVacancy = async (event) => {
    event.preventDefault()
    try {
      await fetchWithAuth('/vacancies', {
        method: 'POST',
        body: JSON.stringify({
          ...vacancyForm,
          companyId: user.id,
          createdAt: new Date().toISOString()
        })
      })

      setVacancyForm({ title: '', description: '', salary: '', location: '' })
      await loadData()
    } catch (createError) {
      alert(createError.message)
    }
  }

  const handleSaveResume = async (event) => {
    event.preventDefault()

    const payload = {
      ...resumeForm,
      userId: user.id,
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
      alert(saveError.message)
    }
  }

  const applyToVacancy = async (vacancy) => {
    const alreadyApplied = applications.some(
      (application) =>
        application.type === 'vacancy_application' &&
        application.vacancyId === vacancy.id &&
        application.seekerId === user.id
    )

    if (alreadyApplied) {
      alert('Вы уже откликались на эту вакансию')
      return
    }

    try {
      await fetchWithAuth('/applications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'vacancy_application',
          vacancyId: vacancy.id,
          resumeId: ownResume?.id || null,
          seekerId: user.id,
          companyId: vacancy.companyId,
          status: 'new',
          createdAt: new Date().toISOString()
        })
      })
      await loadData()
      alert('Отклик отправлен')
    } catch (applyError) {
      alert(applyError.message)
    }
  }

  const inviteCandidate = async (resume) => {
    const alreadyInvited = applications.some(
      (application) =>
        application.type === 'resume_invite' &&
        application.resumeId === resume.id &&
        application.companyId === user.id
    )

    if (alreadyInvited) {
      alert('Вы уже приглашали этого кандидата')
      return
    }

    try {
      await fetchWithAuth('/applications', {
        method: 'POST',
        body: JSON.stringify({
          type: 'resume_invite',
          resumeId: resume.id,
          seekerId: resume.userId,
          companyId: user.id,
          status: 'sent',
          createdAt: new Date().toISOString()
        })
      })
      await loadData()
      alert('Приглашение отправлено')
    } catch (inviteError) {
      alert(inviteError.message)
    }
  }

  const submitReview = async (event) => {
    event.preventDefault()
    try {
      await fetchWithAuth('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          companyId: Number(reviewForm.companyId),
          authorId: user.id,
          rating: Number(reviewForm.rating),
          text: reviewForm.text,
          createdAt: new Date().toISOString()
        })
      })
      setReviewForm((prev) => ({ ...prev, rating: 5, text: '' }))
      await loadData()
    } catch (reviewError) {
      alert(reviewError.message)
    }
  }

  const companyVacancyIds = useMemo(
    () => vacancies.filter((vacancy) => vacancy.companyId === user?.id).map((vacancy) => vacancy.id),
    [vacancies, user?.id]
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
    return <div style={{ padding: '20px' }}>Выполните вход, чтобы продолжить.</div>
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Загрузка...</div>
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <p>Ошибка: {error}</p>
        <button onClick={loadData} style={{ padding: '8px 16px' }}>Повторить</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', display: 'grid', gap: '24px' }}>
      <h1 style={{ margin: 0 }}>Платформа вакансий</h1>

      {role === 'company' && (
        <>
          <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h2>Разместить вакансию</h2>
            <form onSubmit={handleCreateVacancy} style={{ display: 'grid', gap: '10px' }}>
              <input
                required
                placeholder="Название вакансии"
                value={vacancyForm.title}
                onChange={(event) => setVacancyForm((prev) => ({ ...prev, title: event.target.value }))}
              />
              <input
                required
                placeholder="Локация"
                value={vacancyForm.location}
                onChange={(event) => setVacancyForm((prev) => ({ ...prev, location: event.target.value }))}
              />
              <input
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
              <button type="submit" style={{ width: 'fit-content' }}>Опубликовать</button>
            </form>
          </section>

          <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h2>Мои вакансии</h2>
            {vacancies.filter((vacancy) => vacancy.companyId === user.id).map((vacancy) => (
              <article key={vacancy.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <strong>{vacancy.title}</strong>
                <p style={{ margin: '6px 0' }}>{vacancy.description}</p>
                <small>{vacancy.location} · {vacancy.salary}</small>
              </article>
            ))}
          </section>

          <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h2>Резюме кандидатов</h2>
            {resumes.map((resume) => (
              <article key={resume.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <strong>{resume.title}</strong> — {usersById[resume.userId]?.name || 'Кандидат'}
                <p style={{ margin: '6px 0' }}>Навыки: {resume.skills}</p>
                <p style={{ margin: '6px 0' }}>Опыт: {resume.experience}</p>
                <button onClick={() => inviteCandidate(resume)}>Пригласить</button>
              </article>
            ))}
          </section>

          <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h2>Отклики на мои вакансии</h2>
            {incomingApplications.length === 0 && <p>Пока нет откликов.</p>}
            {incomingApplications.map((application) => (
              <article key={application.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <p style={{ margin: '4px 0' }}>
                  Вакансия: <strong>{vacancies.find((vacancy) => vacancy.id === application.vacancyId)?.title}</strong>
                </p>
                <p style={{ margin: '4px 0' }}>
                  Кандидат: {usersById[application.seekerId]?.name || 'Соискатель'}
                </p>
              </article>
            ))}
          </section>
        </>
      )}

      {role === 'seeker' && (
        <>
          <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h2>{ownResume ? 'Обновить резюме' : 'Создать резюме'}</h2>
            <form onSubmit={handleSaveResume} style={{ display: 'grid', gap: '10px' }}>
              <input
                required
                placeholder="Желаемая должность"
                value={resumeForm.title}
                onChange={(event) => setResumeForm((prev) => ({ ...prev, title: event.target.value }))}
              />
              <input
                required
                placeholder="Навыки (через запятую)"
                value={resumeForm.skills}
                onChange={(event) => setResumeForm((prev) => ({ ...prev, skills: event.target.value }))}
              />
              <textarea
                required
                rows={3}
                placeholder="Опыт"
                value={resumeForm.experience}
                onChange={(event) => setResumeForm((prev) => ({ ...prev, experience: event.target.value }))}
              />
              <button type="submit" style={{ width: 'fit-content' }}>
                {ownResume ? 'Сохранить изменения' : 'Создать резюме'}
              </button>
            </form>
          </section>

          <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h2>Доступные вакансии</h2>
            {vacancies.map((vacancy) => (
              <article key={vacancy.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <strong>{vacancy.title}</strong> — {usersById[vacancy.companyId]?.name || 'Компания'}
                <p style={{ margin: '6px 0' }}>{vacancy.description}</p>
                <small>{vacancy.location} · {vacancy.salary}</small>
                <div style={{ marginTop: '8px' }}>
                  <button onClick={() => applyToVacancy(vacancy)}>Откликнуться</button>
                </div>
              </article>
            ))}
          </section>

          <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h2>Мои отклики и приглашения</h2>
            {applications
              .filter((application) => application.seekerId === user.id)
              .map((application) => (
                <article key={application.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
                  <p style={{ margin: '4px 0' }}>
                    {application.type === 'vacancy_application' ? 'Отклик на вакансию' : 'Приглашение от компании'}
                  </p>
                  {application.vacancyId && (
                    <p style={{ margin: '4px 0' }}>
                      Вакансия: {vacancies.find((vacancy) => vacancy.id === application.vacancyId)?.title}
                    </p>
                  )}
                  <p style={{ margin: '4px 0' }}>
                    Компания: {usersById[application.companyId]?.name || 'Компания'}
                  </p>
                </article>
              ))}
          </section>

          <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
            <h2>Оставить отзыв о компании</h2>
            {companyList.length === 0 && <p>Нет доступных компаний для отзыва.</p>}
            {companyList.length > 0 && (
              <form onSubmit={submitReview} style={{ display: 'grid', gap: '10px' }}>
                <select
                  required
                  value={reviewForm.companyId}
                  onChange={(event) =>
                    setReviewForm((prev) => ({ ...prev, companyId: event.target.value }))
                  }
                >
                  {companyList.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <input
                  required
                  type="number"
                  min="1"
                  max="5"
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, rating: event.target.value }))}
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Напишите ваш отзыв"
                  value={reviewForm.text}
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, text: event.target.value }))}
                />
                <button type="submit" style={{ width: 'fit-content' }}>Опубликовать отзыв</button>
              </form>
            )}
          </section>
        </>
      )}

      <section style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '16px' }}>
        <h2>Отзывы о компаниях</h2>
        {reviews.length === 0 && <p>Пока отзывов нет.</p>}
        {reviews.map((review) => (
          <article key={review.id} style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <p style={{ margin: '4px 0' }}>
              <strong>{usersById[review.companyId]?.name || 'Компания'}</strong> · {review.rating}/5
            </p>
            <p style={{ margin: '4px 0' }}>{review.text}</p>
            <small>Автор: {usersById[review.authorId]?.name || 'Пользователь'}</small>
          </article>
        ))}
      </section>
    </div>
  )
}

export default HomePage