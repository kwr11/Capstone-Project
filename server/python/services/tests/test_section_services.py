import psycopg2.errors
import pytest
from unittest.mock import patch, MagicMock, ANY
from services.section_services import *


class TestCreateSection:
    def setup_method(self):
        self.course_id = 1
        self.name = "Section A"

    @patch("services.section_services.put_conn")
    @patch("services.section_services.get_conn")
    def test_create_section_fail(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()

        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.execute.side_effect = psycopg2.errors.ForeignKeyViolation(
            "insert on table 'sections' violates foreign key constraint"
        )

        with pytest.raises(psycopg2.errors.ForeignKeyViolation):
            create_section(
                course_id=2,  # Assuming this course_id does not exist
                name=self.name,
            )
        mock_conn.rollback.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_put_conn.reset_mock()

    @patch("services.section_services.put_conn")
    @patch("services.section_services.get_conn")
    def test_create_section_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_res = {
            "id": 1,
            "course_id": self.course_id,
            "name": self.name,
            "students": [],
        }

        mock_cursor.fetchone.return_value = expected_res

        result = create_section(
            course_id=self.course_id,
            name=self.name,
        )

        mock_cursor.execute.assert_called_once_with(
            ANY, (self.course_id, self.name)
        )

        (sql,) = mock_cursor.execute.call_args[0][:1]
        normalized_sql = " ".join(sql.split())
        assert "INSERT INTO sections (course_id, name) VALUES (%s, %s) RETURNING *;" in normalized_sql

        mock_cursor.fetchone.assert_called_once()
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)
        
        assert result == expected_res


class TestGetSectionsByCourse:
    @patch("services.section_services.put_conn")
    @patch("services.section_services.get_conn")
    def test_get_sections_by_course_no_sections(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        # Simulate no sections found for the given course_id
        mock_cursor.fetchall.return_value = []

        result = get_sections_by_course(2)  # Assuming 2 has no sections

        mock_cursor.execute.assert_called_once_with(
            ANY, (2,)
        )
        (sql,) = mock_cursor.execute.call_args[0][:1]
        normalized_sql = " ".join(sql.split())
        assert (
            "SELECT s.*, c.name AS course_name FROM sections s JOIN courses c ON s.course_id = c.id WHERE c.id = %s ORDER BY s.id;"
            in normalized_sql
        )

        mock_cursor.fetchall.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == []

        mock_put_conn.reset_mock()

    @patch("services.section_services.put_conn")
    @patch("services.section_services.get_conn")
    def test_get_sections_by_course_with_sections(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_rows = [
            {
                "id": 1,
                "course_id": 2,
                "name": "Section A",
                "course_name": "Course 101",
                "students": [],
            },
            {
                "id": 2,
                "course_id": 2,
                "name": "Section B",
                "course_name": "Course 101",
                "students": [],
            },
        ]

        mock_cursor.fetchall.return_value = expected_rows

        result = get_sections_by_course(2)

        mock_cursor.execute.assert_called_once_with(
            ANY, (2,)
        )
        (sql,) = mock_cursor.execute.call_args[0][:1]
        normalized_sql = " ".join(sql.split())
        assert (
            "SELECT s.*, c.name AS course_name FROM sections s JOIN courses c ON s.course_id = c.id WHERE c.id = %s ORDER BY s.id;"
            in normalized_sql
        )

        mock_cursor.fetchall.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_rows


class TestGetSectionById:
    @patch("services.section_services.put_conn")
    @patch("services.section_services.get_conn")
    def test_get_section_by_id_not_found(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.fetchone.return_value = None

        result = get_section_by_id(2)  # Assuming 2 does not exist

        mock_cursor.execute.assert_called_once_with(
            ANY, (2,)
        )
        (sql,) = mock_cursor.execute.call_args[0][:1]
        normalized_sql = " ".join(sql.split())
        assert (
            "SELECT s.*, c.name AS course_name FROM sections s JOIN courses c ON s.course_id = c.id WHERE s.id = %s ORDER BY s.id;"
            in normalized_sql
        )

        mock_cursor.fetchone.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result is None

        mock_put_conn.reset_mock()  

    @patch("services.section_services.put_conn")
    @patch("services.section_services.get_conn")
    def test_get_section_by_id_found(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_res = {
            "id": 1,
            "course_id": 2,
            "name": "Section A",
            "course_name": "Course 101",
            "students": [],
        }

        mock_cursor.fetchone.return_value = expected_res

        result = get_section_by_id(1)

        mock_cursor.execute.assert_called_once_with(
            ANY, (1,)
        )
        (sql,) = mock_cursor.execute.call_args[0][:1]
        normalized_sql = " ".join(sql.split())
        assert (
            "SELECT s.*, c.name AS course_name FROM sections s JOIN courses c ON s.course_id = c.id WHERE s.id = %s ORDER BY s.id;"
            in normalized_sql
        )

        mock_cursor.fetchone.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)
        
        assert result == expected_res


class TestUpdateSection:
    def setup_method(self):
        self.section_id = 1
        self.data = {"name": "Updated Section Name"}

    @patch("services.section_services.put_conn")
    @patch("services.section_services.get_conn")
    def test_update_section_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_res = {
            "id": self.section_id,
            "course_id": 2,
            "name": self.data["name"],
            "students": [],
        }

        mock_cursor.fetchone.return_value = expected_res

        result = update_section(self.section_id, self.data)

        mock_cursor.fetchone.assert_called_once()
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res

        mock_put_conn.reset_mock()

    @patch("services.section_services.put_conn")
    @patch("services.section_services.get_conn")
    def test_update_section_not_found(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.fetchone.return_value = None

        result = update_section(self.section_id, self.data)

        mock_cursor.fetchone.assert_called_once()
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result is None


class TestDeleteSection:
    @patch("services.section_services.put_conn")
    @patch("services.section_services.get_conn")
    def test_delete_section_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.rowcount = 1

        result = delete_section(1)

        mock_cursor.execute.assert_called_once_with(ANY, (1,))
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == 1

        mock_put_conn.reset_mock()

    @patch("services.section_services.put_conn")
    @patch("services.section_services.get_conn")
    def test_delete_section_not_found(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.rowcount = 0

        result = delete_section(2)  # Assuming 2 does not exist

        mock_cursor.execute.assert_called_once_with(ANY, (2,))
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == 0
