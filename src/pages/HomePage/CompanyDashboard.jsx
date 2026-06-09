import CurrencySymbol from "../../components/CurrencySymbol/CurrencySymbol";

export function CompanyDashboard({
  userId,
  vacancyForm,
  setVacancyForm,
  handleCreateVacancy,
  handleDeleteVacancy,
  vacancies,
  resumes,
  usersById,
  inviteCandidate,
  incomingApplications,
  editingVacancyId,
  startEditVacancy,
  cancelEditVacancy
}) {
  const myVacancies = vacancies.filter((v) => v.companyId === userId)

  return (
    <div className="dashboard-grid">
      <div className="dashboard-main">
        {/*форма создания/редактирования вакансии*/}
        <section className="dashboard-section">
          <div className="section-header">
            <h2 className="section-title">
              {editingVacancyId ? 'Редактировать вакансию' : 'Разместить вакансию'}
            </h2>
            <span className="material-symbols-outlined text-primary">
              {editingVacancyId ? 'edit' : 'add_circle'}
            </span>
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
              type="number"
              min="0"
              placeholder="Зарплата (необязательно)"
              value={vacancyForm.salary}
              onChange={(e) => {
              const value = e.target.value.trim()
              
              if (value === '' || (Number(value) > 0 && !isNaN(Number(value)))) {
                setVacancyForm((prev) => ({ ...prev, salary: value }))
              }
            }}
              onWheel={(e) => e.target.blur()}
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
            <div className="form-actions">
              <button type="submit" className="btn-primary--home-page">
                <span className="material-symbols-outlined">
                  {editingVacancyId ? 'save' : 'publish'}
                </span>
                {editingVacancyId ? 'Сохранить изменения' : 'Опубликовать'}
              </button>
              {editingVacancyId && (
                <button
                  type="button"
                  onClick={cancelEditVacancy}
                  className="btn-outline--reviews"
                >
                  Отмена
                </button>
              )}
            </div>
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
                {vacancy.salary ? (
                <>
                  {vacancy.salary} <CurrencySymbol />
                </>
                ) : (
                  'з/п не указана'
                )}
                </div>
            </div>
            <div className="list-item-actions">
              <button
                onClick={() => startEditVacancy(vacancy)}
                className="btn-outline btn-sm"
                title="Редактировать"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
              <button
                onClick={() => handleDeleteVacancy(vacancy.id)}
                className="btn-danger btn-sm"
                title="Удалить"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
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
                className="btn-primary--home-page btn-sm"
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