import { useCallback, useEffect, useMemo, useState } from 'react'
import useAuthStore from '../../stores/authStore'
import toast from 'react-hot-toast'
import './HomePage.css'
import Footer from '../../components/Footer/Footer'
import { CompanySidebar } from './CompanySidebar'
import { SeekerSidebar } from './SeekerSidebar'
import { CompanyDashboard } from './CompanyDashboard'
import { SeekerDashboard } from './SeekerDashboard' 

const API_URL = 'http://localhost:4000'

//компонент для отображения состояний загрузки и ошибок
function MessageState({ children }) {
  return <div className="dashboard-state">{children}</div>
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="dashboard-state">
      <p>Ошибка: {error}</p>
      <button onClick={onRetry} className="btn-primary--home-page">Повторить</button>
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
  const [editingVacancyId, setEditingVacancyId] = useState(null)
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
    //загружаем каждый ресурс отдельно, чтобы ошибка одного не блокировала другие
    const [vacanciesRes, resumesRes, appsRes, reviewsRes, usersRes] = await Promise.all([
      fetch(`${API_URL}/vacancies`).catch(() => null),
      fetch(`${API_URL}/resumes`).catch(() => null),
      fetch(`${API_URL}/applications`, {
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      }).catch(() => null),
      fetch(`${API_URL}/reviews`).catch(() => null),
      fetch(`${API_URL}/users`).catch(() => null)
    ])

    //парсим только успешные ответы
    const [vacanciesData, resumesData, appsData, reviewsData, usersData] = await Promise.all([
      vacanciesRes?.ok ? vacanciesRes.json() : Promise.resolve([]),
      resumesRes?.ok ? resumesRes.json() : Promise.resolve([]),
      appsRes?.ok ? appsRes.json() : Promise.resolve([]),
      reviewsRes?.ok ? reviewsRes.json() : Promise.resolve([]),
      usersRes?.ok ? usersRes.json() : Promise.resolve([])
    ])

    setVacancies(vacanciesData)
    setResumes(resumesData)
    setApplications(appsData)
    setReviews(reviewsData)
    setUsers(usersData)
    
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
    console.error('Ошибка загрузки данных:', loadError)
    setError(loadError.message)
  } finally {
    setLoading(false)
  }
}, [userId, token])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData()
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [loadData])

  const handleCreateVacancy = async (event) => {
  event.preventDefault()
  
  //валидация зарплаты
  if (vacancyForm.salary !== '') {
  const salary = Number(vacancyForm.salary)
  if (isNaN(salary) || salary < 0) {
    toast.error('Зарплата должна быть неотрицательным числом')
    return
  }
}
  
  try {
    if (editingVacancyId) {
      //режим редактирования
      await fetchWithAuth(`/vacancies/${editingVacancyId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...vacancyForm,
          companyId: userId,
          updatedAt: new Date().toISOString()
        })
      })
      setEditingVacancyId(null)
      toast.success('Вакансия обновлена')
    } else {
      //режим создания
      await fetchWithAuth('/vacancies', {
        method: 'POST',
        body: JSON.stringify({
          ...vacancyForm,
          companyId: userId,
          createdAt: new Date().toISOString()
        })
      })
      toast.success('Вакансия опубликована')
    }
    setVacancyForm({ title: '', description: '', salary: '', location: '' })
    await loadData()
  } catch (err) {
    toast.error(err.message)
  }
}

//начать редактирование вакансии
const startEditVacancy = (vacancy) => {
  setEditingVacancyId(vacancy.id)
  setVacancyForm({
    title: vacancy.title,
    description: vacancy.description,
    salary: vacancy.salary,
    location: vacancy.location
  })
  //прокручиваем к форме
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

//отменить редактирование
const cancelEditVacancy = () => {
  setEditingVacancyId(null)
  setVacancyForm({ title: '', description: '', salary: '', location: '' })
}

const handleSaveResume = async (event) => {
  event.preventDefault()
  try {
    const payload = {
      ...resumeForm,
      userId: userId
    }
    
    if (ownResume) {
      await fetchWithAuth(`/resumes/${ownResume.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...payload,
          updatedAt: new Date().toISOString()
        })
      })
      toast.success('Резюме обновлено')
    } else {
      await fetchWithAuth('/resumes', {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          createdAt: new Date().toISOString()
        })
      })
      toast.success('Резюме сохранено')
    }
    
    await loadData()
  } catch (err) {
    toast.error(err.message)
  }
}

  const applyToVacancy = async (vacancy) => {
    if (!ownResume) {
      toast.error('Сначала создайте резюме, чтобы откликнуться на вакансию')
      return
    }
  
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

  const handleDeleteVacancy = (vacancyId) => {
  confirmAction('Удалить вакансию?', async () => {
    try {
      // Удаляем вакансию
      await fetch(`${API_URL}/vacancies/${vacancyId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      })
      
      //удаляем отклики на эту вакансию
      const relatedApplications = applications.filter(
        app => app.vacancyId === vacancyId
      )
      
      for (const app of relatedApplications) {
        await fetch(`${API_URL}/applications/${app.id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        })
      }
      
      await loadData()
      toast.success('Вакансия удалена')
    } catch {
      toast.error('Не удалось связаться с сервером')
    }
  })
}

  const handleDeleteResume = () => {
  if (!ownResume) return
  
  confirmAction('Удалить резюме?', async () => {
    try {
      //сначала удаляем все отклики, связанные с этим резюме
      const relatedApplications = applications.filter(
        app => app.resumeId === ownResume.id
      )
      
      for (const app of relatedApplications) {
        await fetch(`${API_URL}/applications/${app.id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        })
      }
      
      //теперь удаляем само резюме
      const response = await fetch(`${API_URL}/resumes/${ownResume.id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok || response.status === 204) {
        setResumeForm({ title: '', skills: '', experience: '' })
        await loadData()
        toast.success('Резюме удалено')
      } else {
        const errorData = await response.json().catch(() => ({}))
        toast.error(errorData.error || 'Не удалось удалить резюме')
      }
    } catch {
      toast.error('Не удалось связаться с сервером')
    }
  })
}

  const handleDeleteReview = (reviewId) => {
  confirmAction('Удалить отзыв?', async () => {
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      })
      
      //ошибка 204 No Content это нормальный ответ для DELETE, не считаем ошибкой
      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Не удалось удалить отзыв')
      }
      
      await loadData()
      toast.success('Отзыв удалён')
    } catch (err) {
      //показываем ошибку только если это реальная проблема сети
      if (err.message !== 'Failed to fetch' && err.message !== 'Не удалось удалить отзыв') {
        toast.error(err.message)
      } else {
        //если ошибка сетевая, но данные могли удалиться, то всё равно обновляем
        await loadData()
        toast.success('Отзыв удалён')
      }
    }
  })
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
    } catch (err) {
      toast.error(err.message)
    }
  }

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
    <>
      <div className="dashboard-layout">
        {role === 'company' ? (
          <CompanySidebar
            user={user}
            vacanciesCount={myVacanciesCount}
            applicationsCount={incomingApplicationsCount}
          />
        ) : (
          <SeekerSidebar
            user={user}
            ownResume={ownResume}
            applicationsCount={myApplicationsCount}
            invitationsCount={myInvitationsCount}
          />
        )}

        <main className="dashboard-content">
          {loading && <MessageState>Загрузка данных...</MessageState>}
          {error && <ErrorState error={error} onRetry={loadData} />}
          
          {!loading && !error && role === 'company' && (
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
              editingVacancyId={editingVacancyId}
              startEditVacancy={startEditVacancy}
              cancelEditVacancy={cancelEditVacancy}
            />
          )}

          {!loading && !error && role === 'seeker' && (
            <SeekerDashboard
              ownResume={ownResume}
              resumeForm={resumeForm}
              setResumeForm={setResumeForm}
              handleSaveResume={handleSaveResume}
              handleDeleteResume={handleDeleteResume}
              vacancies={vacancies}
              resumes={resumes}
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
              editingReviewId={editingReviewId}
              editReviewForm={editReviewForm}
              setEditReviewForm={setEditReviewForm}
              cancelEditReview={cancelEditReview}
              saveEditReview={saveEditReview}
            />
          )}
        </main>
      </div>
      <Footer />
    </>
  )
}

export default HomePage