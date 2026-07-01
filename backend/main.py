
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import shutil, os

from rag.loader import load_document
from rag.vectorstore import create_vectorstore
from rag.chain import ask_question
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

db = None

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, example="What is the meal per diem?")


class ChatResponse(BaseModel):
    answer: str

@app.post("/upload")
async def upload(file: UploadFile):

    os.makedirs("uploads", exist_ok=True)
    path = f"uploads/{file.filename}"

    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    docs = load_document(path)

    global db
    db = create_vectorstore(docs)

    return {"message": "PDF processed successfully"}


@app.post("/chat", response_model=ChatResponse)
async def chat(payload: ChatRequest):

    global db

    if db is None:
        return {
            "error":"Please upload PDF first"
        }

    answer = ask_question(
        db,
        payload.question
    )

    return {"answer": answer}
