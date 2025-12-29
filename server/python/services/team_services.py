from typing import Any, cast
from psycopg2.extras import RealDictCursor, RealDictRow
from classes import Team
from db.db import get_conn, put_conn
from extensions import ForbiddenException
from .student_services import _fill_student_children
from .comment_services import get_comments_by_team
from psycopg2.extensions import connection
from services import label_services


def _fill_team_children(team: RealDictRow | None) -> None:
    """Get all children of teams

    Args:
      team (dict[str, Any]): The team dict returned by the RealDictCursor
    """
    if not team:
        return

    team["comments"] = get_comments_by_team(team["id"]) or []
    team["labels"] = label_services.get_team_labels(team["id"]) or []
    team["students"] = get_students_by_team(team["id"])


def create_team(course_id: int, name: str, conn=None) -> Team:
    use_conn: connection = conn or get_conn()

    try:
        with use_conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO teams (name, course_id)
                VALUES (%s, %s)
                RETURNING *;
                """,
                (name, course_id),
            )
            result = cur.fetchone()

            if result:
                result["comments"] = []
                result["labels"] = []
                result["students"] = []

            use_conn.commit()
            return cast(Team, result)
    except Exception as e:
        use_conn.rollback()
        raise e
    finally:
        if not conn:
            put_conn(use_conn)


def get_teams_by_course(course_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT *
                FROM teams
                WHERE course_id = %s;
                """,
                (course_id,),
            )
            results = cur.fetchall()

            for team in results:
                _fill_team_children(team)

        return cast(list[Team], results)
    finally:
        put_conn(conn)


def get_team_by_id(team_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT *
                FROM teams
                WHERE id = %s;
                """,
                (team_id,),
            )
            result = cur.fetchone()

            if result:
                _fill_team_children(result)

        return cast(Team | None, result)
    finally:
        put_conn(conn)


def update_team(team_id: int, data: dict[str, Any]) -> Team | None:
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

        values.append(team_id)
        query = f"""
            UPDATE teams
            SET {", ".join(fields)} 
            WHERE id = %s
            RETURNING *;
        """

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, values)
            result = cur.fetchone()

            _fill_team_children(result)

            conn.commit()
            return result
    finally:
        put_conn(conn)


def delete_team(team_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                DELETE FROM teams
                WHERE id = %s;
                """,
                (team_id,),
            )
            conn.commit()
    finally:
        put_conn(conn)


def batch_delete_teams(course_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT id FROM teams
                WHERE course_id = %s;
                """,
                (course_id,)
            )
            results = cur.fetchall()

            for res in results:
                cur.execute(
                    """
                    DELETE FROM teams
                    WHERE id = %s;
                    """,
                    (res["id"],),
                )

            conn.commit()
    finally:
        put_conn(conn)


def get_students_by_team(team_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT st.*, se.course_id AS course_id
                FROM students st
                JOIN sections se
                ON se.id = st.section_id
                WHERE team_id = %s;
                """,
                (team_id,),
            )
            results = cur.fetchall()

        for student in results:
            _fill_student_children(student)

        return cast(list[Team], results)
    finally:
        put_conn(conn)


def check_team_is_owned(team_id: int, user_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT owner_id FROM courses c 
                INNER JOIN teams t 
                ON t.course_id = c.id 
                WHERE t.id = %s;
                """,
                (team_id,)
            )
            res = cur.fetchone()

            if res.get("owner_id", -1) != user_id:
                raise ForbiddenException()
    finally:
        put_conn(conn)
