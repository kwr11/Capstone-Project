from typing import cast
from psycopg2.extras import RealDictCursor, RealDictRow
from classes import Section
from db.db import get_conn, put_conn
from services import student_services


def _fill_section_children(section: RealDictRow | None) -> None:
    """Get all children of sections

    Args:
      section (dict[str, Any]): The section dict returned by the RealDictCursor
    """
    if not section:
        return

    section["students"] = student_services.get_students_by_section(
        section_id=section["id"]
    )


def create_section(course_id: int, name: str):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO sections (course_id, name)
                VALUES (%s, %s)
                RETURNING *;
                """,
                (course_id, name),
            )
            result = cur.fetchone()

            _fill_section_children(result)

            conn.commit()
            return result
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        put_conn(conn)


def get_sections_by_course(course_id: int):
    conn = get_conn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT s.*, c.name AS course_name
                FROM sections s
                JOIN courses c ON s.course_id = c.id
                WHERE c.id = %s
                ORDER BY s.id;
                """,
                (course_id,),
            )
            results = cur.fetchall()

            for section in results:
                _fill_section_children(section)

            return results

    finally:
        put_conn(conn)


def get_section_by_id(section_id: int) -> Section:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT s.*, c.name AS course_name
                FROM sections s
                JOIN courses c ON s.course_id = c.id
                WHERE s.id = %s
                ORDER BY s.id;
                """,
                (section_id,),
            )
            result = cur.fetchone()

            _fill_section_children(result)

            return cast(Section, result)

    finally:
        put_conn(conn)


def update_section(section_id: int, data: dict):
    conn = get_conn()
    try:
        fields = []
        values = []

        allowed_keys = {"name"}

        for key, val in data.items():
            if key in allowed_keys:
                fields.append(f"{key} = %s")
                values.append(val)
        if not fields:
            return None

        values.append(section_id)
        query = f"""
            UPDATE sections 
            SET {", ".join(fields)} 
            WHERE id = %s
            RETURNING *;
        """

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, values)
            result = cur.fetchone()

            _fill_section_children(result)

            conn.commit()
            return result
    finally:
        put_conn(conn)


def delete_section(section_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                DELETE FROM sections
                WHERE id = %s;
                """,
                (section_id,),
            )
            conn.commit()
            return cur.rowcount
    finally:
        put_conn(conn)
