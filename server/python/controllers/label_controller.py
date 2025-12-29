from typing import Any
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt, jwt_required
from extensions import (
    BadRequestException,
    check_exists_and_owned,
    ForbiddenException,
)
from services import label_services
from services.student_services import check_student_is_owned
from services.team_services import check_team_is_owned

label_controller = Blueprint("label", __name__)
label_assign_controller = Blueprint("label_assign", __name__)

@label_controller.route("/label", methods=["POST"])
@jwt_required()
def create_label():
    data: dict[str, Any] = request.get_json()
    name: str | None = data.get("name")
    color: str | None = data.get("color")

    if not name or not color:
        raise BadRequestException()

    current_user = get_jwt()
    label = label_services.create_label(current_user["sub"], name, color)
    
    return jsonify(label), 201


@label_controller.route("/label", methods=["GET"])
@jwt_required()
def list_labels():
    current_user = get_jwt()
    labels = label_services.get_labels(current_user["sub"])

    return jsonify(labels), 200


@label_controller.route("/label/<int:label_id>", methods=["PATCH"])
@jwt_required()
def update_label(label_id: int):
    data = request.get_json()

    if not data:
        raise BadRequestException()

    raw_label = label_services.get_label_by_id(label_id)

    label = check_exists_and_owned(raw_label)

    updated = label_services.update_label(label["id"], data)
    return jsonify(updated), 200


@label_controller.route("/label/<string:label_id>", methods=["DELETE"])
@jwt_required()
def delete_label(label_id: int):
    raw_label = label_services.get_label_by_id(label_id)

    label = check_exists_and_owned(raw_label)

    label_services.delete_label(label["id"])
    return "", 204


@label_assign_controller.route("/label/assign", methods=["POST"])
@jwt_required()
def assign_label():
    data: dict[str, Any] = request.get_json()

    label_ids: list[int] | None = data.get("labelIds")
    team_id: int | None = data.get("teamId")
    student_id: int | None = data.get("studentId")

    if label_ids is None or (not team_id and not student_id):
        raise BadRequestException()

    current_user = get_jwt()
    if team_id:
        check_team_is_owned(team_id, current_user["sub"])
    else:
        check_student_is_owned(student_id, current_user["sub"])

    current_user = get_jwt()
    existing_labels = label_services.get_labels(current_user["sub"])
    existing_label_ids = [label["id"] for label in existing_labels]

    for label_id in label_ids:
        if label_id not in existing_label_ids:
            raise ForbiddenException()

    if team_id:
        labels = label_services.assign_team_labels(label_ids, team_id)
    else:
        labels = label_services.assign_student_labels(label_ids, student_id)

    return jsonify(labels), 200
