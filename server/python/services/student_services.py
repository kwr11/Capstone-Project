from typing import Any, cast
from psycopg2.extensions import connection
from psycopg2.extras import RealDictCursor, RealDictRow
from classes import Student
from db.db import get_conn, put_conn
from extensions import BadRequestException, ForbiddenException
from services import experience_services, label_services, comment_services


def _fill_student_children(student: RealDictRow | None) -> None:
    """Get all children of students

    Args:
      student (dict[str, Any]): The student dict returned by the RealDictCursor
    """
    if not student:
        return

    student["work_with"] = student.get("work_with", []) or []
    student["dont_work_with"] = student.get("dont_work_with", []) or []
    student["labels"] = label_services.get_student_labels(student["id"]) or []
    student["comments"] = comment_services.get_comments_by_student(student["id"]) or []
    student["languages"] = experience_services.get_languages_by_student(student["id"])
    student["frameworks"] = experience_services.get_frameworks_by_student(student["id"])


def create_student(section_id: int, data: dict[str, Any]) -> Student:
    conn = get_conn()

    fields = ["section_id"]
    values = [section_id]

    allowed_keys = {
        "name",
        "email",
        "major",
    }

    for key, val in data.items():
        if key in allowed_keys:
            fields.append(key)
            values.append(val)

    if len(fields) == 1:
        raise BadRequestException()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query = f"""
                INSERT INTO students ({", ".join(fields)})
                VALUES ({", ".join(["%s"] * len(fields))})
                RETURNING *
            """

            cur.execute(query, values)
            result = cur.fetchone()

            if result:
                _fill_student_children(result)

        conn.commit()

        return cast(Student, result)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        put_conn(conn)


def get_students_by_section(section_id: int) -> list[Student]:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT st.*, c.id AS course_id
                FROM students st
                JOIN sections se
                ON   se.id = st.section_id
                JOIN courses c
                ON   c.id = se.course_id
                WHERE section_id = %s;
                """,
                (section_id,),
            )
            results = cur.fetchall()

        for student in results:
            _fill_student_children(student)

        return cast(list[Student], results)
    finally:
        put_conn(conn)


def get_student_by_id(student_id: int) -> Student | None:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT *
                FROM students
                WHERE id = %s;
                """,
                (student_id,),
            )
            result = cur.fetchone()

        _fill_student_children(result)

        return cast(Student | None, result)
    finally:
        put_conn(conn)


def update_student(
    student_id: int,
    data: dict[str, Any],
    conn: connection | None = None,
    cursor: RealDictCursor | None = None,
) -> Student:
    use_conn: connection = conn or get_conn()
    use_cursor: RealDictCursor = cursor or use_conn.cursor(
        cursor_factory=RealDictCursor
    )

    fields = []
    values = []

    allowed_keys = {
        "team_id",
        "name",
        "email",
        "major",
        "leadership",
        "expertise",
        "work_with",
        "dont_work_with",
    }

    for key, val in data.items():
        if key in allowed_keys:
            fields.append(f"{key} = %s")

            if key == "work_with" or key == "dont_work_with":
                values.append(f"{{{', '.join(val)}}}")
            else:
                values.append(val)

    if not fields and not any(
        key in data for key in ["labels", "languages", "frameworks"]
    ):
        raise BadRequestException()

    try:
        with use_cursor as cur:
            if fields:
                values.append(student_id)

                query = f"""
                    UPDATE students
                    SET {", ".join(fields)}
                    WHERE id = %s
                    RETURNING *;
                """

                cur.execute(query, values)
                result = cur.fetchone()
            else:
                cur.execute(
                    """
                    SELECT * FROM students
                    WHERE id = %s
                """,
                    (str(student_id),),
                )
                result = cur.fetchone()

            if "languages" in data or "frameworks" in data:
                cur.execute(
                    """
                    DELETE FROM students_experiences
                    WHERE student_id = %s;
                """,
                    (student_id,),
                )
                _update_languages(student_id, cur, data.get("languages", []))
                _update_frameworks(student_id, cur, data.get("frameworks", []))

        if not conn:
            use_conn.commit()

        _fill_student_children(result)

        return cast(Student, result)

    except Exception as e:
        use_conn.rollback()
        raise e
    finally:
        if not conn:
            put_conn(use_conn)


def bulk_update_students(section_id: int, data: list[dict[str, Any]]):
    conn = get_conn()
    changed = []

    try:
        for item in data:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id FROM students WHERE email = %s AND section_id = %s",
                    (item["email"], section_id),
                )
                student = cur.fetchone()

                if student is None:
                    continue

                changed.append(
                    update_student(student["id"], item, conn=conn, cursor=cur)
                )

        conn.commit()
        return changed
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        put_conn(conn)


def _update_languages(student_id: int, cur: RealDictCursor, languages: list[str]):
    for language in languages:
        cur.execute(
            """
            -- new_language is either an entity, or nothing
            WITH new_language AS (
              INSERT INTO experiences (name, type)
              VALUES (%s, 'language')
              ON CONFLICT (name)
              DO NOTHING
              RETURNING id
            ),
            -- always_id makes sure we have an ID value whether there was a conflict or not in the above statement
            always_id AS (
              SELECT id
              FROM new_language
              UNION ALL
              SELECT id
              FROM experiences
              WHERE name = %s AND type = 'language'
              LIMIT 1
            )
                    
            -- Insert/Select syntax. We insert the selected "id" from "always_id" and raw string, student_id passed in below.
            INSERT INTO students_experiences (experience_id, student_id)
            SELECT id, %s
            FROM always_id
            ON CONFLICT DO NOTHING;
            """,
            (language, language, student_id),
        )


def _update_frameworks(student_id: int, cur: RealDictCursor, frameworks: list[str]):
    for framework in frameworks:
        cur.execute(
            """
            -- new_framework is either an entity, or nothing
            WITH new_framework AS (
              INSERT INTO experiences (name, type)
              VALUES (%s, 'framework')
              ON CONFLICT (name)
              DO NOTHING
              RETURNING id
            ),
            -- always_id makes sure we have an ID value whether there was a conflict or not in the above statement
            always_id AS (
              SELECT id
              FROM new_framework
              UNION ALL
              SELECT id
              FROM experiences
              WHERE name = %s AND type = 'framework'
              LIMIT 1
            )
                    
            -- Insert/Select syntax. We insert the selected "id" from "always_id" and raw string, student_id passed in below.
            INSERT INTO students_experiences (experience_id, student_id)
            SELECT id, %s
            FROM always_id
            ON CONFLICT DO NOTHING;
            """,
            (framework, framework, student_id),
        )


def delete_student(student_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                DELETE FROM students
                WHERE id = %s;
                """,
                (student_id,),
            )
            conn.commit()
            return cur.rowcount
    finally:
        put_conn(conn)


def check_student_is_owned(student_id: int, user_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT owner_id FROM courses c 
                INNER JOIN sections s
                ON s.course_id = c.id 
                INNER JOIN students s2 
                ON s2.section_id = s.id 
                WHERE s2.id = %s;
                """,
                (student_id,),
            )
            res = cur.fetchone()

            if res.get("owner_id", -1) != user_id:
                raise ForbiddenException()
    finally:
        put_conn(conn)
