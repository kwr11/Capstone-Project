from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from db.db import get_conn
from extensions import BadRequestException, check_exists_and_owned
from services import course_services, team_services


team_controller = Blueprint("team", __name__)


@team_controller.route(
    "/course/<string:course_id>/team", methods=["POST"]
)
@jwt_required()
def create_teams(course_id: int):
    data = request.get_json()
    name = data.get("name")

    if not name:
        raise BadRequestException()
    
    raw_course = course_services.get_course_by_id(course_id)
    course = check_exists_and_owned(raw_course, path_parts=[course_id])
    team = team_services.create_team(course["id"], name)

    return jsonify(team), 201


@team_controller.route(
    "/course/<string:course_id>/team/bulk_create", methods=["POST"]
)
@jwt_required()
def bulk_create_teams(course_id: int):
    data = request.get_json()
    team_count = data.get("teamCount", 0)
    prefix = data.get("prefix")

    if prefix is None:
        raise BadRequestException()

    if team_count <= 0:
        raise BadRequestException("At least one team must be selected")
    elif team_count > 100:
        raise BadRequestException("A maximum of 100 teams may be created")

    raw_course = course_services.get_course_by_id(course_id)
    course = check_exists_and_owned(raw_course, path_parts=[course_id])

    conn = get_conn()

    teams = [
        team_services.create_team(
            course_id=course["id"],
            name=f"{prefix}{i+1}",
            conn=conn,
        ) for i in range(team_count)
    ]

    return jsonify(teams), 201


@team_controller.route(
    "/course/<string:course_id>/team", methods=["GET"])
@jwt_required()
def list_teams(course_id: int):
    raw_course = course_services.get_course_by_id(course_id)
    course = check_exists_and_owned(raw_course, path_parts=[course_id])
    teams = team_services.get_teams_by_course(course["id"])

    return jsonify(teams), 200


@team_controller.route(
    "/course/<string:course_id>/team/<string:team_id>", methods=["GET"]
)
@jwt_required()
def get_team(course_id: int, team_id: int):
    raw_team = team_services.get_team_by_id(team_id)
    team = check_exists_and_owned(raw_team, path_parts=[course_id, team_id])

    return jsonify(team), 200


@team_controller.route(
    "/course/<string:course_id>/team/<string:team_id>", methods=["PATCH"]
)
@jwt_required()
def update_team(team_id: int, course_id: int):
    data = request.get_json()

    if not data:
        raise BadRequestException()

    raw_team = team_services.get_team_by_id(team_id)
    team = check_exists_and_owned(raw_team, path_parts=[course_id, team_id])
    updated_team = team_services.update_team(team["id"], data)

    return jsonify(updated_team), 200


@team_controller.route(
    "/course/<string:course_id>/team/<string:team_id>", methods=["DELETE"]
)
@jwt_required()
def delete_team(course_id: int, team_id: int):
    raw_team = team_services.get_team_by_id(team_id)
    team = check_exists_and_owned(raw_team, path_parts=[course_id, team_id])
    team_services.delete_team(team["id"])

    return jsonify({"status": 204, "message": "Team deleted"}), 204


@team_controller.route(
    "/course/<string:course_id>/team/bulk_delete", methods=["DELETE"]
)
@jwt_required()
def bulk_delete_teams(course_id: int):
    raw_course = course_services.get_course_by_id(course_id)
    check_exists_and_owned(raw_course, path_parts=[course_id])
    team_services.batch_delete_teams(course_id)

    return jsonify({"status": 204, "message": "Teams deleted"}), 204
