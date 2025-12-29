from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from psycopg2.extras import RealDictCursor
from db.db import get_conn, put_conn
from extensions import BadRequestException, check_exists_and_owned
from services import course_services, section_services, student_services

student_controller = Blueprint("student", __name__)


@student_controller.route(
    "/course/<string:course_id>/section/<string:section_id>/student", methods=["POST"]
)
@jwt_required()
def create_students(course_id: int, section_id: int):
    raw_section = section_services.get_section_by_id(section_id)
    section = check_exists_and_owned(raw_section, path_parts=[course_id, section_id])

    raw_student_data = request.get_json()

    # Validate shape of student data
    for student in raw_student_data:
        if "name" not in student:
            raise BadRequestException()

    created_data = []

    for student in raw_student_data:
        new_student = student_services.create_student(section["id"], student)
        created_data.append(new_student)

    return jsonify(created_data), 201


@student_controller.route(
    "/course/<string:course_id>/section/<string:section_id>/student", methods=["GET"]
)
@jwt_required()
def list_students_by_section(course_id: int, section_id: int):
    raw_section = section_services.get_section_by_id(section_id)
    section = check_exists_and_owned(raw_section, path_parts=[course_id, section_id])

    students = student_services.get_students_by_section(section["id"])

    return jsonify(students), 200


@student_controller.route(
    "/course/<string:course_id>/section/<string:section_id>/student/<string:student_id>",
    methods=["GET"],
)
@jwt_required()
def get_student(course_id: int, section_id: int, student_id: int):
    raw_student = student_services.get_student_by_id(student_id)
    student = check_exists_and_owned(
        raw_student, path_parts=[course_id, section_id, student_id]
    )

    return jsonify(student), 200


@student_controller.route(
    "/course/<string:course_id>/section/<string:section_id>/student/<string:student_id>",
    methods=["PATCH"],
)
@jwt_required()
def update_student(course_id: int, section_id: int, student_id: int):
    data = request.get_json()

    if not data:
        raise BadRequestException()

    student = student_services.get_student_by_id(student_id)
    check_exists_and_owned(student, path_parts=[course_id, section_id, student_id])

    updated_student = student_services.update_student(student_id, data)
    return jsonify(updated_student), 200


@student_controller.route(
    "/course/<int:course_id>/section/<int:section_id>/student", methods=["PATCH"]
)
@jwt_required()
def bulk_update_students(course_id: int, section_id: int):
    raw_section = section_services.get_section_by_id(section_id)
    section = check_exists_and_owned(raw_section, path_parts=[course_id, section_id])

    data = request.get_json()

    if not data or not isinstance(data, list):
        raise BadRequestException()

    for item in data:
        if "email" not in item:
            raise BadRequestException()

    changed = student_services.bulk_update_students(section["id"], data)

    return jsonify(changed)


@student_controller.route(
    "/course/<int:course_id>/section/move_students", methods=["PATCH"]
)
@jwt_required()
def bulk_move_students(course_id: int):
    data = request.get_json()

    # Ensures some student moves have been passed into the data
    if not data or "moves" not in data or not isinstance(data["moves"], list):
        raise BadRequestException()

    # Type enforcement for each move
    for move in data["moves"]:
        if (
            "sectionId" not in move or
            "studentId" not in move or
            "teamId" not in move or
            not isinstance(move["sectionId"], int) or
            not isinstance(move["studentId"], int) or
            not isinstance(move["teamId"], int)
        ):
            raise BadRequestException()

    changed = []
    checked_sections = []
    conn = get_conn()

    try:
        for i in range(len(data["moves"])):
            section_id = data["moves"][i]["sectionId"]
            student_id = data["moves"][i]["studentId"]
            team_id = data["moves"][i]["teamId"]

            if (
                not isinstance(section_id, int) or
                not isinstance(student_id, int) or
                not isinstance(team_id, int)
            ):
                raise BadRequestException()

            # Optimization to prevent rechecking previously authorized sections
            if section_id not in checked_sections:
                raw_section = section_services.get_section_by_id(section_id)
                check_exists_and_owned(raw_section, path_parts=[course_id, section_id])
                checked_sections.append(section_id)

            changed.append(student_services.update_student(
                student_id=student_id,
                data={
                    "team_id": team_id
                },
                conn=conn,
            ))

        conn.commit()
    finally:
        put_conn(conn)

    return jsonify(changed)


@student_controller.route(
    "/course/<string:course_id>/section/<string:section_id>/student/<string:student_id>",
    methods=["DELETE"],
)
@jwt_required()
def delete_student(course_id: int, section_id: int, student_id: int):
    raw_student = student_services.get_student_by_id(student_id)
    student = check_exists_and_owned(
        raw_student, path_parts=[course_id, section_id, student_id]
    )

    student_services.delete_student(student["id"])
    return jsonify({"status": 204, "message": "Student deleted"}), 204
