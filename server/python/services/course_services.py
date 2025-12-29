from typing import cast
from psycopg2.extras import RealDictCursor, RealDictRow
from classes import Course
from db.db import get_conn, put_conn
from services import section_services, team_services


def _fill_course_children(course: RealDictRow | None) -> None:
    """Get all children of courses

    Args:
      course (dict[str, Any]): The course dict returned by the RealDictCursor
    """
    if not course:
        return
    course["sections"] = section_services.get_sections_by_course(
        course_id=course.get("id", -1)
    )
    course["teams"] = team_services.get_teams_by_course(course_id=course.get("id", -1))


def create_course(
    owner_id: str, name: str, code: str | None, term: str | None
) -> Course:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO courses (owner_id, name, code, term)
                VALUES (%s, %s, %s, %s)
                RETURNING *;
                """,
                (owner_id, name, code, term),
            )
            result = cur.fetchone()
            conn.commit()

            _fill_course_children(result)

            return cast(Course, result)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        put_conn(conn)


def get_courses(owner_id: int) -> list[Course]:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT *
                FROM courses
                WHERE owner_id = %s
                ORDER BY id;
                """,
                (owner_id,),
            )
            results = cur.fetchall()

        for course in results:
            _fill_course_children(course)

        return cast(list[Course], results)
    finally:
        put_conn(conn)


def get_course_by_id(course_id: int) -> Course | None:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT *
                FROM courses
                WHERE id = %s;
                """,
                (course_id,),
            )
            result = cur.fetchone()

            _fill_course_children(result)

            return cast(Course | None, result)
    finally:
        put_conn(conn)


def update_course(course_id: int, data: dict) -> Course | None:
    conn = get_conn()

    try:
        fields = []
        values = []

        allowed_keys = {"name", "code", "term"}

        for key, val in data.items():
            if key in allowed_keys:
                fields.append(f"{key} = %s")
                values.append(val)
        if not fields:
            return None

        values.append(course_id)
        query = f"""
            UPDATE courses 
            SET {", ".join(fields)}
            WHERE id = %s
            RETURNING *;
        """

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, values)
            result = cur.fetchone()

            _fill_course_children(result)

            conn.commit()
            return cast(Course | None, result)
    finally:
        put_conn(conn)


def delete_course(course_id: int) -> int:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                DELETE FROM courses
                WHERE id = %s;
                """,
                (course_id,),
            )
            conn.commit()
            return cur.rowcount
    finally:
        put_conn(conn)


"""references:
https://www.psycopg.org/docs/usage.html
https://www.psycopg.org/docs/usage.html#the-problem-with-the-query-parameters
https://www.psycopg.org/docs/connection.html
https://www.psycopg.org/docs/pool.html
https://www.psycopg.org/docs/extras.html
https://stackoverflow.com/questions/7323782/how-to-join-entries-in-a-set-into-one-string
"""
