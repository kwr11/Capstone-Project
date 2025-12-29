from typing import TypeVar
from flask_jwt_extended import get_jwt
from classes import Course, Section, Student


class FALAFELException(Exception):
    status: int
    message: str


class BadRequestException(FALAFELException):
    status = 400
    message = "Bad request"


class NotFoundException(FALAFELException):
    status = 404
    message = "Not Found"


class ForbiddenException(FALAFELException):
    status = 403
    message = "Forbidden"


class UnauthorizedException(FALAFELException):
    status = 401
    message = "Unauthorized"


T = TypeVar("T", Course, Section, Student)


def check_exists_and_owned(item: T | None, path_parts: list[int] | None = None) -> T:
    """Check if the passed in item is not None and is owned by the current user.

    Args:
      item (Course | Section | Student | None): The entity to check ownership of
      path_parts (list[int]): A list of all relevant parameters, in order [course_id, section_id, student_id]

    Returns:
      The item (non-None) if existent and owned by current user

    Raises:
      NotFoundException: If the item is None
      UnauthorizedException: If the current user doesn't own the item
    """
    if path_parts is None:
        path_parts = []

    if item is None:
        raise NotFoundException()

    user = get_jwt()

    if item.get("owner_id"):
        # Course item
        if user["sub"] != item.get("owner_id"):
            raise ForbiddenException()
    elif item.get("course_id"):
        # Section item
        from services import course_services

        course = course_services.get_course_by_id(course_id=item.get("course_id", -1))

        if not course or course["id"] != int(path_parts[0]):
            raise NotFoundException()

        check_exists_and_owned(course, path_parts=path_parts)
    elif item.get("section_id"):
        # Student item
        from services import section_services

        section = section_services.get_section_by_id(item.get("section_id", -1))

        if not section or section["id"] != int(path_parts[1]):
            raise NotFoundException()

        check_exists_and_owned(section, path_parts=path_parts)

    return item
