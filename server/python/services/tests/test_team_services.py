import psycopg2.errors
import pytest
from unittest.mock import patch, MagicMock, ANY
from services import team_services
from services.team_services import *

class TestCreateTeam:
    def setup_method(self):
        self.name = "Team 1"
        self.course_id = "1"
        
    
    @patch("services.team_services.put_conn")
    @patch("services.team_services.get_conn")
    @patch("services.team_services._fill_team_children")
    def test_create_team_null_values(
        self,
        mock__fill_team_children,
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

        mock__fill_team_children.return_value = None

        # Test with empty name
        with pytest.raises(psycopg2.errors.NullValueNotAllowed):
            create_team(
                course_id=self.course_id,
                name=None,
            )
        mock_conn.rollback.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_conn.reset_mock()
        mock_put_conn.reset_mock()
        mock_cursor.reset_mock()
        mock_cursor.execute.side_effect = psycopg2.errors.DatatypeMismatch(
            "Invalid type"
        )

        mock_put_conn.reset_mock()

    @patch("services.team_services.put_conn")
    @patch("services.team_services.get_conn")
    @patch("services.team_services._fill_team_children")
    def test_create_team_success(
        self,
        mock__fill_team_children,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_res = {
            "id": 1,
            "name": self.name,
            "course_id": self.course_id,
        }

        mock_cursor.fetchone.return_value = expected_res
        mock__fill_team_children.return_value = None

        result = create_team(
            course_id=self.course_id,
            name=self.name,
        )

        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res

class TestGetTeamsByCourse:
    def setup_method(self):
        self.course_id = 1

    @patch("services.team_services.put_conn")
    @patch("services.team_services.get_conn")
    @patch("services.team_services._fill_team_children")
    def test_get_teams_by_course_success(
        self,
        mock__fill_team_children,
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
                "name": "Team 1",
                "course_id": self.course_id,
            },
            {
                "id": 2,
                "name": "Team 2",
                "course_id": self.course_id,
            },
        ]

        mock_cursor.fetchall.return_value = expected_res
        mock__fill_team_children.return_value = None

        result = get_teams_by_course(self.course_id)

        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res

        mock_put_conn.reset_mock()

    @patch("services.team_services.put_conn")
    @patch("services.team_services.get_conn")
    def test_get_teams_by_course_not_found(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.fetchall.return_value = []

        result = get_teams_by_course(self.course_id)

        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == []

class TestGetTeamByID:
    def setup_method(self):
        self.team_id = 1

    @patch("services.team_services.put_conn")
    @patch("services.team_services.get_conn")
    @patch("services.team_services._fill_team_children")
    def test_get_team_by_id_success(
        self,
        mock__fill_team_children,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_res = {
            "id": self.team_id,
            "name": "Team 1",
            "course_id": 1,
        }

        mock_cursor.fetchone.return_value = expected_res
        mock__fill_team_children.return_value = None

        result = get_team_by_id(self.team_id)

        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res

        mock_put_conn.reset_mock()

    @patch("services.team_services.put_conn")
    @patch("services.team_services.get_conn")
    def test_get_team_by_id_not_found(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.fetchone.return_value = None

        result = get_team_by_id(self.team_id)

        mock_put_conn.assert_called_once_with(mock_conn)

        assert result is None

class TestUpdateTeam:
    def setup_method(self):
        self.team_id = 1
        self.new_name = "Updated Team Name"

    @patch("services.team_services.put_conn")
    @patch("services.team_services.get_conn")
    @patch("services.team_services._fill_team_children")
    def test_update_team_success(
        self,
        mock__fill_team_children,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_res = {
            "id": self.team_id,
            "name": self.new_name,
            "course_id": 1,
        }

        mock_cursor.fetchone.return_value = expected_res
        mock__fill_team_children.return_value = None

        result = update_team(
            team_id=self.team_id,
            data={"name": self.new_name},
        )

        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        assert result == expected_res

        mock_put_conn.reset_mock()

    @patch("services.team_services.put_conn")
    @patch("services.team_services.get_conn")
    @patch("services.team_services._fill_team_children")
    def test_update_team_no_fields(
        self,
        mock__fill_team_children,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        result = update_team(
            team_id=self.team_id,
            data={},
        )

        mock_put_conn.assert_called_once_with(mock_conn)

        assert result is None

class TestDeleteTeam:
    def setup_method(self):
        self.team_id = 1

    @patch("services.team_services.put_conn")
    @patch("services.team_services.get_conn")
    def test_delete_team_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        delete_team(self.team_id)

        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

        mock_put_conn.reset_mock()