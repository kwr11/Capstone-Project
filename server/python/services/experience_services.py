from db.db import get_conn, put_conn
from psycopg2.extras import RealDictCursor


def get_languages_by_student(student_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                    SELECT e.id, e.name
                    FROM experiences e
                    JOIN students_experiences se
                    ON se.student_id = %s AND se.experience_id = e.id
                    WHERE e.type = 'language';
                """,
                (student_id,),
            )
            results = cur.fetchall()

        return results
    finally:
        put_conn(conn)


def get_frameworks_by_student(student_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                    SELECT e.id, e.name
                    FROM experiences e
                    JOIN students_experiences se
                    ON se.student_id = %s AND se.experience_id = e.id
                    WHERE e.type = 'framework';
                """,
                (student_id,),
            )
            results = cur.fetchall()

        return results
    finally:
        put_conn(conn)
