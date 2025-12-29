import psycopg2.errors
import pytest
from unittest.mock import patch, MagicMock, ANY
from services import comment_services
from services.comment_services import *

class TestCreateTeamComment:
    def setup_method(self):
        self.team_id = 1
        self.content = "This is a test comment."      
    
    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_create_team_comment_fail(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.execute.side_effect = psycopg2.errors.NullValueNotAllowed(
            "null value in column 'content' violates not-null constraint"
        )
       
        with pytest.raises(psycopg2.errors.NullValueNotAllowed):
            create_team_comment(
                team_id=self.team_id,
                content=None,
            )
        mock_conn.rollback.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_conn.reset_mock()
        mock_put_conn.reset_mock()
        mock_cursor.reset_mock()
        mock_cursor.execute.side_effect = psycopg2.errors.DatatypeMismatch(
            "Invalid type"
        )

        with pytest.raises(psycopg2.errors.DatatypeMismatch):
            create_team_comment(
                team_id=self.team_id,
                content=123,
            )
        mock_conn.rollback.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_put_conn.reset_mock()

    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_create_team_comment_success(
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
            "team_id": self.team_id,
            "content": self.content,
        }

        mock_cursor.fetchone.return_value = expected_res

        result = create_team_comment(
            team_id=self.team_id,
            content=self.content,
        )

        mock_cursor.fetchone.assert_called_once()
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res

class TestGetCommentsByTeam:
    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_get_comments_by_team_nonexistent_team(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.fetchall.return_value = []

        result = get_comments_by_team(2)

        mock_cursor.fetchall.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == []

        mock_put_conn.reset_mock()

    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_get_team_comments_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_res = [
            {
                "id": 1,
                "team_id": 1,
                "content": "First comment",
            },
            {
                "id": 2,
                "team_id": 2,
                "content": "Second comment",
            },
        ]

        mock_cursor.fetchall.return_value = expected_res

        result = get_comments_by_team(1)

        mock_cursor.fetchall.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res

class TestCreateStudentComment:
    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_create_student_comment_fail(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.execute.side_effect = psycopg2.errors.NullValueNotAllowed(
            "null value in column 'content' violates not-null constraint"
        )
       
        with pytest.raises(psycopg2.errors.NullValueNotAllowed):
            create_student_comment(
                student_id=1,
                content=None,
            )
        mock_conn.rollback.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_conn.reset_mock()
        mock_put_conn.reset_mock()
        mock_cursor.reset_mock()
        mock_cursor.execute.side_effect = psycopg2.errors.DatatypeMismatch(
            "Invalid type"
        )

        with pytest.raises(psycopg2.errors.DatatypeMismatch):
            create_student_comment(
                student_id=1,
                content=123,
            )
        mock_conn.rollback.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_put_conn.reset_mock()

    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_create_student_comment_success(
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
            "student_id": 1,
            "content": "This is a student comment.",
        }

        mock_cursor.fetchone.return_value = expected_res

        result = create_student_comment(
            student_id=1,
            content="This is a student comment.",
        )

        mock_cursor.fetchone.assert_called_once()
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res

class TestGetCommentsByStudent:
    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_get_comments_by_student_nonexistent_student(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.fetchall.return_value = []

        result = get_comments_by_student(2)

        mock_cursor.fetchall.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == []

        mock_put_conn.reset_mock()

    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_get_student_comments_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_res = [
            {
                "id": 1,
                "student_id": 1,
                "content": "First comment",
            },
            {
                "id": 2,
                "student_id": 1,
                "content": "Second comment",
            },
        ]

        mock_cursor.fetchall.return_value = expected_res

        result = get_comments_by_student(1)

        mock_cursor.fetchall.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res

class TestUpdateComment:
    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_update_comment_success(
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
            "content": "Updated comment content.",
        }

        mock_cursor.fetchone.return_value = expected_res

        result = update_comment(
            comment_id=1,
            content="Updated comment content.",
        )

        mock_cursor.fetchone.assert_called_once()
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res

        mock_put_conn.reset_mock()
    
    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_update_comment_fail(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.execute.side_effect = psycopg2.errors.DatatypeMismatch(
            "Invalid type"
        )

        with pytest.raises(psycopg2.errors.DatatypeMismatch):
            update_comment(
                comment_id=1,
                content=123,
            )
        mock_conn.rollback.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_put_conn.reset_mock()

class TestDeleteComment:
    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_delete_comment_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.rowcount = 1

        delete_comment(comment_id=1)
    
        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_put_conn.reset_mock()

    @patch("services.comment_services.put_conn")
    @patch("services.comment_services.get_conn")
    def test_delete_comment_fail(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.execute.side_effect = psycopg2.errors.ForeignKeyViolation(
            "Foreign key violation"
        )

        with pytest.raises(psycopg2.errors.ForeignKeyViolation):
            delete_comment(comment_id=1)
        mock_conn.rollback.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_put_conn.reset_mock()
        