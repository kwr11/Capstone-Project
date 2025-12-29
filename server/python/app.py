import traceback
from flask import Flask, jsonify
from auth.auth import init_jwt
from controllers.course_controller import course_controller
from controllers.section_controller import section_controller
from controllers.student_controller import student_controller
from controllers.team_controller import team_controller
from auth.auth import auth_controller
from controllers.label_controller import label_controller, label_assign_controller
from controllers.comment_controller import comment_controller
from extensions import FALAFELException
from psycopg2.errors import UniqueViolation

app = Flask(__name__)
init_jwt(app)

app.register_blueprint(course_controller)
app.register_blueprint(section_controller)
app.register_blueprint(student_controller)
app.register_blueprint(auth_controller)
app.register_blueprint(team_controller)
app.register_blueprint(label_controller)
app.register_blueprint(comment_controller)
app.register_blueprint(label_assign_controller)


@app.route("/", methods=["GET"])
def hello():
    return {"status": "ok", "service": "CRM Flask API"}, 200


@app.errorhandler(FALAFELException)
def handle_custom_exception(error: FALAFELException):
    print(error)
    return jsonify({"status": error.status, "error": error.message}), error.status


@app.errorhandler(UniqueViolation)
def handle_unique_violation(error: UniqueViolation):
    print(error)
    return jsonify({"status": 409, "error": "Conflict"}), 409


@app.errorhandler(Exception)
def handle_error(error):
    print(error)
    traceback.print_exc(error)
    return jsonify({"status": 500, "error": "Internal Server Error"}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
