import json
from pathlib import Path
from fastapi import APIRouter, FastAPI
from fastapi.routing import APIRoute
from pydantic import BaseModel
from .commands import AnyCommand, deserialize, serialize
from pyecore.resources import ResourceSet
from pyecore.commands import CommandStack
from pygeppetto.model.model_serializer import serialize as serialize_pygeppetto_model

# Stateful APP..
rset = ResourceSet()
sessions = {}

# We enable the uuids by default for json and xmi
json_serializer = ResourceSet.resource_factory["json"]
xmi_serializer = ResourceSet.resource_factory["xmi"]
ResourceSet.resource_factory["json"] = lambda uri: json_serializer(uri, use_uuid=True)
ResourceSet.resource_factory["xmi"] = lambda uri: xmi_serializer(uri, use_uuid=True)


def snake2camel(route: APIRoute):
    name = route.name.split("_")
    camel_name = "".join((name[0], *(n.capitalize() for n in name[1:])))
    return camel_name


app = FastAPI(
    generate_unique_id_function=snake2camel, separate_input_output_schemas=False
)
api_router = APIRouter(prefix="/api")


class Command(BaseModel): ...


class CommandExecution(BaseModel):
    status: str


@api_router.post(
    "/model/{model_name}/commands/execute",
    response_model=CommandExecution,
    tags=["commands"],
    name="execute_command",
)
async def command_execution(model_name: str, command: AnyCommand):
    if model_name not in sessions:
        ...  # TODO
        return
    model, stack = sessions[model_name]
    command = deserialize(command.root, model)  # type: ignore
    stack.execute(command)
    return CommandExecution(status="OK")


@api_router.get(
    "/model/{model_name}/commands",
    response_model=dict[int, AnyCommand],
    tags=["commands"],
    name="list_commands",
)
async def list_commands(model_name: str):
    if model_name not in sessions:
        ...  # TODO
        return
    _, stack = sessions[model_name]
    cmds = {}
    for i, cmd in enumerate(stack.stack):
        cmds[i] = serialize(cmd)
    return cmds


@api_router.get(
    "/model/{model_name}/commands/{command_id}",
    response_model=AnyCommand,
    tags=["commands"],
    name="detail_command",
)
async def detail_commands(model_name: str, command_id: int):
    if model_name not in sessions:
        ...  # TODO
        return
    _, stack = sessions[model_name]
    return serialize(stack.stack[command_id])


@api_router.get(
    "/model/{model_name}",
    tags=["model"],
    name="load_model",
)
async def load_model(model_name: str):
    if model_name in sessions:
        (resource, _) = sessions[model_name]
        return json.loads(serialize_pygeppetto_model(resource.contents[0]))
    path = Path(__file__).resolve().parent.parent / "models" / f"{model_name}.xmi"

    resource = rset.get_resource(f"{path}")
    sessions[model_name] = (resource, CommandStack())
    return json.loads(serialize_pygeppetto_model(resource.contents[0]))


app.include_router(api_router)
