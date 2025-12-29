from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import BadRequestException, check_exists_and_owned
from services import section_services, course_services

section_controller = Blueprint("section", __name__)


@section_controller.route("/course/<string:course_id>/section", methods=["POST"])
@jwt_required()
def create_section(course_id: int):
    data = request.get_json()
    name = data.get("name")

    if not name:
        raise BadRequestException()

    raw_course = course_services.get_course_by_id(course_id)
    course = check_exists_and_owned(raw_course, path_parts=[course_id])
    section = section_services.create_section(course["id"], name)

    return jsonify(section), 201


@section_controller.route("/course/<string:course_id>/section", methods=["GET"])
@jwt_required()
def list_sections(course_id: int):
    raw_course = course_services.get_course_by_id(course_id)
    course = check_exists_and_owned(raw_course, path_parts=[course_id])
    sections = section_services.get_sections_by_course(course["id"])

    return jsonify(sections), 200


@section_controller.route(
    "/course/<string:course_id>/section/<string:section_id>", methods=["GET"]
)
@jwt_required()
def get_section(course_id: int, section_id: int):
    raw_section = section_services.get_section_by_id(section_id)
    section = check_exists_and_owned(raw_section, path_parts=[course_id, section_id])

    return jsonify(section), 200


@section_controller.route(
    "/course/<string:course_id>/section/<string:section_id>", methods=["PATCH"]
)
@jwt_required()
def update_section(section_id: int, course_id: int):
    data = request.get_json()

    if not data:
        raise BadRequestException()

    raw_section = section_services.get_section_by_id(section_id)
    section = check_exists_and_owned(raw_section, path_parts=[course_id, section_id])
    updated_section = section_services.update_section(section["id"], data)

    return jsonify(updated_section), 200


@section_controller.route(
    "/course/<string:course_id>/section/<string:section_id>", methods=["DELETE"]
)
@jwt_required()
def delete_section(course_id: int, section_id: int):
    raw_section = section_services.get_section_by_id(section_id)
    section = check_exists_and_owned(raw_section, path_parts=[course_id, section_id])
    section_services.delete_section(section["id"])

    return jsonify({"status": 204, "message": "Section deleted"}), 204
