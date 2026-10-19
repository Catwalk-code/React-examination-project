-- Данные для PostgreSQL, перенесённые из db.json
-- Запуск: psql -U postgres -d examination -f db/seed.sql

BEGIN;

INSERT INTO users (id, email, password, name, role) VALUES
(1, 'ivanov@email.com', '$2a$10$mx7K1NAopBbdWKKRtqP94OyPz.uq2oQbNaibTqCp7lY4UfrsiLZEC', 'Иванов Иван Иванович', 'seeker'),
(2, 'example@example.com', '$2a$10$yLdtE9axtaDiPuGMe3zj3.wkc3AW1UiSNpEfoY8WF5ns9e6cCuYhC', 'Example', 'company'),
(3, 'techsolutionsinc@email.com', '$2a$10$Vimzmbjyk274o881kyoyjOP8U.030ubLWcJxipvfY2tK7DtkyTIgW', 'Techsolutions Inc.', 'company'),
(4, 'dataflowsystems@email.com', '$2a$10$Mgr6DQm8VY55mJ5XL7/hHuPSq6N8JuETeERcqSUPj3GSWXS3saFT6', 'Dataflow Systems', 'company'),
(5, 'greenglobal@email.com', '$2a$10$K8VVlPmk/diJ2fCbePcHc.c8JdX03tDSSFVnXRpcTACm.og8QscoG', 'Greenglobal', 'company'),
(6, 'gena@email.com', '$2a$10$CIEsfPU5afV7k6Q8JJnfQOAAkPn1djAg0HhFWPRUrWDmrEUP4VchG', 'Жирафов Геннадий Петрович', 'seeker'),
(7, 'empty@email.com', '$2a$10$3K9NHRiSO7tdUm47vYoyi.1BcaAeovgiRffMU83VN0AA/laFoidbm', 'Пустов Пуст Пустович', 'seeker'),
(8, 'freshdesign@email.com', '$2a$10$Lt1SqwYWcn2Qb1z5ziMUaOP9em8uMGW50Eghm56vE3SJOyWkbA43W', 'Fresh Design', 'company');
SELECT setval(pg_get_serial_sequence('users','id'), (SELECT MAX(id) FROM users));

INSERT INTO vacancies (id, title, description, salary, location, company_id, created_at, updated_at) VALUES
(2, 'Ведущий бэкенд-разработчик', 'Нужен опытный разработчик, который умеет создавать надежные и быстрые серверные системы и писать понятный код. Также важно, чтобы ты мог направлять команду, проверять работу коллег и принимать ключевые технические решения.', 'от 6500 ', 'Удаленно', 4, '2026-06-06T14:16:31.237Z', NULL),
(4, 'Senior Angular Developer', 'Требования: знать JS, Angular, HTML, CSS. Иметь 6 лет коммерческого опыта.', 'от 1200', 'Витебск', 2, NULL, '2026-06-07T13:43:33.834Z'),
(5, 'Junior Python Backend', 'Занание Python, FastAPI/Django, PostgreSQL, Docker, Алгоритмы Структур Данных, умение работать в Linux; Опыт работы: полгода.', 'от 1200', 'Витебск', 3, '2026-06-07T13:01:58.205Z', NULL),
(6, 'Middle Java Bacend', 'Maven, Java, PostgreSQL, Алгоритмы Структур Данных, умение работать в Linux; Опыт работы: полгода.', 'от 4000', 'Минск', 3, '2026-06-07T13:03:17.044Z', NULL),
(7, 'Специалист по маркетингу', 'Придумывать промо-ролики, флаеры, рекламы на билдборды;
Опыт работы: 1 год. ', 'от 1200', 'Гомель', 5, '2026-06-07T14:32:04.031Z', NULL),
(8, 'Старший продуктовый дизайнер', 'Ищем опытного дизайнера, который умеет создавать удобные интерфейсы, опираясь на исследования и реальные потребности пользователей. Также важно уметь вести проекты от идеи до запуска.', 'от 2500', 'Гомель', 3, '2026-06-07T14:33:49.904Z', NULL),
(9, 'Старший продуктовый дизайнер', 'Ищем опытного дизайнера, который умеет создавать удобные интерфейсы, опираясь на исследования и реальные потребности пользователей. Также важно уметь вести проекты от идеи до запуска.', 'от 2500', 'Гомель', 8, '2026-06-07T14:37:00.427Z', NULL),
(10, 'Senior React Developer', 'JS, React, HTML, CSS;
Опыт работы: 4 года.', '7000', 'Минск', 2, NULL, '2026-06-08T10:02:54.651Z');
SELECT setval(pg_get_serial_sequence('vacancies','id'), (SELECT COALESCE(MAX(id),1) FROM vacancies));

INSERT INTO resumes (id, title, skills, experience, user_id, created_at, updated_at) VALUES
(2, 'Senior Backend Developer', 'GO-lang, Java, JS, Python, C#', '6 лет', 6, '2026-06-07T13:11:41.708Z', '2026-06-07T13:11:41.708Z'),
(3, 'QA Trainee', 'JIRA, Java, JS, TypeScript, Техники тест-дизайна', 'пет-проекты, курсы', 1, '2026-06-07T14:17:07.989Z', '2026-06-07T20:15:57.424Z');
SELECT setval(pg_get_serial_sequence('resumes','id'), (SELECT COALESCE(MAX(id),1) FROM resumes));

-- applications: пусто в db.json

INSERT INTO reviews (id, company_id, author_id, user_id, rating, text, created_at) VALUES
(1, 4, 6, 6, 5, 'Прекрасные штат сотрудников. Здесь вы найдёте прекрасных коллег по работе. Все процессы настроены идеально.', '2026-06-07T13:13:27.254Z');
SELECT setval(pg_get_serial_sequence('reviews','id'), (SELECT COALESCE(MAX(id),1) FROM reviews));

COMMIT;
