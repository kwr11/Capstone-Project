import pytest
from ...app import app
from flask import Flask
from flask_jwt_extended import create_access_token


@pytest.fixture()
def test_app():
    app.config["SECRET_KEY"] = "boo"

    with app.app_context():
        yield app


@pytest.fixture()
def test_client(test_app):
    test_app.config["JWT_SECRET_KEY"] = "test-secret"
    client = test_app.test_client()

    # push context so create_access_token works
    with test_app.app_context():
        token = create_access_token(identity="1")

    client.environ_base["HTTP_AUTHORIZATION"] = f"Bearer {token}"

    return client
