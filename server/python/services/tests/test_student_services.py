import psycopg2.errors
import pytest
from unittest.mock import MagicMock, patch
from services.student_services import *

@staticmethod
def baseData() -> list[dict]: 
    return {
            "name": "Trent Reed",
            "email": "test123@your_email.com",
        }

@staticmethod
def expected_res_fetchone() -> dict:
    return {
        "id": 1,
        "section_id": 1,
        "name": "Trent Reed",
        "email": "test123@your_email.com",
        "work_with": [],
        "dont_work_with": [],
        "labels": [],
        "comments": [],
        "languages": [],
        "frameworks": [],
    }

@staticmethod
def expected_res_fetchall() -> list[dict]:
    return [expected_res_fetchone()]

class TestCreateStudent:
    @staticmethod
    def baseData() -> list[dict]: 
        return {
                "name": "Trent Reed",
                "email": "test123@your_email.com",
            }

    @patch("services.student_services.put_conn")
    @patch("services.student_services.get_conn")
    def test_create_student_success(
        self,
        mock_get_conn: MagicMock,
        mock_put_conn: MagicMock,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()

        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.fetchone.return_value = expected_res_fetchone()
        result = create_student(
            section_id=1,
            data=baseData(),
        )

        mock_cursor.execute.assert_called_once()
        (_, params) = mock_cursor.execute.call_args[0]
        assert list(params) == [1, baseData()["name"], baseData()["email"],]

        (sql,) = mock_cursor.execute.call_args[0][:1]
        normalized_sql = " ".join(sql.split())
        assert "INSERT INTO students (section_id, name, email) VALUES (%s, %s, %s) RETURNING *" in normalized_sql

        mock_cursor.fetchone.assert_called_once()
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res_fetchone()

        mock_put_conn.reset_mock()

    @patch("services.student_services.put_conn")
    @patch("services.student_services.get_conn")
    def test_create_student_failure_invalid_key(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        with pytest.raises(BadRequestException):
            create_student(
                section_id=1,
                data={"invalid_key": "value"},
            )

        mock_cursor.execute.assert_not_called()
        mock_conn.commit.assert_not_called()


class TestGetStudentsBySection:
    @patch("services.student_services.put_conn")
    @patch("services.student_services.get_conn")
    def test_get_students_by_section(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor           

        mock_cursor.fetchall.return_value = expected_res_fetchall()
        result = get_students_by_section(section_id=1,)

        mock_cursor.execute.assert_called_once()
        (_, params) = mock_cursor.execute.call_args[0]
        assert list(params) == [1]

        mock_cursor.fetchall.assert_called_once()   
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res_fetchall()

        mock_put_conn.reset_mock()
    
    @patch("services.student_services.put_conn")
    @patch("services.student_services.get_conn")
    def test_get_students_by_section_no_students(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor           

        mock_cursor.fetchall.return_value = []
        result = get_students_by_section(section_id=1,)

        mock_cursor.execute.assert_called_once()
        (_, params) = mock_cursor.execute.call_args[0]
        assert list(params) == [1]

        mock_cursor.fetchall.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == []


class TestGetStudentById:
    @patch("services.student_services.put_conn")
    @patch("services.student_services.get_conn")
    def test_get_student_by_id(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor           

        mock_cursor.fetchone.return_value = expected_res_fetchone()
        result = get_student_by_id(student_id=1,)

        mock_cursor.execute.assert_called_once()
        (_, params) = mock_cursor.execute.call_args[0]
        assert list(params) == [1]

        mock_cursor.fetchone.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res_fetchone()

        mock_put_conn.reset_mock()

    @patch("services.student_services.put_conn")
    @patch("services.student_services.get_conn")
    def test_get_student_by_id_not_found(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor           

        mock_cursor.fetchone.return_value = None
        result = get_student_by_id(student_id=1,)

        mock_cursor.execute.assert_called_once()
        (_, params) = mock_cursor.execute.call_args[0]
        assert list(params) == [1]

        mock_cursor.fetchone.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)
        
        assert result is None


class TestBulkUpdateStudents:
    @staticmethod
    def payload(times: int):
        return [
            {"email": "test@test.com", "work_with": ["Isaac Maddox"]} for _ in range(times)
        ]

    @pytest.mark.parametrize("times", [10, 20, 30])
    @patch("services.student_services.put_conn")
    @patch("services.student_services.get_conn")
    @patch("services.student_services.update_student")
    def test_bulk_update_students(
        self,
        mock_update_student: MagicMock,
        mock_get_conn: MagicMock,
        mock_put_conn: MagicMock,
        times: int,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor
        mock_conn.cursor.return_value.__exit__.return_value = False

        bulk_update_students(1, TestBulkUpdateStudents.payload(times))

        # Make sure a cursor was opened only once per student
        assert mock_conn.cursor.call_count == times
        # Make sure N = len(payload) queries were issued
        # (because we mocked update_student, so those queries are never issued)
        assert mock_cursor.execute.call_count == times
        # Make sure our update_student mock is called once per student
        assert mock_update_student.call_count == times
        # Make sure the connection is only put once
        # (to avoid an unkeyed connection error)
        mock_put_conn.assert_called_once()

class TestDeleteStudent:
    @patch("services.student_services.put_conn")
    @patch("services.student_services.get_conn")
    def test_delete_student(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor       

        mock_cursor.rowcount = 1    

        result = delete_student(student_id=1,)

        mock_cursor.execute.assert_called_once()
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == 1

        mock_put_conn.reset_mock()

    @patch("services.student_services.put_conn")
    @patch("services.student_services.get_conn")
    def test_delete_student_failure(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor      

        mock_cursor.rowcount = 0     

        result = delete_student(2)  # Assuming 2 does not exist

        mock_cursor.execute.assert_called_once()
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == 0
