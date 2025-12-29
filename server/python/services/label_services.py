from psycopg2.extras import RealDictCursor
from db.db import get_conn, put_conn

def create_label(owner_id: str, name: str, color: str) -> dict:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO labels (owner_id, name, color)
                VALUES (%s, %s, %s)
                RETURNING *;
                """,
                (owner_id, name, color),
            )
            result = cur.fetchone()
            conn.commit()
            return result
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        put_conn(conn)


def get_labels(owner_id: str) -> list[dict]:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT *
                FROM labels
                WHERE owner_id = %s
                ORDER BY id;
                """,
                (owner_id,),
            )
            results = cur.fetchall()
            return results
    finally:
        put_conn(conn)


def get_label_by_id(label_id: int) -> dict | None:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT *
                FROM labels
                WHERE id = %s;
                """,
                (label_id,),
            )
            result = cur.fetchone()
            return result
    finally:
        put_conn(conn)


def update_label(label_id: int, data: dict) -> dict | None:
    conn = get_conn()

    try:
        fields = []
        values = []

        allowed_keys = {"name", "color"}

        for key, val in data.items():
            if key in allowed_keys:
                fields.append(f"{key} = %s")
                values.append(val)

        if not fields:
            return None

        values.append(label_id)
        query = f"""
            UPDATE labels
            SET {", ".join(fields)}
            WHERE id = %s
            RETURNING *;
        """

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, values)
            result = cur.fetchone()
            conn.commit()
            return result
    finally:
        put_conn(conn)


def delete_label(label_id: int) -> int:
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                DELETE FROM labels
                WHERE id = %s;
                """,
                (label_id,),
            )
            conn.commit()
            return cur.rowcount
    finally:
        put_conn(conn)


def get_student_labels(student_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT l.*
                FROM labels l 
                INNER JOIN student_labels sl
                ON sl.label_id = l.id
                WHERE sl.student_id = %s
                """,
                (student_id,)
            )
            return cur.fetchall()
    finally:
        put_conn(conn)


def get_team_labels(team_id: int):
    conn = get_conn()

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT l.*
                FROM labels l 
                INNER JOIN teams_labels tl
                ON tl.label_id = l.id
                WHERE tl.team_id = %s
                """,
                (team_id,)
            )
            return cur.fetchall()
    finally:
        put_conn(conn)


def assign_student_labels(label_ids: list[int], student_id: int) -> list[dict]:
    conn = get_conn()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            """
            SELECT l.id AS label_id
            FROM students s 
            INNER JOIN student_labels sl
            ON s.id = sl.student_id 
            INNER JOIN labels l 
            ON sl.label_id = l.id 
            WHERE sl.student_id = %s
            """,
            (student_id,)
        )

        results = cursor.fetchall()

        existing_labels = [res.get("label_id") for res in results]
        labels_to_add = [
            l_id for l_id in label_ids
            if l_id not in existing_labels
        ]
        labels_to_remove = [
            l_id for l_id in existing_labels
            if not l_id in label_ids
        ]

        for l_id in labels_to_add:
            cursor.execute(
                """
                INSERT INTO student_labels 
                VALUES (%s, %s)
                """,
                (student_id, l_id)
            )
        for l_id in labels_to_remove:
            cursor.execute(
                """
                DELETE FROM student_labels 
                WHERE student_id = %s
                AND label_id = %s
                """,
                (student_id, l_id)
            )

        conn.commit()

        cursor.execute(
            """
            SELECT l.id AS label_id
            FROM students s 
            INNER JOIN student_labels sl
            ON s.id = sl.student_id 
            INNER JOIN labels l 
            ON sl.label_id = l.id 
            WHERE sl.student_id = %s
            """,
            (student_id,)
        )

        return cursor.fetchall()
    finally:
        cursor.close()
        put_conn(conn)


def assign_team_labels(label_ids: list[int], team_id: int) -> list[dict]:
    conn = get_conn()
    cursor = conn.cursor(cursor_factory=RealDictCursor)

    try:
        cursor.execute(
            """
            SELECT l.id AS label_id
            FROM teams t
            INNER JOIN teams_labels tl
            ON t.id = tl.team_id 
            INNER JOIN labels l 
            ON tl.label_id = l.id 
            WHERE tl.team_id = %s
            """,
            (team_id,)
        )

        results = cursor.fetchall()

        existing_labels = [res.get("label_id") for res in results]
        labels_to_add = [
            l_id for l_id in label_ids
            if l_id not in existing_labels
        ]
        labels_to_remove = [
            l_id for l_id in existing_labels
            if not l_id in label_ids
        ]

        for l_id in labels_to_add:
            cursor.execute(
                """
                INSERT INTO teams_labels 
                VALUES (%s, %s)
                """,
                (team_id, l_id)
            )
        for l_id in labels_to_remove:
            cursor.execute(
                """
                DELETE FROM teams_labels 
                WHERE team_id = %s
                AND label_id = %s
                """,
                (team_id, l_id)
            )

        conn.commit()

        cursor.execute(
            """
            SELECT l.id AS label_id
            FROM teams t
            INNER JOIN teams_labels tl
            ON t.id = tl.team_id 
            INNER JOIN labels l 
            ON tl.label_id = l.id 
            WHERE tl.team_id = %s
            """,
            (team_id,)
        )

        return cursor.fetchall()
    finally:
        cursor.close()
        put_conn(conn)

def get_labels_by_team(team_id: int) -> list[dict]:
    conn = get_conn()
    labels: list[dict] = []

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT l.*
                FROM labels l
                JOIN teams_labels tl ON l.id = tl.label_id
                WHERE tl.team_id = %s;
                """,
                (team_id,),
            )
            results = cur.fetchall()
            return labels
    except Exception as e:
        raise e
    finally:
        put_conn(conn)