import psycopg2.errors
import pytest
from unittest.mock import patch, MagicMock, ANY
from services.label_services import *


class TestCreateLabel:
    def setup_method(self):
        self.owner_id = "1"
        self.name = "Urgent"
        self.color = "Red"

    @patch("services.label_services.put_conn")
    @patch("services.label_services.get_conn")
    def test_create_label_fail(
        self,
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

        with pytest.raises(psycopg2.errors.NullValueNotAllowed):
            create_label(
                owner_id=self.owner_id,
                name=None,
                color=self.color,
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
            create_label(
                owner_id=self.owner_id,
                name=self.name,
                color=123,
            )
        mock_conn.rollback.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)

    @patch("services.label_services.put_conn")
    @patch("services.label_services.get_conn")
    def test_create_label_success(
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
            "color": self.color,
        }

        mock_cursor.fetchone.return_value = expected_res

        res = create_label(
            owner_id=self.owner_id,
            name=self.name,
            color=self.color,
        )

        mock_cursor.execute.assert_called_once_with(
            ANY, (self.owner_id, self.name, self.color)
        )
        (sql,) = mock_cursor.execute.call_args[0][:1]
        assert "INSERT INTO labels (owner_id, name, color)" in sql
        assert "VALUES (%s, %s, %s)" in sql

        mock_conn.commit.assert_called_once()
        mock_put_conn.assert_called_once_with(mock_conn)
        mock_cursor.fetchone.assert_called_once()

        assert res == expected_res


class TestGetLabels:
    def setup_method(self):
        self.owner_id = "2"

    @patch("services.label_services.put_conn")
    @patch("services.label_services.get_conn")
    def test_get_labels_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        expected_rows = [
            {"id": 1, "owner_id": self.owner_id, "name": "Urgent", "color": "Red"},
            {"id": 2, "owner_id": self.owner_id, "name": "Optional", "color": "Green"},
        ]

        mock_cursor.fetchall.return_value = expected_rows

        res = get_labels(self.owner_id)

        mock_cursor.execute.assert_called_once_with(
            ANY, (self.owner_id,)
        )
        (sql,) = mock_cursor.execute.call_args[0][:1]
        assert "SELECT *" in sql and "FROM labels" in sql

        assert res == expected_rows
        mock_put_conn.assert_called_once_with(mock_conn)


class TestUpdateLabel:
    @patch("services.label_services.put_conn")
    @patch("services.label_services.get_conn")
    def test_update_label_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        label_id = 1
        data = {"name": "High Priority", "color": "Orange"}
        expected_result = {"id": label_id, "name": "High Priority", "color": "Orange"}

        mock_cursor.fetchone.return_value = expected_result

        result = update_label(label_id, data)

        mock_cursor.execute.assert_called_once()
        mock_conn.commit.assert_called_once()
        assert result == expected_result
        mock_put_conn.assert_called_once_with(mock_conn)


class TestDeleteLabel:
    @patch("services.label_services.put_conn")
    @patch("services.label_services.get_conn")
    def test_delete_label_success(
        self,
        mock_get_conn,
        mock_put_conn,
    ):
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_conn.return_value = mock_conn
        mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

        mock_cursor.rowcount = 1
        result = delete_label(1)

        mock_cursor.execute.assert_called_once_with(ANY, (1,))
        mock_conn.commit.assert_called_once()
        assert result == 1
        mock_put_conn.assert_called_once_with(mock_conn)