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
from pyecore.resources.json import JsonOptions
from pygeppetto.model.model import ISynchable
from pygeppetto.model.model_serializer import IgnoreSyncMapper, SynchableMapper
from pygeppetto.model.geppetto_resource import GeppettoResource
from pygeppetto.model.utils.bytesuri import BytesURI

# Stateful APP..
rset = ResourceSet()
sessions = {}

# We enable the uuids by default for json
rset.resource_factory["json"] = lambda uri, *args, **kwargs: GeppettoResource(
    uri, *args, indent=2, **kwargs
)


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
            serialize_pygeppetto_model(resource.contents[0], resource_set=rset)
        )

    path = Path(__file__).resolve().parent.parent / "models" / f"{model_name}.xmi"
    resource = rset.get_resource(f"{path}", use_uuid=True)
    root = resource.contents[0]
    json_model = serialize_pygeppetto_model(root, resource_set=rset)

    sessions[model_name] = (
        root.eResource,
        CommandStack(),
        CommandRecorder(notifier=root.eResource),
    )
    return json.loads(json_model)


app.include_router(api_router)


# This is a fix version of geppetto_serialize
def serialize_pygeppetto_model(
    geppetto_model, onlySerialiseDelta=False, resource_set=None
):
    # we now create a resource to save the geppetto model and serialize it to a JSON string
    rset = resource_set if resource_set else ResourceSet()
    uri = BytesURI("geppetto_model.json")
    rset.resource_factory["*"] = lambda uri: GeppettoResource(uri, indent=2)
    resource = rset.create_resource(uri)
    resource.append(geppetto_model)
    if onlySerialiseDelta:
        resource.register_mapper(ISynchable, SynchableMapper())
    else:
        resource.register_mapper(ISynchable, IgnoreSyncMapper())

    resource.save(options={JsonOptions.SERIALIZE_DEFAULT_VALUES: True})
    return uri.getvalue().decode("utf-8")
