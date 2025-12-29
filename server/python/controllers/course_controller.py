from typing import Any
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, jwt_required
from extensions import (
    BadRequestException,
    check_exists_and_owned,
)
from services import course_services

course_controller = Blueprint("course", __name__)


@course_controller.route("/course", methods=["POST"])
@jwt_required()
def create_course():
    data: dict[str, Any] = request.get_json()
    name: str | None = data.get("name")
    code: str | None = data.get("code")
    term: str | None = data.get("term")

    if not name:
        raise BadRequestException()

    current_user = get_jwt()

    course = course_services.create_course(current_user["sub"], name, code, term)
    return jsonify(course), 201


@course_controller.route("/course", methods=["GET"])
@jwt_required()
def list_courses():
    current_user = get_jwt()
    courses = course_services.get_courses(current_user["sub"])

    return jsonify(courses)


@course_controller.route("/course/<string:course_id>", methods=["PATCH"])
@jwt_required()
def update_course(course_id: int):
    data = request.get_json()

    if not data:
        raise BadRequestException()

    raw_course = course_services.get_course_by_id(course_id)
    course = check_exists_and_owned(raw_course)
    updated = course_services.update_course(course["id"], data)

    return jsonify(updated), 200


@course_controller.route("/course/<string:course_id>", methods=["GET"])
@jwt_required()
def get_course_id(course_id: int):
    raw_course = course_services.get_course_by_id(course_id)
    course = check_exists_and_owned(raw_course)

    return jsonify(course)


@course_controller.route("/course/<string:course_id>", methods=["DELETE"])
@jwt_required()
def delete_course(course_id: int):
    raw_course = course_services.get_course_by_id(course_id)
    course = check_exists_and_owned(raw_course)
    course_services.delete_course(course["id"])

    return "", 204


"""references:
https://www.geeksforgeeks.org/python/using-jwt-for-user-authentication-in-flask/
"""
