import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from database.database import create_tables
from models.complaint import ComplaintStatus
from services.complaint_service import ComplaintService
from email_service import send_complaint_confirmation

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(
    title="Student Complaint System",
    description="A system for submitting and managing student complaints.",
    version="1.0.0",
    lifespan=lifespan
)


app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)


complaint_service = ComplaintService()


class ComplaintRequest(BaseModel):
    student_id: str
    student_name: str
    student_email: str
    title: str
    description: str
    category: str


class StatusRequest(BaseModel):
    status: ComplaintStatus


async def safe_send_confirmation(email: str, name: str, complaint_id: str):
    """Nagpapadala ng email nang hindi nagko-crash ang request kapag pumalya."""
    try:
        await send_complaint_confirmation(email, name, complaint_id)
    except Exception as e:
        logger.error(f"Failed to send confirmation email: {e}")


@app.get("/")
def home():
    return FileResponse("static/index.html")


@app.post("/complaints")
async def submit_complaint(
    request: ComplaintRequest,
    background_tasks: BackgroundTasks
):

    complaint = complaint_service.submit_complaint(
        request.student_id,
        request.student_name,
        request.student_email,
        request.title,
        request.description,
        request.category
    )

    background_tasks.add_task(
        safe_send_confirmation,
        request.student_email,
        request.student_name,
        complaint.complaint_id
    )

    return complaint.get_details()

@app.get("/complaints")
def get_all_complaints(student_id: str | None = None):
    complaints = complaint_service.get_all_complaints()

    if student_id:
        complaints = [
            c for c in complaints
            if c.student.student_id == student_id
        ]

    return [c.get_details() for c in complaints]


@app.get("/complaints/{complaint_id}")
def get_complaint(complaint_id: str):

    complaint = complaint_service.get_complaint(
        complaint_id
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return complaint.get_details()


@app.put("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str,
    request: StatusRequest
):

    complaint = complaint_service.update_status(
        complaint_id,
        request.status
    )

    if complaint is None:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return complaint.get_details()