import psycopg2.errors
import pytest
from unittest.mock import patch, MagicMock, ANY
from services.course_services import *


class TestCreateCourse:
    def setup_method(self):
        self.owner_id = "1"
        self.name = "Course Name"
        self.code = "TST0000"
        self.term = "Fall 2025"

    @patch("services.course_services.put_conn")
    @patch("services.course_services.get_conn")
    @patch("services.course_services._fill_course_children")
    def test_create_course_fail(
        self,
        mock__fill_course_children,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()

        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
        mock_cursor.execute.side_effect = psycopg2.errors.NullValueNotAllowed(
            "null value in column 'name' violates not-null constraint"
        )

        mock__fill_course_children.return_value = None

        # Test with incomplete params
        with pytest.raises(psycopg2.errors.NullValueNotAllowed):
            create_course(
                owner_id=self.owner_id,
                name=None,
                code=self.code,
                term=self.term,
            )
        mock_conn.rollback.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_conn.reset_mock()
        mock_put_conn.reset_mock()
        mock_cursor.reset_mock()
        mock_cursor.execute.side_effect = psycopg2.errors.DatatypeMismatch(
            "Invalid type"
        )

        # Test with incorrect parameter types
        with pytest.raises(psycopg2.errors.DatatypeMismatch):
            create_course(
                owner_id=self.owner_id,
                name=1,
                code="CEN3031",
                term=self.term,
            )
        mock_conn.rollback.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_put_conn.reset_mock()

    @patch("services.course_services.put_conn")
    @patch("services.course_services.get_conn")
    def test_create_course_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()

        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_res = {
            "owner_id": self.owner_id,
            "name": self.name,
            "code": self.code,
            "term": self.term,
        }

        mock_cursor.fetchone.return_value = expected_res

        # Successful test
        res = create_course(
            owner_id=self.owner_id,
            name=self.name,
            code=self.code,
            term=self.term,
        )

        # SQL assertions
        mock_cursor.execute.assert_called_once_with(
            ANY, (self.owner_id, self.name, self.code, self.term)
        )
        (sql,) = mock_cursor.execute.call_args[0][:1]
        assert "INSERT INTO courses (owner_id, name, code, term)" in sql
        assert "VALUES (%s, %s, %s, %s)" in sql

        # Function call assertions
        mock_cursor.fetchone.assert_called_once()
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        # Result assertion
        assert res == expected_res


class TestGetCourses:
    def setup_method(self):
        self.owner_id = "1"
        self.name = "Course 1"
        self.code = "TST0000"
        self.term = "Fall 2025"

    @patch("services.course_services.put_conn")
    @patch("services.course_services.get_conn")
    def test_get_courses_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_rows = [
            {"id": 1, "name": self.name, "code": self.code, "term": self.term},
            {"id": 2, "name": "Course 2", "code": "TST0001", "term": "Spring 2026"},
        ]

        mock_cursor.fetchall.return_value = expected_rows

        res = get_courses(int(self.owner_id))

        mock_cursor.execute.assert_called_once_with(
            ANY, (int(self.owner_id),)
        )
        (sql,) = mock_cursor.execute.call_args[0][:1]
        normalized_sql = " ".join(sql.split())
        assert "SELECT * FROM courses WHERE owner_id = %s ORDER BY id;" in normalized_sql

        mock_cursor.fetchall.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert res == expected_rows

        mock_put_conn.reset_mock()

    @patch("services.course_services.put_conn")
    @patch("services.course_services.get_conn")
    def test_get_courses_owner_mismatch(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        # Simulate no courses found for the given owner_id
        mock_cursor.fetchall.return_value = []

        res = get_courses(2)  # Assuming 2 has no courses

        mock_cursor.execute.assert_called_once_with(
            ANY, (2,)
        )
        (sql,) = mock_cursor.execute.call_args[0][:1]
        normalized_sql = " ".join(sql.split())
        assert "SELECT * FROM courses WHERE owner_id = %s ORDER BY id;" in normalized_sql

        assert res == []

        mock_put_conn.assert_called_once_with(mock_conn)
        mock_cursor.fetchall.assert_called_once()
        

class TestGetCourseById:
    def setup_method(self):
        self.course_id = 1
        self.owner_id = "1"
        self.name = "Course Name"
        self.code = "TST0000"
        self.term = "Fall 2025"

    @patch("services.course_services.put_conn")
    @patch("services.course_services.get_conn")
    def test_get_course_by_id_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_res = {
            "id": self.course_id,
            "owner_id": self.owner_id,
            "name": self.name,
            "code": self.code,
            "term": self.term,
        }

        mock_cursor.fetchone.return_value = expected_res

        res = get_course_by_id(self.course_id)

        mock_cursor.execute.assert_called_once_with(
            ANY, (self.course_id,)
        )
        (sql,) = mock_cursor.execute.call_args[0][:1]
        normalized_sql = " ".join(sql.split())
        assert "SELECT * FROM courses WHERE id = %s;" in normalized_sql

        mock_put_conn.assert_called_once_with(mock_conn)
        mock_cursor.fetchone.assert_called_once()

        assert res == expected_res

        mock_put_conn.reset_mock()

    @patch("services.course_services.put_conn")
    @patch("services.course_services.get_conn")
    def test_get_course_by_id_not_found(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.fetchone.return_value = None

        res = get_course_by_id(2)  # Assuming 2 does not exist

        mock_cursor.execute.assert_called_once_with(
            ANY, (2,)
        )
        (sql,) = mock_cursor.execute.call_args[0][:1]
        normalized_sql = " ".join(sql.split())
        assert "SELECT * FROM courses WHERE id = %s;" in normalized_sql

        mock_put_conn.assert_called_once_with(mock_conn)
        mock_cursor.fetchone.assert_called_once()

        assert res is None


class TestUpdateCourse:
    @patch("services.course_services.put_conn")
    @patch("services.course_services.get_conn")
    def test_update_course_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        course_id = 1
        data = {"name": "Updated Course Name", "code": "TST9999"}
        expected_result = {
            "id": course_id,
            "owner_id": 1,
            "name": "Updated Course Name",
            "code": "TST9999",
            "term": "Fall 2025",
        }

        mock_cursor.fetchone.return_value = expected_result

        result = update_course(course_id, data)

        mock_cursor.execute.assert_called_once()
        mock_conn.commit.assert_called_once()
        assert result == expected_result
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_put_conn.reset_mock()

    @patch("services.course_services.put_conn")
    @patch("services.course_services.get_conn")
    def test_update_course_no_valid_fields(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        course_id = 1
        data = {"invalid_field": "Some Value"}

        result = update_course(course_id, data)

        mock_cursor.execute.assert_not_called()
        mock_conn.commit.assert_not_called()
        assert result is None
        mock_put_conn.assert_called_once_with(mock_conn)


class TestDeleteCourse:
    @patch("services.course_services.put_conn")
    @patch("services.course_services.get_conn")
    def test_delete_course_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.rowcount = 1
        result = delete_course(1)

        mock_cursor.execute.assert_called_once_with(ANY, (1,))
        mock_conn.commit.assert_called_once()
        assert result == 1
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_put_conn.reset_mock()

    @patch("services.course_services.put_conn")
    @patch("services.course_services.get_conn")
    def test_delete_course_not_found(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.rowcount = 0
        result = delete_course(2)  # Assuming 2 does not exist

        mock_cursor.execute.assert_called_once_with(ANY, (2,))
        mock_conn.commit.assert_called_once()
        assert result == 0
        mock_put_conn.assert_called_once_with(mock_conn)

"""references: 
https://docs.pytest.org/en/stable/index.html
https://www.psycopg.org/docs/errors.html
"""
