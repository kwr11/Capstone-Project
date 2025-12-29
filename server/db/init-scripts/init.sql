--base tables--
CREATE TABLE IF NOT EXISTS courses (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id TEXT,
    name TEXT NOT NULL,
    code TEXT,
    term TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sections (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS teams (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    section_id INT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    team_id INT REFERENCES teams(id) ON DELETE SET NULL,
    name TEXT NOT NULL, 
    email TEXT,
    major TEXT,
    leadership INT CHECK (leadership IS NULL OR leadership BETWEEN 1 AND 10),
    expertise INT CHECK (expertise IS NULL OR expertise BETWEEN 1 AND 10),
    work_with TEXT[],
    dont_work_with TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    student_id INT REFERENCES students(id) ON DELETE CASCADE,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS labels (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    owner_id TEXT,
    color TEXT,
    name TEXT,
    UNIQUE(owner_id, name)
);

CREATE TABLE IF NOT EXISTS experiences (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT UNIQUE,
    type TEXT CHECK (TYPE IN ('language', 'framework'))
);

CREATE TABLE IF NOT EXISTS instructors (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT
);

--junction tables [MTM]--
CREATE TABLE IF NOT EXISTS teams_comments(
    team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    comment_id INT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    PRIMARY KEY(team_id, comment_id)
);

CREATE TABLE IF NOT EXISTS teams_labels(
    team_id INT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    label_id INT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY(team_id, label_id)
);

CREATE TABLE IF NOT EXISTS students_courses(
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    PRIMARY KEY(student_id, course_id)
);

CREATE TABLE IF NOT EXISTS student_labels(
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    label_id INT NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
    PRIMARY KEY(student_id, label_id)
);

CREATE TABLE IF NOT EXISTS students_experiences (
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    experience_id INT NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, experience_id)
);
CREATE TABLE IF NOT EXISTS students_comments (
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    comment_id INT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    PRIMARY KEY (student_id, comment_id)
);

--indexes--
CREATE UNIQUE INDEX section_email ON students (email, section_id);
CREATE UNIQUE INDEX team_name ON teams (name, course_id);

/*
references:

https://www.postgresql.org/docs/current/ddl-identity-columns.html
https://stackoverflow.com/questions/14141266/postgresql-foreign-key-on-delete-cascade
https://www.postgresql.org/docs/current/tutorial-fk.html
https://www.postgresql.org/docs/current/tutorial-join.html
https://www.postgresql.org/docs/current/indexes-unique.html
*/
