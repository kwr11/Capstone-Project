from datetime import timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token
from db.db import get_conn, put_conn
import bcrypt
import os

auth_controller = Blueprint("auth", __name__)
jwt = JWTManager()


def init_jwt(app):
    app.config["JWT_SECRET_KEY"] = os.getenv(
        "JWT_SECRET_KEY", "sda0s9ea89f7ds9ad8fae7f9asd8kjchga12s4"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)
    jwt.init_app(app)


@auth_controller.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    conn = get_conn()
    try:
        cur = conn.cursor()

        cur.execute("SELECT id FROM instructors WHERE email = %s", (email,))
        if cur.fetchone():
            cur.close()
            return jsonify({"error": "User already exists"}), 409

        hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
        cur.execute(
            "INSERT INTO instructors (email, password_hash) VALUES (%s, %s) RETURNING id",
            (email, hashed_pw),
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
    finally:
        put_conn(conn)

    return jsonify({"message": "Registration successful", "user_id": user_id}), 201


@auth_controller.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT id, email, password_hash FROM instructors WHERE email = %s",
            (email,),
        )
        user = cur.fetchone()
        cur.close()
    finally:
        put_conn(conn)

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    user_id, email, password_hash = user

    if not bcrypt.checkpw(password.encode(), password_hash.encode()):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity=str(user_id), additional_claims={"email": email}
    )
    return jsonify({"access_token": access_token}), 200
