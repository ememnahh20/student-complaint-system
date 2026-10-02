from enum import Enum


class ComplaintStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    RESOLVED = "Resolved"


class Complaint:
    def __init__(
        self,
        complaint_id,
        student,
        title,
        description,
        category
    ):
        self.complaint_id = complaint_id
        self.student = student
        self.title = title
        self.description = description
        self.category = category
        self.status = ComplaintStatus.PENDING

    def update_status(self, new_status):
        self.status = new_status

    def get_details(self):
        return {
            "complaint_id": self.complaint_id,
            "student": self.student.get_info(),
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "status": self.status.value
        }