import { Rate } from 'antd'
import CurrencySymbol from "../../components/CurrencySymbol/CurrencySymbol";

//компонент действий с отзывом (редактирование/удаление)
function ReviewActions({ review, onEdit, onDelete }) {
  return (
    <div className="review-actions">
      <button 
        className="btn-sm btn-outline"
        onClick={() => onEdit(review)}
      >
        <span className="material-symbols-outlined">edit</span>
      </button>
      <button 
        className="btn-sm btn-danger"
        onClick={() => onDelete(review.id)}
      >
        <span className="material-symbols-outlined">delete</span>
      </button>
    </div>
  )
}

//карточка приглашения от компании (показывает должность из резюме)
function InvitationCard({resume, company }) {
  return (
    <div className="application-card">
      <div className="application-card-icon application-card-icon--invite">
        {resume?.title?.charAt(0) || company?.name?.charAt(0) || '?'}
      </div>
      <div className="application-card-content">
        <h4 className="application-card-title">
          {resume?.title || 'Должность не указана'}
        </h4>
        <p className="application-card-subtitle">
          Приглашение от {company?.name || 'Компании'}
        </p>
      </div>
      <span className="status-badge status-badge--interview">Интервью</span>
      <button className="icon-button">
        <span className="material-symbols-outlined">more_vert</span>
      </button>
    </div>
  )
}

//карточка отклика со статусом
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
          {company?.name || 'Компания'} | Отклик отправлен
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
  
  <div className="vacancy-card-info">
    <h3 className="vacancy-card-title">{vacancy.title}</h3>
    <p className="vacancy-card-company">{company?.name || 'Компания'}</p>
  </div>
  
  <div className="vacancy-card-tags">
    <span className="vacancy-tag">{vacancy.location || 'Не указано'}</span>
    <span className="vacancy-tag vacancy-tag--salary">
      {vacancy.salary ? (
        <>
          {vacancy.salary} <CurrencySymbol />
        </>
      ) : (
        'з/п не указана'
      )}
    </span>
  </div>
  <button className="btn-outline btn-full" onClick={() => onApply(vacancy)}>
    Cделать отклик
  </button>
</div>
  )
}

export function SeekerDashboard({
  ownResume,
  resumeForm,
  setResumeForm,
  handleSaveResume,
  handleDeleteResume,
  vacancies,
  resumes,
  usersById,
  applyToVacancy,
  applications,
  userId,
  companyList,
  reviewForm,
  setReviewForm,
  submitReview,
  hasAppliedToCompany,
  reviews,
  editingReviewId,
  editReviewForm,
  setEditReviewForm,
  cancelEditReview,
  saveEditReview,
  startEditReview,
  handleDeleteReview 
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
              <button type="submit" className="btn-primary--home-page">
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

        {/*отклики*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Мои отклики</h2>
            <span className="section-count">{myApplications.length}</span>
          </div>
          
          {myApplications.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined">inbox</span>
              <p>У вас пока нет откликов</p>
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
            </div>
          )}
        </section>

        {/*приглашения*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Приглашения от компаний</h2>
            <span className="section-count">{myInvitations.length}</span>
          </div>
          
          {myInvitations.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined">mail</span>
              <p>У вас пока нет приглашений</p>
            </div>
          ) : (
            <div className="applications-list">
              {myInvitations.map((app) => (
                <InvitationCard
                  key={app.id}
                  application={app}
                  resume={resumes.find((r) => r.id === app.resumeId)}
                  company={usersById[app.companyId]}
                />
              ))}
            </div>
          )}
        </section>

        {/*список вакансий для клиента*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Список всех вакансий</h2>
          </div>
          <div className="vacancies-grid">
            {vacancies.map((vacancy) => (
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
                      <button type="submit" className="btn-primary--home-page btn-full">
                        Опубликовать отзыв
                      </button>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </section>

        {/*отзывы*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">Отзывы о компаниях</h2>
          </div>
          {reviews.length === 0 ? (
            <div className="empty-state">
              <p>Пока отзывов нет</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.slice(0, 3).map((review) => (
                <article key={review.id} className="review-card">
                  {editingReviewId === review.id ? (
                    /*форма редактирования на месте отзыва*/
                    <div className="review-edit-form">
                      <div className="review-edit-header">
                        <h3>Редактирование отзыва</h3>
                        <button 
                          onClick={cancelEditReview} 
                          className="icon-button"
                        >
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
                        <button onClick={() => saveEditReview(review.id)} className="btn-primary--home-page">
                          Сохранить
                        </button>
                        <button onClick={cancelEditReview} className="btn-outline--reviews">
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    /*обычное отображение отзыва*/
                    <>
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
                          onEdit={startEditReview}
                          onDelete={handleDeleteReview}
                        />
                        )}
                      </div>
                    </>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}