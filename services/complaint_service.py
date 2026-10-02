from uuid import uuid4

from models.student import Student
from models.complaint import Complaint, ComplaintStatus
from repositories.complaint_repository import ComplaintRepository


class ComplaintService:

    def __init__(self):
        self.repository = ComplaintRepository()

    def submit_complaint(
        self,
        student_id,
        student_name,
        student_email,
        title,
        description,
        category
    ):
        student = Student(
            student_id,
            student_name,
            student_email
        )

        complaint_id = "CMP-" + uuid4().hex[:8].upper()

        complaint = Complaint(
            complaint_id,
            student,
            title,
            description,
            category
        )

        self.repository.save(complaint)

        return complaint

    def get_complaint(self, complaint_id):
        return self.repository.find_by_id(complaint_id)

    def get_all_complaints(self):
        return self.repository.get_all()

    def update_status(self, complaint_id, status):
        complaint = self.repository.find_by_id(complaint_id)

        if complaint is None:
            return None

        complaint.update_status(status)

        self.repository.update_status(
            complaint_id,
            status
        )

        return complaint