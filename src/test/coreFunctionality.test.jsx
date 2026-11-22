import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CompanyDashboard } from '../pages/HomePage/CompanyDashboard'
import { SeekerDashboard, VacancyCard } from '../pages/HomePage/SeekerDashboard'

vi.mock('antd', () => ({
  Rate: ({ value, onChange }) => (
    <button type="button" onClick={() => onChange?.(5)}>
      {`Оценка ${value}`}
    </button>
  ),
}))

describe('placing vacancy orders and requesting candidate services', () => {
  function companyProps(overrides = {}) {
    return {
      userId: 1,
      vacancyForm: {
        title: 'Frontend Developer',
        location: 'Минск',
        salary: '2500',
        description: 'Разработка интерфейсов',
      },
      setVacancyForm: vi.fn(),
      handleCreateVacancy: vi.fn((event) => event.preventEvent?.()),
      handleDeleteVacancy: vi.fn(),
      vacancies: [],
      resumes: [],
      usersById: {},
      inviteCandidate: vi.fn(),
      incomingApplications: [],
      editingVacancyId: null,
      startEditVacancy: vi.fn(),
      cancelEditVacancy: vi.fn(),
      ...overrides,
    }
  }

  it('submits a complete vacancy publication form', async () => {
    const props = companyProps()

    render(<CompanyDashboard {...props} />)

    fireEvent.submit(screen.getByRole('button', { name: /Опубликовать/ }).closest('form'))

    expect(props.handleCreateVacancy).toHaveBeenCalledTimes(1)
  })

  it('sends a candidate invitation when the invitation action is used', async () => {
    const inviteCandidate = vi.fn()
    const resume = {
      id: 7,
      userId: 9,
      title: 'React Developer',
      skills: 'React, TypeScript',
    }

    render(
      <CompanyDashboard
        {...companyProps({
          resumes: [resume],
          usersById: { 9: { name: 'Иван Иванов' } },
          inviteCandidate,
        })}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Пригласить' }))

    expect(inviteCandidate).toHaveBeenCalledWith(resume)
  })

  it('allows applying for a vacancy and exposes application-related data', async () => {
    const vacancy = {
      id: 12,
      title: 'JavaScript Developer',
      location: 'Минск',
      salary: '3000',
      companyId: 3,
    }
    const onApply = vi.fn()

    render(<VacancyCard vacancy={vacancy} company={{ name: 'Catwalk' }} onApply={onApply} />)

    expect(screen.getByText('JavaScript Developer')).toBeInTheDocument()
    expect(screen.getByText('Catwalk')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Отклик' }))
    expect(onApply).toHaveBeenCalledWith(vacancy)
  })
})

describe('viewing reference information', () => {
  function seekerProps(overrides = {}) {
    return {
      ownResume: null,
      resumeForm: { title: '', skills: '', experience: '' },
      setResumeForm: vi.fn(),
      handleSaveResume: vi.fn(),
      handleDeleteResume: vi.fn(),
      vacancies: [],
      resumes: [],
      usersById: {},
      applyToVacancy: vi.fn(),
      applications: [],
      userId: 5,
      companyList: [],
      reviewForm: { companyId: '', rating: 5, text: '' },
      setReviewForm: vi.fn(),
      submitReview: vi.fn(),
      hasAppliedToCompany: vi.fn(() => false),
      reviews: [],
      editingReviewId: null,
      editReviewForm: { rating: 5, text: '' },
      setEditReviewForm: vi.fn(),
      cancelEditReview: vi.fn(),
      saveEditReview: vi.fn(),
      startEditReview: vi.fn(),
      handleDeleteReview: vi.fn(),
      ...overrides,
    }
  }

  it('shows empty reference states instead of misleading placeholders', () => {
    render(<SeekerDashboard {...seekerProps()} />)

    expect(screen.getByText('У вас пока нет откликов')).toBeInTheDocument()
    expect(screen.getByText('У вас пока нет приглашений')).toBeInTheDocument()
    expect(screen.getByText('Нет доступных компаний для отзыва')).toBeInTheDocument()
    expect(screen.getByText('Пока отзывов нет')).toBeInTheDocument()
  })

  it('renders available vacancies and company reviews as reference data', () => {
    render(
      <SeekerDashboard
        {...seekerProps({
          vacancies: [
            {
              id: 20,
              title: 'QA Engineer',
              location: 'Гродно',
              salary: 1800,
              companyId: 4,
            },
          ],
          usersById: { 4: { name: 'Quality Lab' } },
          companyList: [{ id: 4, name: 'Quality Lab' }],
          reviews: [
            {
              id: 30,
              authorId: 5,
              companyId: 4,
              text: 'Хорошая команда',
              rating: 5,
              createdAt: '2026-11-22T10:00:00.000Z',
            },
          ],
        })}
      />,
    )

    expect(screen.getByText('QA Engineer')).toBeInTheDocument()
    expect(screen.getAllByText('Quality Lab').length).toBeGreaterThan(0)
    expect(screen.getByText('"Хорошая команда"')).toBeInTheDocument()
  })
})
