import json
from pathlib import Path
from fastapi import APIRouter, FastAPI, HTTPException
from fastapi.routing import APIRoute
from .commands import (
    AnyCommand,
    CommandRecorder,
    Notification,
    deserialize_command,
    serialize,
    serialize_notification,
    ultra_shallow_copy,
)
from pyecore.resources import ResourceSet
from pyecore.commands import CommandStack
from pygeppetto.model.model_serializer import serialize as serialize_pygeppetto_model

# Stateful APP..
rset = ResourceSet()
sessions = {}

# We enable the uuids by default for json
json_serializer = ResourceSet.resource_factory["json"]
ResourceSet.resource_factory["json"] = lambda uri: json_serializer(uri, use_uuid=True)


def snake2camel(route: APIRoute):
    name = route.endpoint.__name__
    route.name = name
    names = name.split("_")
    camel_name = "".join((names[0], *(n.capitalize() for n in names[1:])))
    return camel_name


app = FastAPI(
    generate_unique_id_function=snake2camel, separate_input_output_schemas=False
)
api_router = APIRouter(prefix="/api")


@api_router.post(
    "/model/{model_name}/commands/execute",
    response_model=list[Notification],
    tags=["commands"],
)
async def execute_command(model_name: str, command: AnyCommand):
    if model_name not in sessions:
        raise HTTPException(
            status_code=404, detail=f"There is no session for {model_name}"
        )
    model, stack, recorder = sessions[model_name]
    command = deserialize_command(command.root, model)  # type: ignore
    recorder.start_recording()
    stack.execute(command)
    recorder.stop_recording()

    return [serialize_notification(n) for n in recorder.flush()]


@api_router.get(
    "/model/{model_name}/commands",
    response_model=dict[int, AnyCommand],
    tags=["commands"],
)
async def list_commands(model_name: str):
    if model_name not in sessions:
        raise HTTPException(
            status_code=404, detail=f"There is no session for {model_name}"
        )
    _, stack, _ = sessions[model_name]
    return {i: serialize(cmd) for i, cmd in enumerate(stack.stack)}


@api_router.get(
    "/model/{model_name}/commands/{command_id}",
    response_model=AnyCommand,
    tags=["commands"],
)
async def detail_commands(model_name: str, command_id: int):
    if model_name not in sessions:
        raise HTTPException(
            status_code=404, detail=f"There is no session for {model_name}"
        )
    _, stack, _ = sessions[model_name]
    return serialize(stack.stack[command_id])


@api_router.get(
    "/model/{model_name}",
    tags=["model"],
)
async def load_model(model_name: str):
    if model_name in sessions:
        (resource, _, _) = sessions[model_name]
        return json.loads(
            serialize_pygeppetto_model(ultra_shallow_copy(resource.contents[0]))
        )

    path = Path(__file__).resolve().parent.parent / "models" / f"{model_name}.xmi"
    resource = rset.get_resource(f"{path}", use_uuid=True)

    sessions[model_name] = (
        resource,
        CommandStack(),
        CommandRecorder(notifier=resource),
    )
    return json.loads(
        serialize_pygeppetto_model(ultra_shallow_copy(resource.contents[0]))
    )


app.include_router(api_router)
