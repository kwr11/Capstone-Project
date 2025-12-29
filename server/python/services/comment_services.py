from typing import Any, cast
from psycopg2.extras import RealDictCursor, RealDictRow
from classes import Comment
from db.db import get_conn, put_conn
from extensions import BadRequestException


def create_team_comment(team_id: int, content: str) -> Comment:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO comments (content, team_id)
                VALUES (%s, %s)
                RETURNING *;
                """,
                (content, team_id),
            )
            result = cur.fetchone()
            cur.execute(
                """
                INSERT INTO teams_comments (team_id, comment_id)
                VALUES (%s, %s);
                """, 
                (team_id, result["id"]),
            )
            conn.commit()
            return cast(Comment, result)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        put_conn(conn)


def get_comments_by_team(team_id: int):
    conn = get_conn()
    comments: list[Comment] = []

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT c.*
                FROM comments c
                JOIN teams_comments tc ON c.id = tc.comment_id
                WHERE tc.team_id = %s;
                """,
                (team_id,),
            )
            results = cur.fetchall()

            for row in results:
                comments.append(cast(Comment, row))

            return comments
    except Exception as e:
        raise e
    finally:
        put_conn(conn)


def create_student_comment(student_id: int, content: str) -> Comment:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO comments (content, student_id)
                VALUES (%s, %s)
                RETURNING *;
                """,
                (content, student_id),
            )
            result = cur.fetchone()
            cur.execute(
                """
                INSERT INTO students_comments (student_id, comment_id)
                VALUES (%s, %s);
                """, 
                (student_id, result["id"]),
            )
            conn.commit()
            return cast(Comment, result)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        put_conn(conn)


def get_comments_by_student(student_id: int):
    conn = get_conn()
    comments: list[Comment] = []

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT c.*
                FROM comments c
                JOIN students_comments sc ON c.id = sc.comment_id
                WHERE sc.student_id = %s;
                """,
                (student_id,),
            )
            results = cur.fetchall()

            for row in results:
                comments.append(cast(Comment, row))

            return comments
    except Exception as e:
        raise e
    finally:
        put_conn(conn)


def update_comment(comment_id: int, content: str) -> Comment | None:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                UPDATE comments
                SET content = %s
                WHERE id = %s
                RETURNING *;
                """,
                (content, comment_id),
            )
            result = cur.fetchone()
            conn.commit()
            return cast(Comment, result)
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        put_conn(conn)

def delete_comment(comment_id: int) -> None:
    conn = get_conn()

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                DELETE FROM comments
                WHERE id = %s;
                """,
                (comment_id,),
            )
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        put_conn(conn)
