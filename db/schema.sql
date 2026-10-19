-- Схема базы данных проекта (PostgreSQL)
-- Запуск: psql -U postgres -d examination -f db/schema.sql

BEGIN;

DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
DROP TABLE IF EXISTS vacancies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Пользователи (соискатели и компании). password хранит bcrypt-хеш, как в json-server-auth
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    password   TEXT NOT NULL,               -- bcrypt hash
    name       TEXT NOT NULL,
    role       TEXT NOT NULL DEFAULT 'seeker'
               CHECK (role IN ('seeker', 'company'))
);

-- Вакансии
CREATE TABLE vacancies (
    id          BIGSERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    salary      TEXT,
    location    TEXT,
    company_id  BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ,
    updated_at  TIMESTAMPTZ
);

-- Резюме
CREATE TABLE resumes (
    id          BIGSERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    skills      TEXT,
    experience  TEXT,
    user_id     BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ,
    updated_at  TIMESTAMPTZ
);

-- Отклики на вакансии и приглашения компаний к соискателям
CREATE TABLE applications (
    id           BIGSERIAL PRIMARY KEY,
    type         TEXT NOT NULL DEFAULT 'vacancy_application'
                 CHECK (type IN ('vacancy_application', 'resume_invite')),
    seeker_id    BIGINT REFERENCES users (id) ON DELETE CASCADE,
    vacancy_id   BIGINT REFERENCES vacancies (id) ON DELETE CASCADE,
    resume_id    BIGINT REFERENCES resumes (id) ON DELETE CASCADE,
    company_id   BIGINT REFERENCES users (id) ON DELETE CASCADE,
    status       TEXT NOT NULL DEFAULT 'new',
    message      TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Отзывы о компаниях
CREATE TABLE reviews (
    id          BIGSERIAL PRIMARY KEY,
    company_id  BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    author_id   BIGINT REFERENCES users (id) ON DELETE SET NULL,
    user_id     BIGINT REFERENCES users (id) ON DELETE SET NULL,
    rating      INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text        TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vacancies_company   ON vacancies (company_id);
CREATE INDEX idx_resumes_user        ON resumes (user_id);
CREATE INDEX idx_applications_seeker ON applications (seeker_id);
CREATE INDEX idx_applications_vac    ON applications (vacancy_id);
CREATE INDEX idx_reviews_company     ON reviews (company_id);

COMMIT;
