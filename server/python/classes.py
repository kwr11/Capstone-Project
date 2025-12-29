from typing import Optional, TypedDict


class Comment(TypedDict):
    id: int
    team_id: Optional[int]
    student_id: Optional[int]
    content: str
    created_at: str


class Label(TypedDict):
    id: int
    owner_id: Optional[str]
    color: Optional[str]
    name: Optional[str]


class Student(TypedDict):
    id: int
    section_id: int
    team_id: Optional[int]
    name: str
    email: Optional[str]
    major: Optional[str]
    leadership: Optional[int]
    expertise: Optional[int]
    work_with: list[str]
    dont_work_with: list[str]
    labels: list[Label]
    created_at: str

class Team(TypedDict):
    id: int
    name: str
    course_id: int
    created_at: str
    labels: list[Label]
    students: list[Student]


class Section(TypedDict):
    id: int
    course_id: int
    name: str
    students: list[Student]
    created_at: str


class Course(TypedDict):
    id: int
    owner_id: str
    name: str
    code: Optional[str]
    term: Optional[str]
    sections: list[Section]
    created_at: str
