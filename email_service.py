import os
from email.message import EmailMessage
from pathlib import Path

import aiosmtplib
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")


async def send_complaint_confirmation(
    student_email: str,
    student_name: str,
    complaint_id: str
):
    message = EmailMessage()

    message["From"] = os.getenv("EMAIL_USERNAME")
    message["To"] = student_email
    message["Subject"] = "JRCC Complaint Submission Confirmation"

    message.set_content(
        f"""
Hello {student_name},

Your complaint has been successfully submitted
to the JRCC Student Complaint System.

Complaint Reference ID:
{complaint_id}

You can use this reference ID to track your complaint.

Thank you,
JRCC Student Complaint System
"""
    )

    await aiosmtplib.send(
        message,
        hostname="smtp.gmail.com",
        port=465,
        use_tls=True,
        username=os.getenv("EMAIL_USERNAME"),
        password=os.getenv("EMAIL_PASSWORD"),
        timeout=30,
    )