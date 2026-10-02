from database.database import get_connection
from models.student import Student
from models.complaint import Complaint, ComplaintStatus


class ComplaintRepository:

    def save(self, complaint):
        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute("""
            INSERT INTO complaints (
                complaint_id,
                student_id,
                student_name,
                student_email,
                title,
                description,
                category,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            complaint.complaint_id,
            complaint.student.student_id,
            complaint.student.name,
            complaint.student.email,
            complaint.title,
            complaint.description,
            complaint.category,
            complaint.status.value
        ))

        connection.commit()
        connection.close()

    def find_by_id(self, complaint_id):
        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute("""
            SELECT * FROM complaints
            WHERE complaint_id = ?
        """, (complaint_id,))

        row = cursor.fetchone()

        connection.close()

        if row is None:
            return None

        student = Student(
            row["student_id"],
            row["student_name"],
            row["student_email"]
        )

        complaint = Complaint(
            row["complaint_id"],
            student,
            row["title"],
            row["description"],
            row["category"]
        )

        complaint.status = ComplaintStatus(row["status"])

        return complaint

    def get_all(self):
        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute("""
            SELECT * FROM complaints
        """)

        rows = cursor.fetchall()

        connection.close()

        complaints = []

        for row in rows:
            student = Student(
                row["student_id"],
                row["student_name"],
                row["student_email"]
            )

            complaint = Complaint(
                row["complaint_id"],
                student,
                row["title"],
                row["description"],
                row["category"]
            )

            complaint.status = ComplaintStatus(row["status"])

            complaints.append(complaint)

        return complaints

    def update_status(self, complaint_id, status):
        connection = get_connection()

        cursor = connection.cursor()

        cursor.execute("""
            UPDATE complaints
            SET status = ?
            WHERE complaint_id = ?
        """, (status.value, complaint_id))

        connection.commit()

        connection.close()