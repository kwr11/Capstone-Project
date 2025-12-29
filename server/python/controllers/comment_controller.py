from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import BadRequestException, check_exists_and_owned
from services import comment_services

comment_controller = Blueprint("comment", __name__)

@comment_controller.route(
    "/team/<string:team_id>/comment", methods=["POST"]
)
@jwt_required()
def create_team_comment(team_id: int):
    data = request.get_json()
    content = data.get("content")

    if not content:
        raise BadRequestException()
    
    comment = comment_services.create_team_comment(team_id, content)

    return jsonify(comment), 201


@comment_controller.route(
    "/team/<string:team_id>/comment", methods=["GET"]
)
@jwt_required()
def list_team_comments(team_id: int):
    comments = comment_services.get_comments_by_team(team_id)

    return jsonify(comments), 200


@comment_controller.route(
    "/student/<string:student_id>/comment", methods=["POST"]
)
@jwt_required()
def create_student_comment(student_id: int):
    data = request.get_json()
    content = data.get("content")

    if not content:
        raise BadRequestException()
    
    comment = comment_services.create_student_comment(student_id, content)

    return jsonify(comment), 201


@comment_controller.route(
    "/student/<string:student_id>/comment", methods=["GET"]
)
@jwt_required()
def list_student_comments(student_id: int):
    comments = comment_services.get_comments_by_student(student_id)

    return jsonify(comments), 200


@comment_controller.route(
    "/comment/<string:comment_id>", methods=["PATCH"]
)
@jwt_required()
def update_comment(comment_id: int):
    data = request.get_json()
    content = data.get("content")

    if not content:
        raise BadRequestException()

    updated_comment = comment_services.update_comment(comment_id, content)

    return jsonify(updated_comment), 200


@comment_controller.route(
    "/comment/<string:comment_id>", methods=["DELETE"]
)
@jwt_required()
def delete_comment(comment_id: int):
    comment_services.delete_comment(comment_id)

    return "", 204
