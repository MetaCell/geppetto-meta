from fastapi import FastAPI
from pydantic import BaseModel

api = FastAPI()


class Command(BaseModel):
    ...


class CommandExecution(BaseModel):
    status: str


@api.get("/command/", response_model=CommandExecution)
async def command():
    return CommandExecution(status="OK")
