from __future__ import annotations
from copy import copy
from typing import Literal
from pydantic import BaseModel, Field, RootModel, field_serializer
import pyecore.commands as ec
from pyecore.resources import Resource
from pyecore.ecore import EObject
from pyecore.notification import EObserver


class JsonEObject(BaseModel):
    uuid: str | None = None
    path: str | None = None


class JsonCommand(BaseModel): ...


class EObjectCommand(JsonCommand):
    owner: JsonEObject


class FeatureCommand(EObjectCommand):
    feature: str
    value: JsonEObject | int | str | float | bool | None = None


class Set(FeatureCommand):
    command_type: Literal["set"] = "set"


class Add(FeatureCommand):
    command_type: Literal["add"] = "add"
    index: int | None = None


class Remove(FeatureCommand):
    command_type: Literal["remove"] = "remove"
    index: int | None = None


class Move(FeatureCommand):
    command_type: Literal["move"] = "move"
    from_index: int | None = None
    to_index: int


class Delete(EObjectCommand):
    command_type: Literal["delete"] = "delete"


class Compound(JsonCommand):
    command_type: Literal["compound"] = "compound"
    commands: list[Compound | Delete | Move | Remove | Add | Set]


class AnyCommand(RootModel):
    root: Compound | Delete | Move | Remove | Add | Set = Field(
        discriminator="command_type"
    )


def deserialize_command(
    command: Compound | Delete | Move | Remove | Add | Set, context: Resource
):
    match command:
        case (Set() | Remove() | Move() | Add() | Delete()) as cmd:
            for eobject in context.contents[0].eAllContents():
                if eobject._internal_id == cmd.owner.uuid:
                    resolved = eobject
                    break
            else:
                resolved = None
            return getattr(ec, cmd.__class__.__name__)(
                owner=resolved,
                **cmd.model_dump(
                    exclude={"command_type", "owner"},
                    exclude_none=True,
                    exclude_unset=True,
                ),
            )
        case Compound() as compound:
            return ec.Compound(
                *(deserialize_command(x, context) for x in compound.commands)
            )


class Registry:
    Add = Add
    Set = Set
    Remove = Remove
    Move = Move
    Delete = Delete
    Compound = Compound


def serialize(obj):
    match obj:
        case EObject() as o:
            return JsonEObject(uuid=o._internal_id, path=o.eURIFragment())
        case (
            ec.Set() | ec.Add() | ec.Remove() | ec.Move() | ec.Add() | ec.Delete()
        ) as cmd:
            cls = getattr(Registry, cmd.__class__.__name__)
            fields = [
                k
                for k in cls.model_fields.keys()
                if k not in ("command_type", "feature")
            ]
            dct = {k: serialize(getattr(cmd, k)) for k in fields}
            dct["feature"] = cmd.feature.name
            return cls(**dct)
        case ec.Compound() as compound:
            return Compound(commands=[serialize(c) for c in compound])
    return obj


class CommandRecorder(EObserver):
    def __init__(self, notifier):
        super().__init__(notifier=notifier)
        self.recording = False
        self.records = []

    def notifyChanged(self, notification):
        if self.recording:
            self.records.append(notification)
            return

    def start_recording(self, clean=False):
        self.recording = True
        if clean:
            self.records = []

    def stop_recording(self, clean=False):
        self.recording = False
        if clean:
            self.records = []

    def flush(self):
        records = self.records
        self.records = []
        return records


def ultra_shallow_copy(o: EObject):
    cpy = copy(o)
    cpy.dyn_inst = cpy  # type: ignore
    return cpy


def serialize_notification(n):
    return Notification(
        kind=n.kind.name.lower(),
        notifier=serialize(n.notifier),  # type: ignore
        feature=n.feature.name,
        old=serialize(n.old),  # type: ignore
        new=serialize(n.new),  # type: ignore
    )


class Notification(BaseModel):
    kind: (
        Literal["add"]
        | Literal["add_many"]
        | Literal["move"]
        | Literal["remove"]
        | Literal["remove_many"]
        | Literal["set"]
        | Literal["unset"]
    )
    notifier: JsonEObject
    feature: str
    old: JsonEObject | int | str | float | bool | None = None
    new: JsonEObject | int | str | float | bool | None = None
