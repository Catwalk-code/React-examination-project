CREATE TABLE IF NOT EXISTS users (
	id serial PRIMARY KEY,
	email varchar(255) NOT NULL UNIQUE,
	passhash varchar(255) NOT NULL,
	role varchar(20) NOT NULL CHECK (role IN ('applicant', 'company', 'admin')),
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS companies (
	id serial PRIMARY KEY,
	user_id integer NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
	name text NOT NULL UNIQUE,
	description text,
	website text,
	address text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS applicants (
	id serial PRIMARY KEY,
	user_id integer NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
	first_name varchar(128) NOT NULL,
	last_name varchar(128) NOT NULL,
	phone varchar(32) NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS resumes (
	id serial PRIMARY KEY,
	applicant_id integer NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
	is_primary boolean NOT NULL DEFAULT false,
	title text NOT NULL,
	skills text NOT NULL,
	experience text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS vacancies (
	id serial PRIMARY KEY,
	company_id integer NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
	title varchar(64) NOT NULL,
	description text NOT NULL,
	salary numrange NOT NULL,
	location text NOT NULL,
	is_remote boolean NOT NULL DEFAULT false,
	is_active boolean NOT NULL DEFAULT true,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS responses (
	id serial PRIMARY KEY,
	vacancy_id integer NOT NULL REFERENCES vacancies(id) ON DELETE CASCADE,
	applicant_id integer NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
	resume_id integer NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
	status varchar(32) NOT NULL DEFAULT 'new' 
		CHECK (status IN ('new', 'viewed', 'interview', 'rejected', 'withdrawn', 'hired')),
	cover_letter text,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT uniq_response_per_vacancy UNIQUE (vacancy_id, applicant_id)
);


CREATE TABLE IF NOT EXISTS reviews (
	id serial PRIMARY KEY,
	company_id integer NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
	seeker_id integer NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
	rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
	comment text NOT NULL,
	created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT uniq_review_per_company UNIQUE (company_id, seeker_id)
);
