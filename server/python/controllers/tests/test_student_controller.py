from unittest.mock import MagicMock, patch
from flask.testing import FlaskClient


def payload(times: int):
    return [
        {"email": "test@test.com", "work_with": ["Isaac Maddox"]} for _ in range(times)
    ]


@patch("controllers.student_controller.check_exists_and_owned")
@patch("controllers.student_controller.student_services")
@patch("controllers.student_controller.section_services")
def test_bulk_update_route(
    mock_section_services,
    mock_student_services,
    mock_check_exists_and_owned,
    test_client,
):
    raw_section = {"id": 1, "name": "Example Section", "course_id": 1}
    mock_section_services.get_section_by_id.return_value = raw_section
    mock_student_services.bulk_update_students = MagicMock()
    mock_student_services.bulk_update_students.return_value = payload(10)
    mock_check_exists_and_owned.return_value = raw_section

    resp = test_client.patch(
        "/course/1/section/1/student",
        json=payload(10),
    )
    resp_data = resp.get_json()

    # Make sure the controller is just spitting back what the service sends
    assert len(resp_data) == 10
    # Make sure the request was successful
    assert resp.status_code == 200
