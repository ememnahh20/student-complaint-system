from database.database import create_tables
from models.student import Student
from models.complaint import Complaint
from repositories.complaint_repository import ComplaintRepository


create_tables()

student = Student(
    "2026-001",
    "Joem Salve",
    "joem@example.com"
)

complaint = Complaint(
    "CMP-TEST-001",
    student,
    "Broken Fan",
    "The classroom fan is not working.",
    "Facility"
)

repository = ComplaintRepository()

repository.save(complaint)

print("Complaint saved!")

saved_complaint = repository.find_by_id("CMP-TEST-001")

print("Complaint found!")
print(saved_complaint.get_details())